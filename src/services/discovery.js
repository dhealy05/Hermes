import { Conversation, Message } from '../models'
import {
  createNewConversation,
  getConversations,
  getIncomingMessagesForMeta,
  recvMessage,
  saveNewOutbox,
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
    return false
  }

  const sharedSecret = await getSharedSecret(theirIndex.pubkey.data)
  for (const intro of theirIndex.introductions) {
    const theirSecret = decodeText(intro.secret, sharedSecret)

    if (sharedSecret !== theirSecret) {
      continue
    }

    const text = decodeText(intro.text, sharedSecret)
    const filename = decodeText(intro.filename, sharedSecret)

    await saveNewOutbox(filename)
    await createNewConversation(filename, userId, text, sharedSecret, userId)
    await addContactById(userId)
    return true
  }
  return false
}

export async function discoverMessage(metadata) {
  const convoId = Conversation.getId(metadata)
  const incoming = await getIncomingMessagesForMeta(metadata)

  if (!incoming) {
    return []
  }

  return Promise.all(incoming.messages.map(async msg => {
    const decoded = new Message({
      ...msg,
      content: decodeText(msg.content, metadata.secret),
      sender: decodeText(msg.sender, metadata.secret),
      sentAt: decodeText(msg.sentAt, metadata.secret),
      timestamp: decodeText(msg.timestamp, metadata.secret)
    })

    await recvMessage(convoId, decoded)

    return decoded
  }))
}
