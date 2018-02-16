import { getJson } from './blockstack'
import { getConversations } from './conversations'
import { getContacts, getFriendsOnlyContacts } from './contacts'
import { enableDiscovery } from './discovery'
import { getLocalPublicIndex } from './identity'
import { updateStatus } from './statusIndicators'


export async function checkDiscovery(){
  updateStatus()
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
  console.log(await getFriendsOnlyContacts())
}
