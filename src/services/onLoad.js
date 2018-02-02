import {saveJson, getJson} from './blockstack'
import {getConversations} from './conversations'
import {getContacts} from './contacts'
import { enableDiscovery } from './discovery'
import {identity, getLocalPublicIndex, saveLocalPublicIndex} from './identity'

export async function checkDiscovery(){
  const discovery = localStorage.getItem("discovery");
  if (discovery) {
    return
  }

  const keys = await getJson('keys.json')

  if (keys !== null) {
    return
  }

  await enableDiscovery()
}

export async function showConversations(){
  console.log(await getConversations())
  console.log(await getLocalPublicIndex())
  console.log(await getContacts())
}
