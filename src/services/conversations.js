import {
  ConversationListFile,
  Conversation
} from '../models'
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

const filenameFromId = id => `conversation_${id}.json`
