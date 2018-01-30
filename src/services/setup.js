import { Conversation } from '../models/conversation'
import { getJson, saveJson } from './blockstack'
import { checkDiscovery } from './onLoad'
import { getLocalPublicIndex, saveLocalPublicIndex } from './identity'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  await checkDiscovery()
}

export async function cleanSlate(){
  await saveJson('conversations.json', { conversations: {} })
  await saveJson('contacts.json', { contacts: {} })
  const index = await getLocalPublicIndex()
  index.introductions = []
  await saveLocalPublicIndex(index)
  window.location.reload()
}
