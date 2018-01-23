import { map } from 'lodash'
import {
  ContentTypes,
  Conversation,
  ConversationMetadata,
  Message
} from '../../models'
import {
  deleteConversation as deleteConversationService,
  getConversations,
  getConversationById,
  sendMessage as saveMessageToJson
} from '../../services'
import { newConversation } from '../../services/newConversation'
import { identity } from '../../services/identity'
import * as contactActions from '../contacts/actions'
import { payloadAction } from '../util'

export const COMPOSE_CONVERSATION_ID = 'compose'

export const SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION'
export const setActiveConversation = id => async (dispatch, getState) => {
  const { chat: { conversationDetails } } = getState()

  if (id && !conversationDetails[id]) {
    // not using `await` because we want to show a loading state
    dispatch(fetchConversationDetails(id))
  }

  return dispatch({
    type: SET_ACTIVE_CONVERSATION,
    payload: id
  })
}

export const startComposing = () => ({
  type: SET_ACTIVE_CONVERSATION,
  payload: COMPOSE_CONVERSATION_ID
})

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

export const SET_NEW_MESSAGE_RECIPIENTS = 'SET_NEW_MESSAGE_RECIPIENTS'
export const setNewMessageRecipients = ids => (dispatch, getState) => {
  const { contacts: { contactsById } } = getState()

  for (const id of ids) {
    if (!contactsById[id]) {
      dispatch(contactActions.fetchContactById(id))
    }
  }

  dispatch({
    type: SET_NEW_MESSAGE_RECIPIENTS,
    payload: ids
  })
}

export const fetchConversationList = () => async (dispatch, getState) => {
  dispatch(startLoadingConversationList())
  const conversations = await loadConversationMetadata()

  const { chat: { activeConversation, conversationDetails },
          contacts: { contactsById } } = getState()

  await Promise.all(
    map(conversations, convo => Promise.all(
      convo.contacts.map(contactId => {
        const cached = contactsById[contactId]
        if (cached) {
          return cached
        }

        return dispatch(contactActions.fetchContactById(contactId))
      }))
    )
  )

  if (!activeConversation
      || !conversationDetails[activeConversation]
      || conversationDetails[activeConversation].loading) {
    const defaultConvo = Object.keys(conversations)[0] || COMPOSE_CONVERSATION_ID

    await dispatch(fetchConversationDetails(defaultConvo))
  }

  dispatch(finishLoadingConversationList(conversations))
}

export const fetchConversationDetails = id => async dispatch => {
  if (!id || id === COMPOSE_CONVERSATION_ID) {
    return
  }

  dispatch(startLoadingConversationDetails(id))
  const convo = await getConversationById(id)
  dispatch(finishLoadingConversationDetails(convo))
}

export const sendMessage = text => async (dispatch, getState) => {
  if (text.length === 0) {
    return
  }

  const { chat: { activeConversation,
                  conversationDetails,
                  newMessageRecipients } } = getState()

  if (activeConversation === COMPOSE_CONVERSATION_ID) {
    console.info('recipients', newMessageRecipients)
    const [recipient] = newMessageRecipients // TODO support group chat
    const convo = await newConversation(text, recipient)

    dispatch(setConversationDetails(convo))
    dispatch(finishLoadingConversationList(await loadConversationMetadata()))
    return
  }

  const convo = conversationDetails[activeConversation]

  const message = new Message({
    sender: identity().username,
    contentType: ContentTypes.Text,
    timestamp: new Date().toISOString(),
    content: text
  })

  dispatch(setConversationDetails(await saveMessageToJson(Conversation.getId(convo), message)))
  dispatch(finishLoadingConversationList(await loadConversationMetadata()))
}

export const deleteActiveConversation = () => (dispatch, getState) => {
  const { chat: { activeConversation } } = getState()

  if (!activeConversation || activeConversation === COMPOSE_CONVERSATION_ID) {
    return
  }

  dispatch(deleteConversation(activeConversation))
}

export const deleteConversation = id => async dispatch => {
  await deleteConversationService(id)
  dispatch(finishLoadingConversationList(await loadConversationMetadata()))
}

const loadConversationMetadata = async () => {
  const { conversations } = await getConversations()
  for (const key in conversations) {
    conversations[key] = new ConversationMetadata(conversations[key])
  }
  return conversations
}
