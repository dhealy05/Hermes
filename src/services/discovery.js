import {saveJson, getJson} from './blockstack'
import {getSharedSecret, decodeText, createKeys} from './keys'
import {Conversation,Contact,Message} from '../models'
import {saveConversationById} from './conversations'
import {saveContactById} from './contacts'
import * as blockstack from 'blockstack'

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
  if(discoverThem == null){return;}
  var sharedSecret = await getSharedSecret(discoverThem.pubkey.data)
  for(var i = 0; i < discoverThem.introductions.length; i++){
    var theirSecret = decodeText(discoverThem.introductions[i].secret.data, sharedSecret)
    if(sharedSecret == theirSecret){ //winner!
      var text = decodeText(discoverThem.introductions[i].text.data, sharedSecret)
      var convoID = decodeText(discoverThem.introductions[i].convoID.data, sharedSecret)
      addConversation(convoID, blockstackID, text, sharedSecret)
    }
  }
}

async function addConversation(convoID, blockstackID, text, sharedSecret){
  var id = blockstackID.replace('.id', '')
  var myConversations = await getJson("conversations.json")
  var m = new Message({sender: id, content: text, sentAt: new Date()})
  var c = new Conversation({contacts: [id], publicID: convoID, secret: sharedSecret, messages: [m]})
  await saveConversationById(Conversation.getId(c), c)
}

async function addContact(blockstackID){
  var id = blockstackID.replace('.id', '')
  var profile = await blockstack.lookupProfile(blockstackID)
  var contact = {name: profile.name, id: id}
  saveContactById(id, contact)
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
  //then, get conversation list and update thumbnail
}
