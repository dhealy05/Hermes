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
  encodeText,
  saveKeysFromDiffieHellman
} from './keys'
import { saveLocalPublicIndex, identity } from './identity'
import { checkTyping } from './statusIndicators'
import { saveJson } from './blockstack'

const crypto = require('crypto')

export async function enableDiscovery() {
  const { pubkey } = await saveKeysFromDiffieHellman()

  const discovery = {
    pubkey,
    introductions: []
  }

  await saveLocalPublicIndex(discovery)
  localStorage.setItem('discovery', true)
  enableStatusPage()
}

export async function enableStatusPage(){
  var filename = crypto.randomBytes(48).toString('base64')
  var secret = crypto.randomBytes(48).toString('base64')
  await saveJson("status.json", {filename: filename, secret: secret})
  var lastSeen = new Date().toISOString()
  var encoded = encodeText(lastSeen, secret)
  await saveJson(filename, {lastSeen: encoded}, {isPublic: true})
}

export async function discoverConversation(userId) {
  const theirIndex = await getPublicIndexForId(userId)

  if (!theirIndex) {
    return null
  }

  var sharedSecret = await getSharedSecret(theirIndex.pubkey.data)
  for (const intro of theirIndex.introductions) {
    const theirSecret = decodeText(intro.secret, sharedSecret)

    if (sharedSecret !== theirSecret) {
      continue
    }

    const text = decodeText(intro.text, sharedSecret)
    const filename = decodeText(intro.filename, sharedSecret)
    const contacts = JSON.parse(decodeText(intro.contacts, sharedSecret))
    const groupSecret = decodeText(intro.groupSecret, sharedSecret)

    if(contacts.length > 2){sharedSecret = groupSecret}

    if(await checkIfConversationExists(filename, contacts, text, sharedSecret, userId)){continue}

    await saveNewOutbox(filename, sharedSecret)

    const conversation = await createNewConversation(filename, contacts, text, sharedSecret, userId)

    for (var i = 0; i < contacts.length; i++){
      if (contacts[i] !== identity().username) {
        await addContactById(contacts[i])
      }
    }

    return conversation
  }

  return null
}

export async function discoverMessage(metadata, username) {
  const convoId = Conversation.getId(metadata)
  const incoming = await getIncomingMessagesForMeta(metadata, username)

  if (!incoming) {
    return []
  }

  var typing = checkTyping(decodeText(incoming.typing, metadata.secret))
  //console.log(typing)

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
