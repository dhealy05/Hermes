import {saveJson, getJson} from './blockstack'
import {enableDiscovery} from './discovery'

async function checkDiscovery(){
  var discovery = localStorage.getItem("discovery");
  if(discovery == true){return;}
  var discoveryJson = await getJson("discovery.json")
  if(discoveryJson !== null){return;}
  enableDiscovery()
}

async function checkNewMessages(){
  /*get conversations.json
  iterate through IDs
  check each file
  if there is a message with timestamp>than current, add
  */
}

async function checkNewConversations(){
  /*
  iterate through network IDs
  check secrets
  etc
  */
}
