import {saveJson, getJson} from './blockstack'
import {getConversations} from './conversations'
import {getContacts} from './contacts'
import {enableDiscovery, discoverMessage} from './discovery'
import {identity, getLocalPublicIndex, saveLocalPublicIndex} from './identity'

async function checkDiscovery(){
  var discovery = localStorage.getItem("discovery");
  if(discovery == true){return;}
  var discoveryJson = await getLocalPublicIndex()
  if(discoveryJson !== null){return;}
  enableDiscovery()
}

export async function showConversations(){
  console.log(await getConversations())
  //console.log(await getLocalPublicIndex())
  console.log(await getContacts())
}

//checkDiscovery()
