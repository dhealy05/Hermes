import { Conversation } from '../../models'
import { actions as emojiActions } from '../emoji'
import * as _actions from './actions'
import * as _selectors from './selectors'

export const namespace = 'chat'
export const actions = _actions
export const selectors = _selectors

const initialState = {
  loadingConversationMetadata: false,
  activeConversation: null,
  conversationMetadata: {},
  typingIndicators: {},
  conversationDetails: {},
  newMessageRecipients: [],
  sendingNewConversation: false,
  fileContents: {},
  messageInputValue: '',
  showingInfoSidebar: false,
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case emojiActions.PICK_EMOJI:
      return {
        ...state,
        messageInputValue: state.messageInputValue + action.payload.native
      }
    case actions.SET_MESSAGE_INPUT_VALUE:
      return {
        ...state,
        messageInputValue: action.payload
      }
    case actions.SET_ACTIVE_CONVERSATION:
      return {
        ...state,
        activeConversation: action.payload
      }
    case actions.START_LOADING_CONVERSATION_LIST:
      return {
        ...state,
        loadingConversationMetadata: true
      }
    case actions.FINISH_LOADING_CONVERSATION_LIST: {
      let { activeConversation } = state

      if (!activeConversation) {
        activeConversation = actions.COMPOSE_CONVERSATION_ID
      }

      return {
        ...state,
        loadingConversationMetadata: false,
        conversationMetadata: action.payload,
        activeConversation
      }
    }
    case actions.START_LOADING_CONVERSATION_DETAILS:
      return {
        ...state,
        conversationDetails: {
          ...state.conversationDetails,
          [action.payload]: { loading: true }
        }
      }
    case actions.FINISH_LOADING_CONVERSATION_DETAILS: {
      let { activeConversation } = state
      if (!activeConversation) {
        activeConversation = Conversation.getId(action.payload)
      }

      return {
        ...state,
        activeConversation,
        conversationDetails: {
          ...state.conversationDetails,
          [Conversation.getId(action.payload)]: { ...action.payload, loading: false }
        }
      }
    }
    case actions.SET_CONVERSATION_DETAILS:
      return {
        ...state,
        conversationDetails: {
          ...state.conversationDetails,
          [Conversation.getId(action.payload)]: action.payload
        }
      }
    case actions.SET_NEW_MESSAGE_RECIPIENTS:
      return {
        ...state,
        newMessageRecipients: action.payload
      }
    case actions.START_LOADING_FILE_CONTENT:
      return {
        ...state,
        fileContents: {
          ...state.fileContents,
          [action.payload.filename]: { loading: true }
        }
      }
    case actions.FINISH_LOADING_FILE_CONTENT:
      return {
        ...state,
        fileContents: {
          ...state.fileContents,
          [action.payload.filename]: {
            loading: false,
            ...action.payload
          }
        }
      }
    case actions.START_SENDING_NEW_CONVERSATION:
      return {
        ...state,
        sendingNewConversation: true
      }
    case actions.FINISH_SENDING_NEW_CONVERSATION:
      return {
        ...state,
        sendingNewConversation: false
      }
    case actions.SET_CONTACT_TYPING: {
      const { conversationId, contactId, typing } = action.payload
      const indicatorForConvo = state.typingIndicators[conversationId]

      return {
        ...state,
        typingIndicators: {
          ...state.typingIndicators,
          [conversationId]: {
            ...state.typingIndicators[conversationId],
            [contactId]: typing
          }
        }
      }
    }
    case actions.TOGGLE_INFO_SIDEBAR: {
      return {
        ...state,
        showingInfoSidebar: !state.showingInfoSidebar,
      }
    }
    default:
      return state
  }
}
