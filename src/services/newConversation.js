import {saveJson, getJson} from './blockstack'
import {getMyKeys, encodeText} from './keys'

export async function getPublicKey(blockstackID){
  var discovery = await getJson("discovery.json", blockstackID)
  return discovery.data.pubkey
}

export async function getSharedSecret(pubkey){
  var me = await getMyKeys()
  return me.computeSecret(pubkey, null, "hex")
}

async function getMyDiscovery(){
  return await getJson("discovery.json")
}

export function newConversation(text, blockstackID){
  var pubkey = await getPublicKey(blockstackID)
  var secret = await getSharedSecret(pubkey)
  var encodedText = encodeText(secret, text)
  var discovery = await getMyDiscovery()
  var convoID = crypto.randomBytes(128);
  var secretConvoID = encodeText(secret, convoID)
  var json = {
    convoID: secretConvoID,
    secret: secret,
    text: encodedText
  }
  discovery.introductions.push(json)
  saveJson(discovery, "discovery.json", false)
  addConversation(convoID, blockstackID, text, secret)
}

async function addConversation(convoID, blockstackID, text, sharedSecret){
  var myConversations = await getJson("conversations.json")
  var newConvo = new Conversation(convoID, blockstackID, text, sharedSecret)
  myConversations.conversations.push(newConvo)
  saveJson("conversations.json", myConversations)
}
