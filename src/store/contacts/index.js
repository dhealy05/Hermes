import { Contact } from '../../models/contact'
import * as _actions from './actions'

export const actions = _actions
export const namespace = 'contacts'

const initialState = {
  loading: false,
  contactsById: {}
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actions.START_LOADING_CONTACTS:
      return {
        ...state,
        loading: true
      }
    case actions.FINISH_LOADING_CONTACTS:
      return {
        ...state,
        loading: false,
        contactsById: {
          ...state.contactsById,
          ...action.payload
        }
      }
    case actions.START_LOADING_CONTACT_BY_ID:
      return {
        ...state,
        contactsById: {
          ...state.contactsById,
          [action.payload]: new Contact({
            id: action.payload,
            name: 'loading...',
            loading: true
          })
        }
      }
    case actions.FINISH_LOADING_CONTACT_BY_ID:
      return {
        ...state,
        contactsById: {
          ...state.contactsById,
          [action.payload.id]: new Contact(action.payload.contact)
        }
      }
    default:
      return state
  }
}
