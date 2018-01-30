import { get } from 'lodash'
import { Contact } from '../../models'
import {
  addContactById,
  addContactWithConversation,
  getContacts,
  identity
} from '../../services'
import { payloadAction } from '../util'
import * as chatActions from '../chat/actions' // TODO resolve circular dependency

export const START_LOADING_CONTACTS = 'START_LOADING_CONTACTS'
export const startLoadingContacts = payloadAction(START_LOADING_CONTACTS)

export const FINISH_LOADING_CONTACTS = 'FINISH_LOADING_CONTACTS'
export const finishLoadingContacts = payloadAction(FINISH_LOADING_CONTACTS)

export const START_LOADING_CONTACT_BY_ID = 'START_LOADING_CONTACT_BY_ID'
export const startLoadingContactById = payloadAction(START_LOADING_CONTACT_BY_ID)

export const FINISH_LOADING_CONTACT_BY_ID = 'FINISH_LOADING_CONTACT_BY_ID'
export const finishLoadingContactById = payloadAction(FINISH_LOADING_CONTACT_BY_ID)

export const fetchContacts = () => async dispatch => {
  dispatch(startLoadingContacts())
  const { contacts } = await getContacts()
  for (const key in contacts) {
    contacts[key] = new Contact(contacts[key])
  }
  dispatch(finishLoadingContacts(contacts))
}

export const fetchSelf = () => async dispatch => {
  const { username, profile: { name, image } } = identity()
  const pic = get(image, '[0].contentUrl', undefined)

  dispatch(finishLoadingContactById({
    id: username,
    contact: new Contact({
      id: username,
      name,
      pic
    })
  }))
}

export const fetchContactById = id => async dispatch => {
  dispatch(startLoadingContactById(id))
  const contact = await addContactById(id)
  dispatch(finishLoadingContactById({ id, contact }))
  return contact
}

export const START_ADDING_NEW_CONTACT = 'START_ADDING_NEW_CONTACT'
export const startAddingNewContact = payloadAction(START_ADDING_NEW_CONTACT)

export const FINISH_ADDING_NEW_CONTACT = 'FINISH_ADDING_NEW_CONTACT'
export const finishAddingNewContact = payloadAction(FINISH_ADDING_NEW_CONTACT)

export const addNewContact = (id, firstMessage = null) => async dispatch => {
  dispatch(startAddingNewContact(id))
  const { contact, conversation } = await addContactWithConversation(id, firstMessage)
  dispatch(finishLoadingContactById({ id, contact, conversation }))
  dispatch(finishAddingNewContact(id))
  dispatch(chatActions.refreshConversationList())

  return { contact, conversation }
}
