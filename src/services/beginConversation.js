import {saveJson, getJson} from './blockstack'
import {getMyKeys, encodeText} from './keys.js'

export async function getPublicKey(blockstackID){
  var pubkey = await getJson("discovery.json", blockstackID)
  return pubkey.data
}

export async function getSharedSecret(pubkey){
  var me = await getMyKeys()
  return me.computeSecret(pubkey, null, "hex")
}

async function getHello(){
  return await getJson("hello.json")
}

export function newConversation(text, blockstackID){
  var pubkey = await getPublicKey(blockstackID)
  var secret = await getSharedSecret(pubkey)
  var encodedText = encodeText(secret, text)
  var hello = await getHello()
  var convoID = crypto.randomBytes(128);
  var secretConvoID = encodeText(secret, convoID)
  var json = {
    convoID: secretConvoID,
    secret: secret,
    text: encodedText
  }
  hello.introductions.push(json)
  saveJson(hello, "hello.json", false)
}
