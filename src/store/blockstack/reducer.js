import * as blockstack from 'blockstack'
import * as actions from './actions'

const initialState = {
  userData: null,
  identity: null
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_IDENTITY:
      const userData = action.payload
      const identity = new blockstack.Person(userData.profile)
      return {
        ...state,
        userData,
        identity
      }
    default:
      return state
  }
}
