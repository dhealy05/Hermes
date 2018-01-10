import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { queryLocalNode } from './discovery'
import { testSecret } from './keys'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  // change to true to hydrate your datastore with MOCK DATA
  if (false) {
    await createMockData()
    //await queryLocalNode("x")
    //testSecret()
  }
}
