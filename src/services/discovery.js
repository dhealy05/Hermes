import { Conversation } from '../models/conversation'
import {saveJson, getJson} from './blockstack'
import {getMyKeys, decodeText, createKeys} from './keys'

export function enableDiscovery(){
  var dh = createKeys()
  var pubkey = dh.getPublicKey()
  var privkey = dh.getPrivateKey()
  var prime = dh.getPrime()
  var keys = {
    pubkey: pubkey,
    privkey: privkey,
    prime: prime
  }
  saveJson("keys.json", keys)
  saveJson("discovery.json", pubkey, true)
  localStorage.setItem("discovery", true);
}

export async function discoverConversation(blockstackID){
  var discoverThem = await getJson("discovery.json", blockstackID)
  if(discoverThem == 404){
    return;
  } else {
    var me = await getMyKeys()
    var sharedSecret = me.computeSecret(discoverThem.publicKey, null, "hex")
    for(var i = 0; i < discoverThem.introductions.length; i++){
      if(sharedSecret === discoverThem.introductions[i].secret){ //winner!
        var textObject = decodeText(discoverThem.introductions[i].textObject, sharedSecret)
        //newConversation(convoID, blockstackID, text, sharedSecret)
      }
    }
  }
}

async function newConversation(convoID, blockstackID, text, sharedSecret){
  var myConversations = await getJson("conversations.json")
  var newConvo = new Conversation(convoID, blockstackID, text, sharedSecret)
  myConversations.conversations.push(newConvo)
  saveJson("conversations.json", myConversations)
  //newMessageAlert()
  //alert, show new message
}

export async function discoverMessage(blockstackID, convoID, sharedSecret){
  var messages = await getJson(convoID, blockstackID)
  for(var i = 0; i < messages.messages.length; i++){
    var text = decodeText(messages.messages[i].textObject, sharedSecret)
    //newMessageAlert()
    updateConversation(convoID, text)
  }
}

export async function updateConversation(convoID, newMessage){
  var conversation = await getJson(convoID)
  conversation.messages.push(newMessage)
}
