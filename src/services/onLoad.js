import {saveJson, getJson} from './blockstack'
import {getConversations} from './conversations'
import {enableDiscovery, discoverMessage} from './discovery'
import {identity} from './identity'

async function checkDiscovery(){
  var discovery = localStorage.getItem("discovery");
  if(discovery == true){return;}
  var discoveryJson = await getJson("public_index.json", {username: identity().username} )
  if(discoveryJson !== null){return;}
  enableDiscovery()
}

export async function checkNewMessages(){
  const conversations = getConversations()
  for(var convo in conversations){
    await discoverMessage(conversations, convo.id)
  }
}

async function checkNewConversations(){
  /* TODO
  iterate through network IDs
  check secrets
  etc
  */
}
