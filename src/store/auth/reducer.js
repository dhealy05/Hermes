import * as blockstack from 'blockstack'
import * as actions from './actions'

const initialState = {
  identity: null
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_IDENTITY:
      return {
        ...state,
        identity: {
          ...action.payload,
          profile: new blockstack.Person(action.payload.profile)
        }
      }
    default:
      return state
  }
}
