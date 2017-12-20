import * as _actions from './actions'

export const actions = _actions
export const namespace = 'contacts'

const initialState = {
  loading: false,
  apiError: null,
  contactsById: {}
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actions.START_LOADING_CONTACT:
      return {
        ...state,
        loading: true
      }
    case actions.ERROR_LOADING_CONTACT:
      return {
        ...state,
        loading: false,
        apiError: action.payload
      }
    case actions.FINISH_LOADING_CONTACT:
      return {
        ...state,
        loading: false,
        contactsById: {
          ...state.contactsById,
          [action.payload.id]: action.payload
        }
      }
    default:
      return state
  }
}
