import { getJson } from './blockstack'
import { getConversations } from './conversations'
import { getContacts, getFriendsOnlyContacts } from './contacts'
import { enableDiscovery } from './discovery'
import { getLocalPublicIndex, identity } from './identity'
import { updateStatus } from './statusIndicators'
import swal from 'sweetalert'


export async function checkDiscovery(){

  if(identity().username == null){
    swal("Hi there! It looks like you haven't bought a Blockstack ID yet. You'll need one to use Hermes :)")
    return;
  }
  
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
