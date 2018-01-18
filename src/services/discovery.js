import { Conversation } from '../models/conversation'
import {saveJson, getJson} from './blockstack'
import {getSharedSecret, decodeText, createKeys} from './keys'

export async function enableDiscovery(){
  var dh = createKeys()
  var pubkey = dh.getPublicKey()
  var privkey = dh.getPrivateKey()
  var prime = dh.getPrime()
  var keys = {
    pubkey: pubkey,
    privkey: privkey,
    prime: prime
  }
  await saveJson("keys.json", keys)
  var discovery = {}
  discovery.pubkey = pubkey
  discovery.introductions = []
  await saveJson('public_index.json', discovery, { isPublic: true })
  localStorage.setItem("discovery", true);
}

export async function discoverConversation(blockstackID){
  var discoverThem = await getJson('public_index.json', { username: blockstackID })
  if(discoverThem == null){
    return;
  } else {
    var sharedSecret = await getSharedSecret(discoverThem.pubkey.data)
    for(var i = 0; i < discoverThem.introductions.length; i++){
      var theirSecret = decodeText(discoverThem.introductions[i].secret.data, sharedSecret)
      if(sharedSecret == theirSecret){ //winner!
        var text = decodeText(discoverThem.introductions[i].text.data, sharedSecret)
        var convoID = decodeText(discoverThem.introductions[i].convoID.data, sharedSecret)
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
