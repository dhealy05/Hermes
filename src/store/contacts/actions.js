import { Contact } from '../../models'
import { getContacts } from '../../services'
import { payloadAction } from '../util'

export const SET_CONTACT = 'SET_CONTACT'
export const setContact = payloadAction(SET_CONTACT)

export const START_LOADING_CONTACTS = 'START_LOADING_CONTACTS'
export const startLoadingContacts = payloadAction(START_LOADING_CONTACTS)

export const FINISH_LOADING_CONTACTS = 'FINISH_LOADING_CONTACTS'
export const finishLoadingContacts = payloadAction(FINISH_LOADING_CONTACTS)

export const fetchContacts = () => async dispatch => {
  dispatch(startLoadingContacts())
  const { contacts } = await getContacts()
  for (const key in contacts) {
    contacts[key] = new Contact(contacts[key])
  }
  // TODO just here for demo purposes
  contacts['you'] = new Contact({ id: 'you', name: 'You' })
  dispatch(finishLoadingContacts(contacts))
}
