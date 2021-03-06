import { getJson, saveJson } from './blockstack'
import { checkDiscovery } from './onLoad'
import { enableStatusPage } from './discovery'
//import { initHelper } from './helper'
import { getLocalPublicIndex, saveLocalPublicIndex } from './identity'
import { clearFriendsOnlyContacts } from './contacts'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  await checkDiscovery()
}

export async function resetAll(){
  await enableStatusPage()
  await saveJson('conversations.json', { conversations: {} })
  await saveJson('contacts.json', { contacts: {} })
  await clearFriendsOnlyContacts()
  //await initHelper()
  window.location.reload()
}

export async function cleanSlate(){
  await saveJson('conversations.json', { conversations: {} })
  await saveJson('contacts.json', { contacts: {} })
  await clearFriendsOnlyContacts()
  const index = await getLocalPublicIndex()
  index.introductions = []
  await saveLocalPublicIndex(index)
  window.location.reload()
}
