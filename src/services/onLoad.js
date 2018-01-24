import {saveJson, getJson} from './blockstack'
import {getConversations} from './conversations'
import {enableDiscovery, discoverMessage} from './discovery'
import {identity, getLocalPublicIndex, saveLocalPublicIndex} from './identity'

async function checkDiscovery(){
  var discovery = localStorage.getItem("discovery");
  if(discovery == true){return;}
  var discoveryJson = await getJson("public_index.json", {username: identity().username} )
  if(discoveryJson !== null){return;}
  enableDiscovery()
}

export async function checkNewMessages(){
  const object = await getConversations()
  const conversations = object.conversations
  for(var id in conversations){
    await discoverMessage(id, conversations[id])
  }
}

export async function clearIntroductions(){
  const index = getLocalPublicIndex()
  
}

async function checkNewConversations(){
  /* TODO
  iterate through network IDs
  check secrets
  etc
  */
}
