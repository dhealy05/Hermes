import { ContentTypes, Conversation, Message } from '../models'
import { getFile } from './blockstack'
import {
  createNewConversation,
  getConversations,
  getIncomingMessagesForMeta,
  recvMessage,
  saveNewOutbox,
  saveConversationById,
  checkIfConversationExists
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
import { saveLocalPublicIndex, identity } from './identity'

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
    return null
  }

  let sharedSecret = await getSharedSecret(theirIndex.pubkey.data)

  for (const intro of theirIndex.introductions) {
    const theirSecret = decodeText(intro.secret, sharedSecret)

    if (sharedSecret !== theirSecret) {
      continue
    }

    const text = decodeText(intro.text, sharedSecret)
    const filename = decodeText(intro.filename, sharedSecret)
    const contacts = JSON.parse(decodeText(intro.contacts, sharedSecret))
    const groupSecret = decodeText(intro.groupSecret, sharedSecret)

    if (contacts.length > 2) {
      sharedSecret = groupSecret
    }

    if (await checkIfConversationExists(filename,
                                        contacts,
                                        text,
                                        sharedSecret,
                                        userId)) {
      continue
    }

    await saveNewOutbox(filename)
    await createNewConversation(filename, contacts, text, sharedSecret, userId)

    for (const contactId of contacts) {
      if (contactId !== identity().username) {
        await addContactById(contactId)
      }
    }

    return userId
  }

  return null
}

export async function discoverMessage(metadata, username) {
  const convoId = Conversation.getId(metadata)
  const incoming = await getIncomingMessagesForMeta(metadata, username)

  if (!incoming) {
    return []
  }

  return (await Promise.all(incoming.messages.map(async msg => {
    const decoded = new Message({
      ...msg,
      content: decodeText(msg.content, metadata.secret),
      sender: decodeText(msg.sender, metadata.secret),
      sentAt: decodeText(msg.sentAt, metadata.secret),
      timestamp: decodeText(msg.timestamp, metadata.secret)
    })

    const convo = await recvMessage(convoId, decoded)

    if (!convo) {
      return null
    }

    return decoded
  })))
    .filter(msg => !!msg) // strip nulls
}
