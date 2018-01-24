import { ContentTypes, Conversation, Message } from '../models'
import { identity, lookupProfile } from './identity'
import { getJson, saveJson, deleteJson } from './blockstack'
import { encodeText } from './keys'
import { getContacts } from './contacts'

export async function getConversations() {
  return getJson('conversations.json')
}

//returns a promise for the given conversation
export async function getConversationById(id) {
  return new Conversation(await getJson(filenameFromId(id)))
}

export async function createNewConversation(
  filename,
  userId,
  content,
  sharedSecret,
  sender = identity.username()
) {
  const msg = new Message({
    sender,
    content,
    sentAt: new Date()
  })

  const profile = await lookupProfile(userId)
  var pic = ''
  if(profile.image != null){pic = profile.image[0].contentUrl}

  const convo = new Conversation({
    filename,
    contacts: [userId],
    secret: sharedSecret,
    messages: [msg],
    pic: pic
  })

  return saveConversationById(Conversation.getId(convo), convo)
}

export async function saveConversationById(id, convo) {
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
  if(convoId != identity().username){console.log("No Equal");await saveOutgoingMessages(convo, outbox.messages)}
  //await saveOutgoingMessages(convo, outbox.messages)
  return saveConversationById(convoId, convo)
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
  if(checkTimestamp(message, convo.messages)){console.log("got em"); return null;}
  convo.messages.unshift(message)
  return saveConversationById(convoId, convo)
}

export function saveOutgoingMessages(convo, rawMessages, boundary) {
  const messages = rawMessages.map(msg => ({
    ...msg,
    content: encodeText(msg.content, convo.secret),
    sender: encodeText(msg.sender, convo.secret),
    sentAt: encodeText(msg.sentAt, convo.secret),
    timestamp: encodeText(msg.timestamp, convo.secret)
    //contentType: encodeText(msg.contentType, convo.secret)
  }))
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
  //await deleteJson(filename)
  //await deleteJson(`conversation_${id}.json`)
}

export async function getIncomingMessagesForMeta(metadata) {
  const { filename, contacts } = metadata
  const [username] = contacts // TODO: support group chat

  return getJson(filename, { username })
}

const filenameFromId = id => `conversation_${id}.json`
