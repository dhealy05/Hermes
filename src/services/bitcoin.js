import { identity } from './identity'
import { getPublicIndexForId } from './contacts'
const bitcoin = require('bitcoinjs-lib')
const bigi = require('bigi')
const request = require('request')
const SATOSHIS_IN_BTC = 100000000

export async function sendBitcoinToIds(ids, amount){
  const recipients = []
  const myId = identity().username

  for (const id of ids) {
    if (id === myId) {
      continue
    }

    const index = await getPublicIndexForId(id)
    recipients.push(index.bitcoinAddress)
  }

  if (recipients.length < 1) {
    return false
  }

  return await makeTransaction(recipients, amount)
}

export function getAddress(){
  var privateKey = identity().appPrivateKey
  var hash = bitcoin.crypto.sha256(Buffer.from(privateKey))
  var num = bigi.fromBuffer(hash)
  var keyPair = new bitcoin.ECPair(num)
  return keyPair
}

export function getPublicAddress(){
  var me = getAddress()
  var address = me.getAddress()
  return address
}

export async function getUnspentOutputs(address){
  const url = `https://blockchain.info/unspent?active=${encodeURIComponent(address)}&cors=true`
  const resp = await fetch(url)

  if (resp.statusCode >= 400) {
    console.warn(`error response from ${url} with status ${resp.statusCode}`)
    return null
  }

  try {
    return resp.json()
  } catch (e) {
    console.warn(`error decoding JSON from ${url}`)
    return null
  }
}

export async function getBalance(address){
  const url = `https://blockchain.info/balance?active=${encodeURIComponent(address)}&cors=true`
  const resp = await fetch(url)

  if (resp.statusCode >= 400) {
    console.warn(`error response from ${url} with status ${resp.statusCode}`)
    return null
  }

  try {
    return resp.json()
  } catch (e) {
    console.warn(`error decoding JSON from ${url}`)
    return null
  }
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

  if (satoshis + fee > finalBalance) {
    console.log("Insufficient Funds")
    return false
  }

  var change = finalBalance - satoshis
  change = change - fee

  for (const unspentOutput of unspentOutputs.unspent_outputs) {
    tx.addInput(unspentOutput.tx_hash_big_endian, unspentOutput.tx_output_n)
  }

  const satoshisPerAddress = satoshis / recipients.length

  for (const recipient of recipients) {
    tx.addOutput(recipient, satoshisPerAddress)
  }

  tx.addOutput(address, change)

  for (let i = 0; i < unspentOutputs.unspent_outputs.length; i++) {
    tx.sign(i, me)
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
  console.log(hex)
  request.post({url:'https://blockchain.info/pushtx?cors=true',
  form: {tx:hex}},
  function(err,httpResponse,body){
   console.log(httpResponse)
  })
}

export function btcToSatoshis(amountInBtc) {
  var final = amountInBtc * SATOSHIS_IN_BTC
  return final
}

export function satoshisToBtc(amountInSatoshis) {
  return (1.0 * amountInSatoshis) / SATOSHIS_IN_BTC
}
