import { identity } from './identity'
const bitcoin = require('bitcoinjs-lib')
const bigi = require('bigi')
const request = require('request')
const SATOSHIS_IN_BTC = 100000000

export function btcToSatoshis(amountInBtc) {
  return amountInBtc * SATOSHIS_IN_BTC
}

export function satoshisToBtc(amountInSatoshis) {
  return (1.0 * amountInSatoshis) / SATOSHIS_IN_BTC
}

export function getAddress(){
  var privateKey = identity().appPrivateKey
  var hash = bitcoin.crypto.sha256(Buffer.from(privateKey))
  var num = bigi.fromBuffer(hash)
  var keyPair = new bitcoin.ECPair(num)

  //var testnet = bitcoin.networks.testnet
  var address = keyPair.getAddress()
  console.log(address)

  return keyPair
  //getUnspentOutputs(address)
  //getBalance(address)
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

export async function makeTransaction(){
  var me = getAddress()
  var tx = new bitcoin.TransactionBuilder()

  //const unspentOutputs = await getUnspentOutputs(me.getAddress())
  const unspentOutputs = await getUnspentOutputs('1JRmbzAMxUrk6pNok9Qqu7A6aMyGt7rN36')
  console.log(unspentOutputs)


  tx.addInput(unspentOutputs.unspent_outputs[0].tx_hash_big_endian, 0) // Alice's previous transaction output, has 15000 satoshis
  tx.addOutput('1JRmbzAMxUrk6pNok9Qqu7A6aMyGt7rN36', 9000)
  // (in)15000 - (out)12000 = (fee)3000, this is the miner fee

  tx.sign(0, me)
  console.log(tx)

  // prepare for broadcast to the Bitcoin network, see "can broadcast a Transaction" below
  var txhex = tx.build().toHex()
  console.log(txhex)
  //broadcastTransaction(txhex)
}

export async function broadcastTransaction(hex){
  var url = "https://blockchain.info/pushtx?cors=true"
  const requestData = {
    uri: url,
    method: 'POST',
    json: {tx: hex}
  }
  return new Promise(function (resolve, reject) {
    request(requestData, function (error, response, body) {
      if(response == null){resolve(null)}
      if(response.statusCode != 200)resolve(null)
      try {
        var resultsJson = JSON.parse(body);
        console.log(resultsJson)
        resolve(resultsJson)
      } catch (e) {
        resolve(null)
      }
    })
  })
}

/*export function broadcastTransaction(broadcastTransactionUrl, rawTransaction) {
  return new Promise((resolve, reject) => {
    const payload =  { rawtx: rawTransaction }

    fetch(broadcastTransactionUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
    }).then((response) => response.text())
      .then((responseText) => JSON.parse(responseText))
      .then((responseJson) => {
        resolve(responseJson)
      })
    .catch((error) => {
      logger.error('broadcastTransaction: error broadcasting transaction', error)
      reject(error)
    })
  })
}*/
