import { identity } from './identity'
const bitcoin = require('bitcoinjs-lib')
const bigi = require('bigi')
const request = require('request')
const SATOSHIS_IN_BTC = 100000000

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

export async function makeTransaction(recipient_address, amount){
  const me = getAddress()
  const address = me.getAddress()
  console.log(amount)
  const satoshis = btcToSatoshis(amount)
  console.log(satoshis)

  var tx = new bitcoin.TransactionBuilder()

  const balance = await getBalance(address)
  console.log(balance)
  const finalBalance = balance[address].final_balance
  console.log(finalBalance)
  const unspentOutputs = await getUnspentOutputs(address)
  console.log(unspentOutputs)

  var bytes = (unspentOutputs.unspent_outputs.length * 148) + 78
  console.log(bytes)
  var fee = await getNetworkFee(bytes)
  //in*148 + out*34 + 10 plus or minus 'in'
  console.log(fee)

  if(satoshis + fee > finalBalance){
    console.log("Insufficient Funds")
    return false
  }

  var change = finalBalance - satoshis
  console.log(change)
  change = change - fee
  console.log(change)

  for(var i = 0; i < unspentOutputs.unspent_outputs.length; i++){
    tx.addInput(unspentOutputs.unspent_outputs[i].tx_hash_big_endian, unspentOutputs.unspent_outputs[i].tx_output_n)
  }

  tx.addOutput(recipient_address, satoshis)

  tx.addOutput(address, change)

  for(var j = 0; j < unspentOutputs.unspent_outputs.length; j++){
    tx.sign(j, me)
  }

  // prepare for broadcast to the Bitcoin network, see "can broadcast a Transaction" below
  var txhex = tx.build().toHex()
  console.log(txhex)
  broadcastTransaction(txhex)
}

export async function getNetworkFee(bytes) {
  return new Promise((resolve, reject) => {
    fetch('https://bitcoinfees.21.co/api/v1/fees/recommended')
    .then((response) => response.text())
    .then((responseText) => JSON.parse(responseText))
    .then((responseJson) => {
      const satoshisPerByte = responseJson.fastestFee
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
  return amountInBtc * SATOSHIS_IN_BTC
}

export function satoshisToBtc(amountInSatoshis) {
  return (1.0 * amountInSatoshis) / SATOSHIS_IN_BTC
}
