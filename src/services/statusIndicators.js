import { identity } from './identity'
import { getJson, saveJson} from './blockstack'
import { encodeText, decodeText } from './keys'

export async function setTyping(convo){
  var outbox = await getJson(convo.filename, {username: identity().username})
  outbox.typing = encodeText(new Date().toISOString(), convo.secret)
  return await saveJson(convo.filename, outbox, { isPublic: true } )
}

export function checkTyping(typing){
  if (!typing) {
    return false
  }

  var lastTyped = new Date(typing)
  var thirty_secs = 30 * 1000;
  if(((new Date) - lastTyped) < thirty_secs){return true}
  return false
}

export async function updateStatus(){
  const info = await getJson('status.json')
  const status = await getJson(info.filename, {username: identity().username})
  var lastSeen = new Date().toISOString()
  var encoded = encodeText(lastSeen, info.secret)
  await saveJson(info.filename, {lastSeen: encoded}, {isPublic: true})
}

export async function getLastSeen(filename, secret, username){
  const status = await getJson(filename, {username: username})
  const lastSeen = decodeText(status.lastSeen, secret)
  return new Date(lastSeen)
}

export async function getStatus(contact, filename){
  if(contact.statusPage == null && contact.statusSecret == null){
    var outbox = await getJson(filename, {username: contact.id})
    contact.statusPage = contact.statusPage
    contact.statusSecret = contact.statusSecret
    //saveContact
    //getLastSeen
  } else {
    return getLastSeen(contact.statusPage, contact.statusSecret, contact.username)
  }
}
