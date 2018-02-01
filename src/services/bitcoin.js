import { identity } from './identity'
const bitcoin = require('bitcoinjs-lib')
const bigi = require('bigi')
const request = require('request')

export function getAddress(){
  var privateKey = identity().appPrivateKey
  var hash = bitcoin.crypto.sha256(Buffer.from(privateKey))
  var num = bigi.fromBuffer(hash)

  var testnet = bitcoin.networks.testnet

  var keyPair = new bitcoin.ECPair(num, {network: testnet})
  var address = keyPair.getAddress()
  console.log(address)
  //var keyPair = bitcoin.ECPair()
  //var address = keyPair.getAddress()
  //console.log(address)
  //getBalance(address)
}

export async function getBalance(address){
  //var url = "https://blockchain.info/rawaddr/" + address + "?cors=true"
  var url = "https://blockchain.info/balance?active=" + address + "&cors=true"
  const requestData = {
    uri: url,
    method: 'GET'
  }
  request(requestData, function (error, response, body) {
    if(response == null){console.log("Null Response"); return ''}
    if(response.statusCode != 200){console.log("Not 200"); return ''}
    try {
      var resultsJson = JSON.parse(body);
      console.log(resultsJson)
      return resultsJson
    } catch (e) {
      console.log(e)
    }
  })
}
