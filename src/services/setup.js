import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { enableDiscovery, discoverConversation } from './discovery'
import * as blockstack from 'blockstack'

export async function ensureFilesExist() {
  if (!(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (!(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  // change to true to hydrate your datastore with MOCK DATA
  if (true) {
    //console.log(blockstack.lookupProfile("djhealy.id", "http://localhost:6270/v1/names/"))
    //enableDiscovery()
    discoverConversation("djhealy.id")
    //await createMockData()
    //enableDiscovery()
    //testSecret()
    //appIndex()
  }
}
