import {
  ContentTypes,
  Conversation,
  ConversationMetadata,
  Message
} from '../../models'
import {
  getConversations,
  getConversationById,
  sendMessage as saveMessageToJson
} from '../../services'
import { payloadAction } from '../util'

export const SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION'
export const setActiveConversation = id => async (dispatch, getState) => {
  const { chat: { conversationDetails } } = getState()

  if (!conversationDetails[id]) {
    // not using `await` because we want to show a loading state
    dispatch(fetchConversationDetails(id))
  }

  return dispatch({
    type: SET_ACTIVE_CONVERSATION,
    payload: id
  })
}

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

export const SET_CONVERSATION_DETAILS = 'SET_CONVERSATION_DETAILS'
export const setConversationDetails = payloadAction(SET_CONVERSATION_DETAILS)

export const fetchConversationList = () => async (dispatch, getState) => {
  dispatch(startLoadingConversationList())
  const { conversations } = await getConversations()
  for (const key in conversations) {
    conversations[key] = new ConversationMetadata(conversations[key])
  }

  const { chat: { activeConversation, conversationDetails } } = getState()

  if (!activeConversation
      || !conversationDetails[activeConversation]
      || conversationDetails[activeConversation].loading) {
    await dispatch(fetchConversationDetails(Object.keys(conversations)[0]))
  }

  dispatch(finishLoadingConversationList(conversations))
}

export const fetchConversationDetails = id => async dispatch => {
  dispatch(startLoadingConversationDetails(id))
  const convo = await getConversationById(id)
  dispatch(finishLoadingConversationDetails(convo))
}

export const sendMessage = text => async (dispatch, getState) => {
  if (text.length === 0) {
    return
  }

  const { chat: { activeConversation, conversationDetails } } = getState()
  const convo = conversationDetails[activeConversation]

  const message = new Message({
    sender: 'you', // TODO agh
    contentType: ContentTypes.Text,
    timestamp: new Date().toISOString(),
    content: text
  })

  dispatch(setConversationDetails(await saveMessageToJson(Conversation.getId(convo), message)))
}
