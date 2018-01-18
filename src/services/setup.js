import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { enableDiscovery, discoverConversation, discoverMessage } from './discovery'
import { newConversation } from './newConversation'
import { newMessage } from './newMessage'
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
    //discoverMessage("djhealy.id")
    //newMessage("Yoooooo", "djhealy.id")
    //console.log(await getJson("conversation_mike.json"))
    //discoverConversation("djhealy.id")
    //newConversation("Hey Broham", "djhealy.id")
    //console.log(await getJson("conversations.json"))
    //console.log(await getJson("discovery.json", "djhealy.id"))
    //console.log(getJson('public_index.json', { username: 'djhealy.id' }))
    //console.log(getJson('public_index.json', { username: 'fulgid.id' }))
    //console.log(blockstack.lookupProfile("fulgid.id", "http://localhost:6270/v1/names/"))
    //enableDiscovery()
    //discoverConversation("djhealy.id")
    //await createMockData()
  }
}
