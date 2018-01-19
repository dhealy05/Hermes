import { getJson, saveJson } from './blockstack'
import { enableDiscovery, discoverConversation, discoverMessage } from './discovery'
import { newConversation } from './newConversation'
import {checkNewMessages} from './onLoad'

export async function ensureFilesExist({ cleanSlate = false } = {}) {
  if (cleanSlate || !(await getJson('conversations.json'))) {
    await saveJson('conversations.json', { conversations: {} })
  }

  if (cleanSlate || !(await getJson('contacts.json'))) {
    await saveJson('contacts.json', { contacts: {} })
  }

  if (cleanSlate || true) {
    checkNewMessages()
    //console.log(blockstack.loadUserData())
    //await createMockData()
    //console.info('SETTING UP')
    //await enableDiscovery()
    //console.info('DISCOVERY ENABLED')
    //newConversation('bicuits', 'djhealy.id')
    //console.info('CONVO SAVED')
    //console.info('[DOMESTIC] fulgid.id/public_index.json', await getJson('public_index.json', { decrypt: false }))
    //console.info('[FOREIGN] fulgid.id/public_index.json', await getJson('public_index.json', { username: 'fulgid.id' }))
    //console.info('djhealy.id/public_index.json', await getJson('public_index.json', { username: 'djhealy.id' }))
    //await discoverConversation("djhealy.id")
    //console.info('message', await discoverMessage("djhealy.id"))
  }
}
