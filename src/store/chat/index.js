import { Conversation } from '../../models'
import * as _actions from './actions'
import * as _selectors from './selectors'

export const namespace = 'chat'
export const actions = _actions
export const selectors = _selectors

const initialState = {
  loadingConversationMetadata: false,
  activeConversation: null,
  conversationMetadata: {},
  conversationDetails: {}
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actions.START_LOADING_CONVERSATION_LIST:
      return {
        ...state,
        loadingConversationMetadata: true
      }
    case actions.FINISH_LOADING_CONVERSATION_LIST:
      return {
        ...state,
        loadingConversationMetadata: false,
        conversationMetadata: action.payload
      }
    case actions.START_LOADING_CONVERSATION_DETAILS:
      return {
        ...state,
        conversationDetails: {
          ...state.conversationDetails,
          [Conversation.getId(action.payload)]: { ...action.payload, loading: true }
        }
      }
    case actions.FINISH_LOADING_CONVERSATION_DETAILS:
      return {
        ...state,
        conversationDetails: {
          ...state.conversationDetails,
          [Conversation.getId(action.payload)]: { ...action.payload, loading: false }
        }
      }
    case actions.SET_CONVERSATION:
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [Conversation.getId(action.payload)]: action.payload
        }
      }
    default:
      return state
  }
}
