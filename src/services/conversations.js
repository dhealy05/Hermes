import { Conversation, Message } from '../models'
import { getJson, saveJson } from './blockstack'

export async function getConversations() {
  return getJson('conversations.json')
}

//returns a promise for the given conversation
export async function getConversationById(id) {
  return new Conversation(await getJson(filenameFromId(id)))
}

export async function createNewConversation(contacts, filename, secret) {
  const convo = new Conversation({
    contacts,
    filename,
    secret
  })
  const id = Conversation.getId(convo)

  return saveConversationById(id, convo)
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
  convo.messages.unshift(message)
  return saveConversationById(convoId, convo)
}

export async function recvMessage(convoId, message) {
  if (!(message instanceof Message)) {
    throw new TypeError('must pass Message instance to recvMessage')
  }

  const convo = await getConversationById(convoId)
  convo.messages.unshift(message)
  return saveConversationById(convoId, convo)
}

export function saveOutgoingMessages(filename, messages) {
  return saveJson(
    filename,
    { messages },
    { isPublic: true }
  )
}

export async function getIncomingMessagesForMeta(metadata) {
  const { filename, contacts } = metadata
  const [username] = contacts // TODO: support group chat

  return getJson(filename, { username })
}

const filenameFromId = id => `conversation_${id}.json`
