import { Conversation, Contact, Message } from '../models'
import { saveJson, getJson } from './blockstack'
import {
  getConversations,
  getIncomingMessagesForMeta,
  recvMessage,
  saveConversationById
} from './conversations'
import {
  addContactById,
  getPublicIndexForId
} from './contacts'
import {
  getSharedSecret,
  decodeText,
  createKeys,
  saveKeysFromDiffieHellman
} from './keys'
import * as blockstack from 'blockstack'

export async function enableDiscovery() {
  const { pubkey } = await saveKeysFromDiffieHellman()

  const discovery = {
    pubkey,
    introductions: []
  }

  await saveJson('public_index.json', discovery, { isPublic: true })
  localStorage.setItem('discovery', true)
}

export async function discoverConversation(userId) {
  const theirIndex = await getPublicIndexForId(userId)

  if (!theirIndex) {
    return
  }

  const sharedSecret = await getSharedSecret(theirIndex.pubkey.data)

  for (const intro of theirIndex.introductions) {
    const theirSecret = decodeText(intro.secret, sharedSecret)
    if (sharedSecret !== theirSecret) {
      continue
    }

    const text = decodeText(intro.text, sharedSecret)
    const convoId = decodeText(intro.convoId, sharedSecret)
    await saveJson(convoId, { messages: [] }, { isPublic: true })
    await addConversation(convoId, userId, text, sharedSecret)
    await addContactById(userId)
  }
}

async function addConversation(filename, userId, text, sharedSecret) {
  const myConversations = await getConversations()
  const msg = new Message({
    sender: userId,
    content: text,
    sentAt: new Date()
  })

  const convo = new Conversation({
    filename,
    contacts: [userId],
    secret: sharedSecret,
    messages: [msg]
  })

  await saveConversationById(Conversation.getId(convo), convo)
}

export async function discoverMessage(userId) {
  const { conversations } = await getConversations()
  const metadata = conversations[userId]
  const convoId = Conversation.getId(metadata)
  const incoming = await getIncomingMessagesForMeta(metadata)

  if (!incoming) {
    return
  }

  for (const msg of incoming.messages) {
    await recvMessage(convoId, new Message({
      ...msg,
      content: decodeText(msg.content, metadata.secret)
    }))
  }
}
