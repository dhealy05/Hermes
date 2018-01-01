import moment from 'moment'
import {
  Conversation
} from '../../models'
import {
  getConversations,
  getConversationById
} from '../../services'
import { payloadAction } from '../util'

export const RECV_MESSAGE = 'RECV_MESSAGE'
export const recvMessage = payloadAction(RECV_MESSAGE)

export const START_LOADING_CONVERSATION_LIST = 'START_LOADING_CONVERSATION_LIST'
export const startLoadingConversationList = payloadAction(START_LOADING_CONVERSATION_LIST)

export const FINISH_LOADING_CONVERSATION_LIST = 'FINISH_LOADING_CONVERSATION_LIST'
export const finishLoadingConversationList = payloadAction(FINISH_LOADING_CONVERSATION_LIST)

export const START_LOADING_CONVERSATION_DETAILS = 'START_LOADING_CONVERSATION_DETAILS'
export const startLoadingConversationDetails = payloadAction(START_LOADING_CONVERSATION_DETAILS)

export const FINISH_LOADING_CONVERSATION_DETAILS = 'FINISH_LOADING_CONVERSATION_DETAILS'
export const finishLoadingConversationDetails = payloadAction(FINISH_LOADING_CONVERSATION_DETAILS)

export const SET_CONVERSATION = 'SET_CONVERSATION'
export const setConversation = payloadAction(SET_CONVERSATION)

export const fetchConversationList = () => async dispatch => {
  dispatch(startLoadingConversationList())
  const { conversations } = await getConversations()
  for (const key in conversations) {
    conversations[key] = new Conversation(conversations[key])
  }
  dispatch(finishLoadingConversationList(conversations))
}

export const fetchConversationDetails = id => async dispatch => {
  dispatch(startLoadingConversationDetails(id))

  const convo = await getConversationById(id)

  dispatch(finishLoadingConversationDetails(id, convo))
}

export const sendMessage = text => dispatch => {
  if (text.length === 0) {
    return
  }

  dispatch(recvMessage({
    sender: {
      isCurrentUser: true,
      displayName: 'you',
      avatar: { url: 'https://lorempixel.com/65/65' }
    },
    timestamp: moment(new Date()).toISOString(),
    text
  }))
}
