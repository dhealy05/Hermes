import { getJson, saveJson } from './blockstack'
import { createMockData } from './createMockData'
import { enableDiscovery, discoverConversation, discoverMessage } from './discovery'
import { newConversation } from './newConversation'
import { newMessage } from './newMessage'
import { testSecret } from './keys'
import * as blockstack from 'blockstack'

export async function ensureFilesExist({ cleanSlate = false } = {}) {
  if (cleanSlate || !(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (cleanSlate || !(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  if (cleanSlate || false) {
    //console.log(blockstack.loadUserData())
    //await createMockData()
    //console.info('SETTING UP')
    //await enableDiscovery()
    //console.info('DISCOVERY ENABLED')
    //console.info('new convo', await newConversation('hello with new changes', 'djhealy.id'))
    //console.info('CONVO SAVED')
    //console.info('[DOMESTIC] fulgid.id/public_index.json', await getJson('public_index.json', { decrypt: false }))
    //console.info('[FOREIGN] fulgid.id/public_index.json', await getJson('public_index.json', { username: 'fulgid.id' }))
    //console.info('djhealy.id/public_index.json', await getJson('public_index.json', { username: 'djhealy.id' }))
    //await discoverConversation("djhealy.id")
    //console.info('message', await discoverMessage("djhealy.id"))
  }
}
