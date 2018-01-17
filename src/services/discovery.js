import {saveJson, getJson} from './blockstack'
import {createKeys} from './keys'

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
}

/*export function newMessage(blockstackID, text){
  //getDiscoveryFile from blockstackID
  var discoverThem = getPublicJson(blockstackID, "discovery.json")
  var me = getJson("keys.json")
  var sharedSecret = me.computeSecret(discoverThem.publicKey, null, "hex")
  var convoID = crypto.randomBytes(128);
  var secretConvoID = encodeText(sharedSecret, convoID)
  var introMessage = encodeText(sharedSecret, text)
  var json = {
    convoID: secretConvoID,
    secret: sharedSecret,
    text: introMessage
  }
  var discoverMe = getJson("discovery.json")
  discoverMe.introductions.push(json)
  savePublicJson(discoverMe, "discovery.json")
}*/

/*export function discoverConversation(blockstackID){
  var discoverThem = getPublicJson(blockstackID, "discovery.json")
  if(discoverThem == 404){
    return;
  } else {
    var me = getJson("keys.json")
    var sharedSecret = me.computeSecret(discoverThem.publicKey, null, "hex")
    for(var i = 0; i < discoverThem.introductions.length; i++){
      if(sharedSecret === discoverThem.introductions[i].secret){ //winner!
        var convoID = decodeText(discoverThem.introductions[i].convoID)
        var text = decodeText(discoverThem.introductions[i].text)
        updateConversations(convoID, blockstackID, text)
      }
    }
  }
}*/
