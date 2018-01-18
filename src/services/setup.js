import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { enableDiscovery, discoverConversation } from './discovery'
import { newConversation } from './newConversation'
import { testSecret } from './keys'
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
    discoverConversation("djhealy.id")
    //newConversation("Hey Broham", "djhealy.id")
    //console.log(await getJson("discovery.json", "djhealy.id"))
    //console.log(getJson('public_index.json', { username: 'djhealy.id' }))
    //console.log(getJson('public_index.json', { username: 'fulgid.id' }))
    //console.log(blockstack.lookupProfile("fulgid.id", "http://localhost:6270/v1/names/"))
    //enableDiscovery()
    //discoverConversation("djhealy.id")
    //await createMockData()
  }
}
