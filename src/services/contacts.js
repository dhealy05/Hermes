import { get } from 'lodash'
import { Contact } from '../models/contact'
import { HermesHelperId, HermesHelperContact } from '../constants'
import { getJson, saveJson } from './blockstack'
import { lookupProfile, identity, isUserOnHermes } from './identity'
import { encodeText, decodeText } from './keys'

export async function getContacts() {
  return await getJson('contacts.json')
}

export async function addContactById(id, trusted = false) {
  if (id === HermesHelperId) {
    return HermesHelperContact
  }

  const profile = await lookupProfile(id)

  const pic = get(
    profile,
    'image[0].contentUrl',
    `https://www.hihermes.co/images/avatars/${id[0].toLowerCase()}.svg`
  )

  const name = get(profile, 'name', id)

  const contact = new Contact({
    id,
    name,
    pic,
    statusPage: '',
    statusSecret: '',
    trusted: trusted
  })
  return saveContactDataById(id, contact)
}

export async function saveContactDataById(id, contact) {
  const { contacts } = await getContacts()
  contacts[id] = contact
  await saveContactsFile(contacts)
  addFriendsOnlyContactById(id)
  return contact
}

export async function saveContactsFile(listOrMap) {
  const contacts = Array.isArray(listOrMap)
                 ? listOrMap.reduce((accm, c) => { accm[c.id] = c; return accm; }, {})
                 : listOrMap

  const file = { contacts }
  await saveJson('contacts.json', file)
  return file
}

export async function deleteContact(id){
  var contacts = await getJson("contacts.json")
  delete contacts[id]
  await saveJson("contacts.json", contacts)
}

export function getPublicIndexForId(username) {
  return getJson('public_index.json', { username })
}

export async function getPublicKeyForId(id) {
  const index = await getPublicIndexForId(id)

  if (!index) {
    return null
  }

  return index.pubkey.data
}

export async function addFriendsOnlyContactById(id){
  if (id === HermesHelperId) {
    return
  }

  const info = await getJson('status.json')
  const status = await getJson(info.filename, {username: identity().username})
  status.contacts = status.contacts || []

  const friendsList = []

  for(var i = 0; i < status.contacts.length; i++){
    friendsList.push(decodeText(status.contacts[i], info.secret))
  }

  if (friendsList.includes(id)) {
    return
  }

  const profile = await lookupProfile(id)
  const onHermes = await isUserOnHermes(profile)
  if (!onHermes) {
    return
  }

  const encoded = encodeText(id, info.secret)
  status.contacts.push(encoded)
  await saveJson(info.filename, status, {isPublic: true})
}

export async function clearFriendsOnlyContacts(){
  const info = await getJson('status.json')
  var status = await getJson(info.filename, {username: identity().username})
  status.statusPage.contacts = []
  await saveJson(info.filename, status, {isPublic: true})
  return true
}
