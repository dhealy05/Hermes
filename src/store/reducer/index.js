import { SET_GREETING } from '../actions'

const initialState = {
  greeting: 'hello world'
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SET_GREETING:
      return {
        ...state,
        greeting: action.payload
      }
    default:
      return state
  }
}
