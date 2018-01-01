import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  // uncomment to hydrate your datastore
  // await createMockData()
}
