import * as crypto from 'crypto'
import { ContentTypes, Conversation, Message } from '../models'
import { identity, lookupProfile } from './identity'
import { getJson, saveJson, getFile, saveFile, deleteFile } from './blockstack'
import { encodeText, decodeText } from './keys'
import { getContacts } from './contacts'

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
  sender = identity().username
) {
  const msg = new Message({
    sender,
    content,
    sentAt: new Date()
  })

  var readAt = new Date().toISOString()
  var wasRead = true
  if(sender != identity().username){readAt = ''; wasRead = false}

  //TODO fix getPic
  var pic = await getPicFromContacts(contacts)

  const convo = new Conversation({
    filename,
    contacts: contacts,
    secret: sharedSecret,
    messages: [msg],
    pic: pic,
    readAt: readAt,
    wasRead: wasRead
  })

  return saveConversationById(Conversation.getId(convo), convo)
}

export async function getPicFromContacts(contacts){
  var pic = ''
  for(var i = 0; i < contacts.length; i++){
    if(contacts[i] != identity().username){
      const profile = await lookupProfile(contacts[i])
      if(profile.image != null){pic = profile.image[0].contentUrl}
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

  var boundary = getMessageTimeBoundary(convo.messages)
  var outbox = await getJson(convo.filename, {username: identity().username})

  if(boundary != null){outbox.messages = purgeOutbox(outbox.messages, boundary)}
  //right now this is naive, and only checks the sender's conversations
  // TODO add read receipts for more efficiency

  convo.messages.unshift(message)

  outbox.messages.push(message)

  // TODO is this right?
  if(convoId != identity().username){await saveOutgoingMessages(convo, outbox.messages)}
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
  for(var i = 0; i < messages.length; i++){
    if(messages[i].sender != identity().username){
      return messages[i].sentAt
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

function checkTimestamp(message, messages) {
    for (var i = 0; i < messages.length; i++) {
      if (message.sentAt == messages[i].sentAt){return true}
    }
    return false
}

export async function recvMessage(convoId, message) {
  if (!(message instanceof Message)) {
    throw new TypeError('must pass Message instance to recvMessage')
  }

  const convo = await getConversationById(convoId)
  if (checkTimestamp(message, convo.messages)) {
    return null
  }
  convo.messages.unshift(message)
  convo.wasRead = false
  msgAlert()
  return saveConversationById(convoId, convo)
}

function msgAlert(){
  if(document.title == "Hermes"){
    document.title = "(1) Hermes"
  } else {
    var numArray = document.title.match(/\d+/)
    if(numArray == null || numArray.length == 0){return;}
    var num = parseInt(numArray[0])
    num = num + 1
    document.title = "(" + num.toString() + ") Hermes"
  }
}

export function saveOutgoingMessages(convo, rawMessages, boundary) {
  const messages = [...rawMessages]
  const lastMsg = messages[messages.length - 1]

  messages[messages.length - 1] = new Message({
    ...lastMsg,
    content: encodeText(lastMsg.content, convo.secret),
    sender: encodeText(lastMsg.sender, convo.secret),
    sentAt: encodeText(lastMsg.sentAt, convo.secret),
    timestamp: encodeText(lastMsg.timestamp, convo.secret)
    //contentType: encodeText(msg.contentType, convo.secret)
  })
  return saveJson(
    convo.filename,
    { messages },
    { isPublic: true }
  )
}

export function saveNewOutbox(filename){
  return saveJson(
    filename,
    { messages: [] },
    { isPublic: true }
  )
}

export async function deleteConversation(id){
  const { conversations } = await getConversations()
  const filename = conversations[id].filename
  delete conversations[id]
  await saveJson('conversations.json', conversations)
  const { contacts } = await getContacts()
  delete contacts[id]
  await saveJson('contacts.json', contacts)
  //await deleteFile(filename)
  //await deleteFile(`conversation_${id}.json`)
}

export async function getIncomingMessagesForMeta(metadata, username) {
  const { filename } = metadata
  return getJson(filename, { username })
}

const filenameFromId = id => `conversation_${id}.json`
