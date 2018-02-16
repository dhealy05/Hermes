import * as crypto from 'crypto'
import { get } from 'lodash'
import { Conversation, Message } from '../models'
import { identity, lookupProfile } from './identity'
import { getJson, saveJson, getFile, saveFile } from './blockstack'
import { encodeText, decodeText } from './keys'
import {
  addContactById,
  getContacts,
  saveContactDataById
} from './contacts'
import { sendBitcoinToIds } from './bitcoin'
import swal from 'sweetalert'

export async function getConversations() {
  return getJson('conversations.json')
}

//returns a promise for the given conversation
export async function getConversationById(id) {
  if (!id) {
    throw new TypeError('missing required parameter `id`')
  }

  return new Conversation(await getJson(filenameFromId(id)))
}

export async function checkIfConversationExists(
  filename,
  contacts,
  content,
  sharedSecret,
  sender = identity().username
) {
  const msg = new Message({
    sender,
    content,
    sentAt: new Date()
  })

  var readAt = new Date().toISOString()
  var wasRead = true
  var pic = ''

  const convo = new Conversation({
    filename,
    contacts: contacts,
    secret: sharedSecret,
    messages: [msg],
    pic: pic,
    readAt: readAt,
    wasRead: wasRead
  })

  const conversations = await getConversations()
  if(conversations.conversations[Conversation.getId(convo)] != null){return true}
  return false
}

export async function createNewConversation(
  filename,
  contacts,
  content,
  sharedSecret,
  sender = identity().username,
  trusted
) {
  const msg = new Message({
    sender,
    content,
    sentAt: new Date()
  })

  let readAt = new Date().toISOString()
  let wasRead = true
  if (sender !== identity().username) {
    readAt = ''
    wasRead = false
  }

  //TODO fix getPic
  var pic = await getPicFromContacts(contacts)

  const convo = new Conversation({
    filename,
    contacts: contacts,
    secret: sharedSecret,
    messages: [msg],
    pic: pic,
    readAt: readAt,
    wasRead: wasRead,
    trusted: trusted
  })

  return saveConversationById(Conversation.getId(convo), convo)
}

export async function getPicFromContacts(contacts){
  const myIdentity = identity()

  if (contacts.length === 1) {
    return get(myIdentity, 'profile.image[0].contentUrl', '')
  }

  let pic = ''

  for (const contactId of contacts) {
    if (contactId === myIdentity.username) {
      continue
    }

    pic = `https://www.hihermes.co/images/avatars/${contactId[0].toLowerCase()}.svg`

    const profile = await lookupProfile(contactId)
    const avatar = get(profile, 'image[0].contentUrl')

    if (avatar) {
      return avatar
    }
  }

  return pic
}

export async function saveConversationById(id, convo) {
  if (!id || typeof id !== 'string') {
    throw new TypeError('missing required string parameter `id`')
  }

  if (!convo || typeof convo !== 'object') {
    throw new TypeError('missing required object parameter `convo`')
  }

  const list = await getConversations()
  list.conversations[id] = Conversation.getMetadata(convo)
  await saveJson('conversations.json', list)
  await saveJson(filenameFromId(id), convo)

  return convo
}

export async function sendMessage(convoId, message) {

  if (!(message instanceof Message)) {
    throw new TypeError('must pass Message instance to sendMessage')
  }

  message.sentAt = new Date().toISOString()

  const convo = await getConversationById(convoId)

  if (message.paymentStatus === 'paid') {
    let finalValue = parseFloat(message.value)

    const bitcoinSuccess = await sendBitcoinToIds(convo.contacts, finalValue)

    if(!bitcoinSuccess){
      swal("Oops! You don't have enough bitcoin for that.")
      return saveConversationById(convoId, convo)
    }

    finalValue = finalValue / (convo.contacts.length-1)
    message.value = finalValue.toString()
  }

  const boundary = getMessageTimeBoundary(convo.messages)
  const outbox = await getJson(convo.filename, {username: identity().username})

  if (!boundary != null) {
    outbox.messages = purgeOutbox(outbox.messages, boundary)
  }
  //right now this is naive, and only checks the sender's conversations
  // TODO add read receipts for more efficiency

  convo.messages.unshift(message)

  outbox.messages.push(message)

  // TODO is this right?
  if (convoId !== identity().username) {
    await saveOutgoingMessages(convo, outbox)
  }

  //await saveOutgoingMessages(convo, outbox.messages)
  return saveConversationById(convoId, convo)
}

export async function uploadFileForOutbox(convoId, file) {
  if (!(file instanceof File)) {
    throw new TypeError('must pass File instance to uploadFile')
  }

  const convo = await getConversationById(convoId)
  const dataUrl = await readFileAsDataUrl(file)
  const filename = crypto.randomBytes(72).toString('base64')

  await saveFile(filename, encodeText(dataUrl, convo.secret), { isPublic: true })

  return filename
}

export async function retrieveFileContentForMessage(message, convoMetadata) {
  const encoded = await getFile(message.content, { username: message.sender, decrypt: false })

  if (!encoded) {
    return null
  }

  return decodeText(encoded, convoMetadata.secret)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

function getMessageTimeBoundary(messages){
  const myId = identity().username

  for (const message of messages) {
    if (message.sender !== myId) {
      return message.sentAt
    }
  }

  return null
}

function purgeOutbox(messages, boundary){
  boundary = new Date(boundary)
  for(var i = 0; i < messages.length; i++){
    if(new Date(messages[i].sentAt) < boundary){
      messages.splice(i, 1)
    }
  }
  return messages
}

function alreadySeenMessageByTimestamp(incomingMessage, messages) {
  for (const sessage of messages) {
    if (sessage.sentAt === incomingMessage.sentAt) {
      return true
    }

    if (incomingMessage.expirationDate
        && new Date(incomingMessage.expirationDate) < new Date()) {
      return true
    }
  }

  return false
}

export async function recvMessage(convoId, message) {
  if (!(message instanceof Message)) {
    throw new TypeError('must pass Message instance to recvMessage')
  }

  const convo = await getConversationById(convoId)
  if (alreadySeenMessageByTimestamp(message, convo.messages)) {
    return null
  }
  convo.messages.unshift(message)
  convo.wasRead = false
  msgAlert()
  return saveConversationById(convoId, convo)
}

function msgAlert(){
  if (document.title === 'Hermes'){
    document.title = '(1) Hermes'
    return
  }

  let alertNumber = parseInt(
    get(document.title.match(/\d+/), '[0]'),
    10
  )

  if (!alertNumber) {
    return
  }
  
  alertNumber = alertNumber + 1
  document.title = `(${alertNumber}) Hermes`
}

export function saveOutgoingMessages(convo, outbox) {
  const rawMessages = outbox.messages
  const messages = [...rawMessages]
  const lastMsg = messages[messages.length - 1]

  messages[messages.length - 1] = new Message({
    ...lastMsg,
    content: encodeText(lastMsg.content, convo.secret),
    sender: encodeText(lastMsg.sender, convo.secret),
    sentAt: encodeText(lastMsg.sentAt, convo.secret),
    timestamp: encodeText(lastMsg.timestamp, convo.secret),
    type: encodeText(lastMsg.type, convo.secret),
    expirationDate: encodeText(lastMsg.expirationDate, convo.secret),
    paymentStatus: encodeText(lastMsg.paymentStatus, convo.secret),
    value: encodeText(lastMsg.value, convo.secret)
  })
  return saveJson(
    convo.filename,
    {
      messages: messages,
      typing: '',
      statusPage: convo.statusPage,
      statusSecret: convo.statusSecret
    },
    { isPublic: true }
  )
}

export async function saveNewOutbox(filename, secret){
  const statusInfo = await getJson('status.json')
  var statusPage = encodeText(statusInfo.filename, secret)
  var statusSecret = encodeText(statusInfo.secret, secret)
  return saveJson(
    filename,
    { messages: [], typing: '', statusPage: statusPage, statusSecret: statusSecret},
    { isPublic: true }
  )
}

//args: conversation data for filename and secret, and to resave as TRUSTED
//UNTRUSTED CONTACTS ONLY
//TODO: Pass in the objects from Redux or whatever, not the IDs--dont download
export async function acknowledgeConversation(conversationOrId) {
  const conversation = typeof conversationOrId === 'string'
                     ? await getConversationById(conversationOrId)
                     : await getConversationById(Conversation.getId(conversationOrId))

  const { contacts: existingContacts } = await getContacts()
  await saveNewOutbox(conversation.filename, conversation.secret)

  for (const contactId of conversation.contacts) {
    if (contactId === identity().username) {
      continue
    }

    const contact = existingContacts[contactId] || await addContactById(contactId, true)
    contact.trusted = true

    await saveContactDataById(contactId, contact)
    //await addFriendsOnlyContactById(contactId)
  }

  conversation.trusted = true
  return saveConversationById(Conversation.getId(conversation), conversation)
}

export async function deleteConversation(id){
  const { conversations } = await getConversations()
  const filename = conversations[id].filename
  delete conversations[id]
  await saveJson('conversations.json', conversations)
  const { contacts } = await getContacts()
  delete contacts[id]
  await saveJson('contacts.json', contacts)
  await saveJson(`conversation_${id}.json`, '')
  await saveJson(
    filename,
    { messages: [], typing: '', statusPage: '', statusSecret: ''},
    { isPublic: true }
  )
  //await deleteFile(filename)
  //await deleteFile(`conversation_${id}.json`)
}

export async function getIncomingMessagesForMeta(metadata, username) {
  const { filename } = metadata
  return getJson(filename, { username })
}

const filenameFromId = id => `conversation_${id}.json`
