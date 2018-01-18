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
    //console.log(blockstack.loadUserData())
    //console.log(blockstack.lookupProfile("djhealy.id"))
    //discoverMessage("djhealy.id")
    //console.log(await blockstack.lookupProfile("fulgid.id", "http://localhost:6270/v1/names/"))
    //await createMockData()
    //console.info('SETTING UP')
    //await enableDiscovery()
    //console.info('DISCOVERY ENABLED')
    //console.info('new convo', await newConversation('look at this shizzz', 'djhealy.id'))
    //console.info('CONVO SAVED')
    //console.info('[DOMESTIC] fulgid.id/public_index.json', await getJson('public_index.json', { decrypt: false }))
    //console.info('[FOREIGN] fulgid.id/public_index.json', await getJson('public_index.json', { username: 'fulgid.id' }))
    //console.info('djhealy.id/public_index.json', await getJson('public_index.json', { username: 'djhealy.id' }))
    //console.info('discover', await discoverConversation("djhealy.id"))
    //await createMockData()
  }
}
