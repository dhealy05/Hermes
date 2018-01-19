import { Conversation, Message } from '../models'
import {
  createNewConversation,
  getConversations,
  getIncomingMessagesForMeta,
  recvMessage,
  saveOutgoingMessages,
  saveConversationById
} from './conversations'
import {
  addContactById,
  getPublicIndexForId
} from './contacts'
import {
  getSharedSecret,
  decodeText,
  saveKeysFromDiffieHellman
} from './keys'
import { saveLocalPublicIndex } from './identity'

export async function enableDiscovery() {
  const { pubkey } = await saveKeysFromDiffieHellman()

  const discovery = {
    pubkey,
    introductions: []
  }

  await saveLocalPublicIndex(discovery)
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
    const filename = decodeText(intro.filename, sharedSecret)
    await saveOutgoingMessages(filename, [])
    await createNewConversation(filename, userId, text, sharedSecret)
    await addContactById(userId)
  }
}

export async function discoverMessage(conversations, userId) {
  //const { conversations } = await getConversations()
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
