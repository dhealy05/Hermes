import { getJson, saveJson } from './blockstack'
const crypto = require('crypto');
const group = "modp5";

function getPublicJson() {}
function savePublicJson() {}
function createCypherText() {}
function decodeCypherText() {}

export function createKeys(){
  var dh = crypto.getDiffieHellman(group);
  dh.generateKeys();
  return dh
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

export function updateConversations(convoID, blockstackID, text){

}

export function computeSharedSecret(publicKey){
  var promise = getJson("keys.json")
  promise.then(function(dh){
    console.log(dh)
    return dh.computeSecret(publicKey, null, "hex")
  })
  //save this secret to *private* conversations.json,
  //and associate it with the appropriate BlockstackID
}

export function enableDiscovery(){
  var dh = createKeys()
  console.log(dh)
  var pubkey = dh.getPublicKey()
  var privkey = dh.getPrivateKey()
  var prime = dh.getPrime()
  var keys = {
    pubkey: pubkey,
    privkey: privkey,
    prime: prime
  }
  saveJson("keys.json", keys) //Save Private Keys, Privately
  saveJson("discovery.json", pubkey) //This will be public--
  //first, the key, then an array of objects with the secret
  //and the identifier
  //var keys = getJson("keys.json")
  //console.log(keys)
}

export async function getMyKeys(){
  var json = await getJson("keys.json")
  var dh = crypto.createDiffieHellman(json.prime)
  dh.setPublicKey(json.pubkey)
  dh.setPrivateKey(json.privkey)
  return dh
}

export async function testSecret(){
  var me = await getMyKeys()
  console.log(me)
  var myKeyObject = await getJson("discovery.json")
  var myKey = myKeyObject.data

  var otherPerson = createKeys()
  console.log(otherPerson)
  var theirKey = otherPerson.getPublicKey()

  var mySecret = me.computeSecret(theirKey, null, "hex")
  var theirSecret = otherPerson.computeSecret(myKey, null, "hex")

  var eve = createKeys()
  var evePublicKey = eve.getPublicKey()
  var eveSecret = eve.computeSecret(myKey, null, "hex")

  console.log(mySecret)
  console.log(theirSecret)
  console.log(eveSecret)
  console.log(theirSecret.equals(mySecret))
  console.log(eveSecret.equals(mySecret))

  var cypherTextObject = encodeText(mySecret, "Go Bills!")
  console.log(cypherTextObject.encodedText)
  var decodedCypher = decodeText(cypherTextObject, theirSecret)
  var decodedCypher1 = decodeText(cypherTextObject, eveSecret)
  console.log(decodedCypher)
  console.log(decodedCypher1)
}

export function makeCypher(secret){
  var cypherType = "aes-256-ctr";
  var hash = "sha256";
  var initializationVector = crypto.randomBytes(128);
  var hashedSecret = crypto.createHash(hash).update(secret).digest("binary");
  var cypher = crypto.createCipher(cypherType, hashedSecret, initializationVector);
  return cypher
}

export function encodeText(secret, text){
  var cypher = makeCypher(secret)
  var encodedText = cypher.update(text)
  return {
    cypherType: "aes-256-ctr",
    hash: "sha256",
    encodedText: encodedText
  }
}

export function decodeText(object, secret){
   var hashedSecret = crypto.createHash(object.hash).update(secret).digest("binary");
   var cypher = crypto.createDecipher(object.cypherType, hashedSecret)
   var plainText = cypher.update(object.encodedText, null, "utf8");
   return plainText
}

//enableDiscovery()
//testSecret()
