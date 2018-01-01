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
        contactsById: action.payload
      }
    case actions.SET_CONTACT:
      return {
        ...state,
        contactsById: {
          ...state.contactsById,
          [action.payload.id]: action.payload
        }
      }
    default:
      return state
  }
}
