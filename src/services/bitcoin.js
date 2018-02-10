import { identity } from './identity'
import { getPublicIndexForId } from './contacts'
const bitcoin = require('bitcoinjs-lib')
const bigi = require('bigi')
const request = require('request')
const SATOSHIS_IN_BTC = 100000000

export async function sendBitcoinToIds(ids, amount){
  var recipients = []
  for(var i = 0; i < ids.length; i++){
    if(ids[i] == identity().username){continue}
    var public_index = await getPublicIndexForId(ids[i])
    recipients.push(public_index.bitcoin_address)
  }
  const result = await makeTransaction(recipients, amount)
  return result
}

export function getAddress(){
  var privateKey = identity().appPrivateKey
  var hash = bitcoin.crypto.sha256(Buffer.from(privateKey))
  var num = bigi.fromBuffer(hash)
  var keyPair = new bitcoin.ECPair(num)

  var address = keyPair.getAddress()
  console.log(address)

  return keyPair
}

export function getPublicAddress(){
  var me = getAddress()
  var address = me.getAddress()
  return address
}

export async function getUnspentOutputs(address){
  var url = "https://blockchain.info/unspent?active=" + address + "&cors=true"
  const requestData = {
    uri: url,
    method: 'GET'
  }
  return new Promise(function (resolve, reject) {
    request(requestData, function (error, response, body) {
      if(response == null){resolve(null)}
      if(response.statusCode != 200)resolve(null)
      try {
        var resultsJson = JSON.parse(body);
        resolve(resultsJson)
      } catch (e) {
        resolve(null)
      }
    })
  })
}

export async function getBalance(address){
  //var url = "https://blockchain.info/rawaddr/" + address + "?cors=true"
  var url = "https://blockchain.info/balance?active=" + address + "&cors=true"
  const requestData = {
    uri: url,
    method: 'GET'
  }
  return new Promise(function (resolve, reject) {
    request(requestData, function (error, response, body) {
      if(response == null){resolve(null)}
      if(response.statusCode != 200){resolve(null)}
      try {
        var resultsJson = JSON.parse(body);
        resolve(resultsJson)
      } catch (e) {
        console.log(e)
      }
    })
  })
}

export async function makeTransaction(recipients, amount){
  const me = getAddress()
  const address = me.getAddress()
  const satoshis = btcToSatoshis(amount)

  var tx = new bitcoin.TransactionBuilder()

  const balance = await getBalance(address)
  if(balance == null){return false}
  const finalBalance = balance[address].final_balance
  if(finalBalance == null){return false}
  const unspentOutputs = await getUnspentOutputs(address)
  if(unspentOutputs == null){return false}

  var bytes = (unspentOutputs.unspent_outputs.length * 148) + 78
  var fee = await getNetworkFee(bytes)
  //in*148 + out*34 + 10 plus or minus 'in'

  if(satoshis + fee > finalBalance){
    console.log("Insufficient Funds")
    return false
  }

  var change = finalBalance - satoshis
  change = change - fee

  for(var i = 0; i < unspentOutputs.unspent_outputs.length; i++){
    tx.addInput(unspentOutputs.unspent_outputs[i].tx_hash_big_endian, unspentOutputs.unspent_outputs[i].tx_output_n)
  }

  const satoshisPerAddress = satoshis / recipients.length

  for(var i = 0; i < recipients.length; i++){
    tx.addOutput(recipients[i], satoshisPerAddress)
  }

  tx.addOutput(address, change)

  for(var j = 0; j < unspentOutputs.unspent_outputs.length; j++){
    tx.sign(j, me)
  }

  // prepare for broadcast to the Bitcoin network, see "can broadcast a Transaction" below
  var txhex = tx.build().toHex()
  broadcastTransaction(txhex)
  return true
}

export async function getNetworkFee(bytes) {
  return new Promise((resolve, reject) => {
    fetch('https://bitcoinfees.21.co/api/v1/fees/recommended')
    .then((response) => response.text())
    .then((responseText) => JSON.parse(responseText))
    .then((responseJson) => {
      //const satoshisPerByte = responseJson.fastestFee
      const satoshisPerByte = responseJson.hourFee
      const fee = bytes * satoshisPerByte
      resolve(fee)
    })
    .catch((error) => {
      reject(error)
    })
  })
}

export async function broadcastTransaction(hex){
  request.post({url:'https://blockchain.info/pushtx?cors=true',
  form: {tx:hex}},
  function(err,httpResponse,body){
   console.log(httpResponse)
  })
}

export function btcToSatoshis(amountInBtc) {
  console.log(amountInBtc)
  var final = amountInBtc * SATOSHIS_IN_BTC
  console.log(final)
  return final
}

export function satoshisToBtc(amountInSatoshis) {
  return (1.0 * amountInSatoshis) / SATOSHIS_IN_BTC
}
