import { identity } from './identity'
import { getJson, saveJson} from './blockstack'
import { encodeText, decodeText } from './keys'
import { saveContactDataById, getContacts } from './contacts'
import { getConversations } from './conversations'

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

export async function getMyStatus(){
  const info = await getJson('status.json')
  const status = await getJson(info.filename, {username: identity().username})
  var lastSeen = decodeText(status.lastSeen, info.secret)
  return new Date(lastSeen)
}

export async function getLastSeen(filename, secret, username){
  const status = await getJson(filename, {username: username})
  const lastSeen = decodeText(status.lastSeen, secret)
  console.log(new Date(lastSeen))
  return new Date(lastSeen)
}

export async function getStatus(id){
  var contacts = await getContacts()
  var contact = contacts.contacts[id]
  if(contact.statusPage == '' || contact.statusSecret == ''){
    return await updateContactAndGetLastSeen(contact)
  } else {
    return await getLastSeen(contact.statusPage, contact.statusSecret, contact.id)
  }
}

async function updateContactAndGetLastSeen(contact){
  const conversations = await getConversations()
  var secret = ''
  var filename = ''
  console.log(conversations)
  for(var id in conversations.conversations){
    if(id.includes(contact.id)){
      filename = conversations.conversations[id].filename
      secret = conversations.conversations[id].secret
    }
  }
  var outbox = await getJson(filename, {username: contact.id})
  contact.statusPage = decodeText(outbox.statusPage, secret)
  contact.statusSecret = decodeText(outbox.statusSecret, secret)
  saveContactDataById(contact.id, contact)
  return await getLastSeen(contact.statusPage, contact.statusSecret, contact.id)
}
