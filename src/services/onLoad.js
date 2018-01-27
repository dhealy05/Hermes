import {saveJson, getJson} from './blockstack'
import {getConversations} from './conversations'
import {enableDiscovery, discoverMessage} from './discovery'
import {identity, getLocalPublicIndex, saveLocalPublicIndex} from './identity'

async function checkDiscovery(){
  var discovery = localStorage.getItem("discovery");
  if(discovery == true){return;}
  var discoveryJson = await getLocalPublicIndex()
  if(discoveryJson !== null){return;}
  enableDiscovery()
}

//checkDiscovery()
