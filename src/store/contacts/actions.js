import { Contact } from '../../models'
import { addContactById, getContacts } from '../../services/contacts'
import { identity } from '../../services/identity'
import { payloadAction } from '../util'

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
  const { username, profile: { name } } = identity()
  dispatch(finishLoadingContactById({
    id: username,
    contact: new Contact({
      id: username,
      name
    })
  }))
}

export const fetchContactById = id => async dispatch => {
  dispatch(startLoadingContactById(id))
  const contact = await addContactById(id)
  dispatch(finishLoadingContactById({ id, contact }))
  return contact
}
