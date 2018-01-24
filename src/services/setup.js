import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { checkNewMessages } from './onLoad'
import { getLocalPublicIndex, saveLocalPublicIndex } from './identity'

export async function ensureFilesExist({ cleanSlate = false } = {}) {
  if (cleanSlate || !(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (cleanSlate || !(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  if (cleanSlate || true) {
    //await createMockData()
    checkNewMessages()
    setTimeout(checkNewMessages, 60000);
  }
}

export async function cleanSlate(){
  await saveJson('conversations.json', { conversations: {} })
  await saveJson('contacts.json', { contacts: {} })
  await createMockData()
  var index = await getLocalPublicIndex()
  index.introductions = []
  await saveLocalPublicIndex(index)
}
