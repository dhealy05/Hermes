import { getJson, saveJson, queryLocalNode } from './blockstack'
import { createMockData } from './createMockData'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  // change to true to hydrate your datastore with MOCK DATA
  if (true) {
    //await createMockData()
    await queryLocalNode("x")
  }
}
