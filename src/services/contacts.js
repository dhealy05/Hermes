import * as blockstack from 'blockstack'
import { Contact } from '../models/contact'
import { getJson, saveJson } from './blockstack'
import {lookupProfile} from './identity'

export async function getContacts() {
  return await getJson('contacts.json')
}

export async function addContactById(id) {
  const profile = await lookupProfile(id)
  var pic = ''
  if(profile.image != null){pic = profile.image[0].contentUrl}
  var name = profile.name
  if(name == null){name = id}

  const contact = new Contact({
    id,
    name: name,
    pic,
    statusPage: '',
    statusSecret: ''
  })
  return saveContactDataById(id, contact)
}

export async function saveContactDataById(id, contact) {
  const { contacts } = await getContacts()
  contacts[id] = contact
  await saveContactsFile(contacts)
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
