import { Conversation, Message } from '../models'
import { getJson, saveJson } from './blockstack'

export async function getConversations() {
  return getJson('conversations.json')
}

//returns a promise for the given conversation
export async function getConversationById(id) {
  return new Conversation(await getJson(filenameFromId(id)))
}

export async function createNewConversation(contactIds) {
  const convo = new Conversation({
    contacts: contactIds
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

const filenameFromId = id => `conversation_${id}.json`
