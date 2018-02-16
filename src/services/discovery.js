import { Conversation, Message } from '../models'
import {
  createNewConversation,
  getIncomingMessagesForMeta,
  recvMessage,
  saveNewOutbox,
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
//import { initHelper } from './helper'
import { saveLocalPublicIndex, identity } from './identity'
import { checkTyping } from './statusIndicators'
import { getJson, saveJson } from './blockstack'
import { getPublicAddress } from './bitcoin'

const crypto = require('crypto')

export async function enableDiscovery() {
  const { pubkey } = await saveKeysFromDiffieHellman()

  const bitcoinAddress = getPublicAddress()

  const discovery = {
    pubkey,
    bitcoinAddress,
    introductions: []
  }

  await saveLocalPublicIndex(discovery)
  localStorage.setItem('discovery', true)
  //initHelper()
  enableStatusPage()
}

export async function enableStatusPage(){
  var filename = crypto.randomBytes(48).toString('base64')
  var secret = crypto.randomBytes(48).toString('base64')
  await saveJson("status.json", {filename: filename, secret: secret})
  var lastSeen = new Date().toISOString()
  var encoded = encodeText(lastSeen, secret)
  await saveJson(filename, {lastSeen: encoded, posts: [], contacts: []}, {isPublic: true})
  return true
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

    const trusted = await handleContacts(contacts)

    const conversation = await createNewConversation(filename, contacts, text, sharedSecret, userId, trusted)

    if(trusted){await saveNewOutbox(filename, sharedSecret)}

    return conversation
  }

  return null
}

export async function handleContacts(contacts){
  const existingContacts = await getJson("contacts.json")
  let trusted = true

  for (const contactId of contacts) {
    if (contactId === identity().username) {
      continue
    }

    const contactEntry = existingContacts.contacts[contactId]

    if (!contactEntry) {
      trusted = false
      await addContactById(contactId, false)
      continue
    }

    trusted = !!(contactEntry.trusted)
  }

  return trusted
}

export async function discoverMessages(metadata, username) {
  const convoId = Conversation.getId(metadata)
  const incoming = await getIncomingMessagesForMeta(metadata, username)

  if (!incoming) {
    return {
      messages: [],
      typing: ''
    }
  }

  const typing = checkTyping(decodeText(incoming.typing, metadata.secret))

  const messages = (await Promise.all(incoming.messages.map(async msg => {
    const decoded = new Message({
      ...msg,
      content: decodeText(msg.content, metadata.secret),
      sender: decodeText(msg.sender, metadata.secret),
      sentAt: decodeText(msg.sentAt, metadata.secret),
      timestamp: decodeText(msg.timestamp, metadata.secret),
      type: decodeText(msg.type, metadata.secret),
      expirationDate: decodeText(msg.expirationDate, metadata.secret),
      paymentStatus: decodeText(msg.paymentStatus, metadata.secret),
      value: decodeText(msg.value, metadata.secret)
    })

    const convo = await recvMessage(convoId, decoded)

    if (!convo) {
      return null
    }

    return decoded
  })))
    .filter(msg => !!msg) // strip nulls

  return {
    messages,
    typing
  }
}
