import { Conversation } from '../models/conversation'
import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { checkNewMessages } from './onLoad'
import { getLocalPublicIndex, saveLocalPublicIndex } from './identity'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  //checkNewMessages()
}

export async function cleanSlate(){
  await saveJson('conversations.json', { conversations: {} })
  await saveJson('contacts.json', { contacts: {} })
  await createMockData()
  var index = await getLocalPublicIndex()
  index.introductions = []
  await saveLocalPublicIndex(index)
}
