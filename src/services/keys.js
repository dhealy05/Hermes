import * as blockstack from 'blockstack'
import {getJson} from './blockstack'
const crypto = require('crypto');
const group = "modp5";
const cypherType = "aes-256-ctr";
const hash = "sha256";

export function createKeys(){
  var dh = crypto.getDiffieHellman(group);
  dh.generateKeys();
  return dh
}

export async function getMyKeys(){
  var json = await getJson("keys.json")
  var dh = crypto.createDiffieHellman(json.prime)
  dh.setPublicKey(json.pubkey)
  dh.setPrivateKey(json.privkey)
  return dh
}

export async function getSharedSecret(pubkey){
  var me = await getMyKeys()
  var secret = me.computeSecret(pubkey, null, null)
  secret = secret.toString('base64')
  return secret
}

export async function getMyPublicIndex(){
  var myPublicIndex = await getJson('public_index.json', {username:blockstack.loadUserData().username})
  return myPublicIndex
}

export function makeCypher(secret){
  var initializationVector = crypto.randomBytes(128);
  var hashedSecret = crypto.createHash(hash).update(secret).digest("base64");
  var cypher = crypto.createCipher(cypherType, hashedSecret, initializationVector);
  return cypher
}

export function encodeText(text, secret){
  var cypher = makeCypher(secret)
  var encodedText = cypher.update(text)
  return encodedText
}

export function decodeText(encodedText, secret){
   var hashedSecret = crypto.createHash(hash).update(secret).digest("base64");
   var cypher = crypto.createDecipher(cypherType, hashedSecret)
   var plainText = cypher.update(encodedText, null, "utf8");
   return plainText
}

/*export async function testSecret(){
  var me = await getMyKeys()
  var otro = me.getPublicKey()
  console.log(me)
  var myKeyObject = await getMyPublicIndex()
  console.log(myKeyObject)
  var myKey = myKeyObject.pubkey.data

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
  console.log(cypherTextObject)
  var decodedCypher = decodeText(cypherTextObject, theirSecret)
  var decodedCypher1 = decodeText(cypherTextObject, eveSecret)
  console.log(decodedCypher)
  console.log(decodedCypher1)
}*/
