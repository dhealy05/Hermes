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
  saveConversationById,
  sendMessage as saveMessageToJson,
  newConversation,
  discoverMessage,
  discoverConversation,
  uploadFileForOutbox,
  retrieveFileContentForMessage
} from '../../services'
import { identity } from '../../services/identity'
import * as contactActions from '../contacts/actions'
import { payloadAction } from '../util'

export const COMPOSE_CONVERSATION_ID = 'compose'

export const SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION'
export const setActiveConversation = id => async (dispatch, getState) => {
  const { chat: { conversationDetails } } = getState()

  if (id && id !== COMPOSE_CONVERSATION_ID && !conversationDetails[id]) {
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

export const fetchConversationDetails = id => async (dispatch, getState) => {
  if (!id || id === COMPOSE_CONVERSATION_ID) {
    return
  }

  dispatch(startLoadingConversationDetails(id))
  const convo = await getConversationById(id)

  for (const msg of convo.messages) {
    if (msg.type === ContentTypes.Image) {
      dispatch(fetchImageForMessage(msg, convo))
    }
  }

  dispatch(finishLoadingConversationDetails(convo))
}

export const MARK_CONVERSATION_AS_READ = 'MARK_CONVERSATION_AS_READ'

function removeMsgAlert(){
  var numArray = document.title.match(/\d+/)
  if(numArray == null || numArray.length == 0){return;}
  var num = parseInt(numArray[0])
  if(num == null){return;}
  if(num == 1){document.title = "Hermes"; return;}
  num = num - 1
  document.title = "(" + num.toString() + ") Hermes"
}


export const markActiveConversationAsRead = () => async (dispatch, getState) => {
  const { chat: { activeConversation } } = getState()

  if (!activeConversation || activeConversation === COMPOSE_CONVERSATION_ID) {
    return
  }

  dispatch({ type: MARK_CONVERSATION_AS_READ, payload: activeConversation })

  const convo = await getConversationById(activeConversation)
  convo.wasRead = true
  convo.readAt = new Date().toISOString()

  removeMsgAlert()

  dispatch(finishLoadingConversationDetails(await saveConversationById(activeConversation, convo)))
  dispatch(refreshConversationList())

  return convo
}

export const sendText = text => async (dispatch, getState) => {
  if (text.length === 0) {
    return
  }

  return dispatch(sendRawMessage(new Message({
    sender: identity().username,
    type: ContentTypes.Text,
    timestamp: new Date().toISOString(),
    content: text
  })))
}

export const sendFile = file => async (dispatch, getState) => {
  const message = new Message({
    sender: identity().username,
    timestamp: new Date().toISOString(),
    type: ContentTypes.Image,
    content: file
  })

  return dispatch(sendRawMessage(message))
}

export const START_SENDING_NEW_CONVERSATION = 'START_SENDING_NEW_CONVERSATION'
export const startSendingNewConversation = payloadAction(START_SENDING_NEW_CONVERSATION)

export const FINISH_SENDING_NEW_CONVERSATION = 'FINISH_SENDING_NEW_CONVERSATION'
export const finishSendingNewConversation = payloadAction(FINISH_SENDING_NEW_CONVERSATION)

export const sendRawMessage = message => async (dispatch, getState) => {
  const { chat: { activeConversation,
                  conversationDetails,
                  newMessageRecipients } } = getState()

  if (activeConversation === COMPOSE_CONVERSATION_ID) {
    dispatch(startSendingNewConversation())

    const convo = await newConversation(message.content, newMessageRecipients)

    dispatch(setConversationDetails(convo))
    dispatch(setActiveConversation(Conversation.getId(convo)))

    // TODO this timeout is necessary because sometimes it takes some time for
    // the metadata to be properly saved
    setTimeout(() => dispatch(refreshConversationList()), 100)

    dispatch(finishSendingNewConversation())
    return
  }

  const convo = conversationDetails[activeConversation]

  if (message.content instanceof File) {
    // kind of hacky, but it works for now
    message.content = await uploadFileForOutbox(activeConversation, message.content)
    dispatch(fetchImageForMessage(message, convo))
  }

  dispatch(setConversationDetails(await saveMessageToJson(Conversation.getId(convo), message)))
  dispatch(refreshConversationList())
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
  dispatch(refreshConversationList())
}

export const START_POLLING_MESSAGES = 'START_POLLING_MESSAGES'
export const startPollingMessages = payloadAction(START_POLLING_MESSAGES)

export const FINISH_POLLING_MESSAGES = 'FINISH_POLLING_MESSAGES'
export const finishPollingMessages = payloadAction(FINISH_POLLING_MESSAGES)

export const START_POLLING_CONVERSATIONS = 'START_POLLING_CONVERSATIONS'
export const startPollingConversations = payloadAction(START_POLLING_CONVERSATIONS)

export const FINISH_POLLING_CONVERSATIONS = 'FINISH_POLLING_CONVERSATIONS'
export const finishPollingConversations = payloadAction(FINISH_POLLING_CONVERSATIONS)

let conversationPollCounter = 0

export const pollNewMessages = () => async (dispatch, getState) => {
  if (++conversationPollCounter >= 10) {
    // TODO uncomment to re-enable conversation polling
    // await dispatch(pollNewConversations())
  }

  dispatch(startPollingMessages())

  const { chat: { conversationMetadata } } = getState()

  let discoveredNewMessages = false

  for (const id in conversationMetadata) {
    const meta = conversationMetadata[id]

    for(var i = 0; i < meta.contacts.length; i++){
      if(meta.contacts[i] == identity().username){continue}

      const newMessages = await discoverMessage(meta, meta.contacts[i])

      if (newMessages.length) {
        for (const msg of newMessages) {
          if (msg.type === ContentTypes.Image) {
            dispatch(fetchImageForMessage(msg, meta))
          }
        }

        dispatch(finishLoadingConversationDetails(await getConversationById(id)))
        discoveredNewMessages = true
      }
    }
  }

  if (discoveredNewMessages) {
    dispatch(refreshConversationList())
  }

  dispatch(finishPollingMessages())
}

export const pollNewConversations = () => async (dispatch, getState) => {
  dispatch(startPollingConversations())

  const { chat: { conversationDetails } } = getState()
  const public_contacts = ["fulgid.id", "nmuth.id", "djhealy.id", "djh.id"]

  let discoveredNewConversation = false

  for (const contact of public_contacts) {
    const convoId = await discoverConversation(contact)

    if (convoId && !conversationDetails[convoId]) {
      dispatch(fetchConversationDetails(convoId))
      discoveredNewConversation = true
    }
  }

  if (discoveredNewConversation) {
    dispatch(refreshConversationList())
  }

  dispatch(finishPollingConversations())
}

export const refreshConversationList = () => async (dispatch, getState) => {
  const { contacts: { contactsById } } = getState()
  const meta = await loadConversationMetadata()

  for (const convoId in meta) {
    const convo = meta[convoId]

    for (const contactId of convo.contacts) {
      if (!contactsById[contactId]) {
        await dispatch(contactActions.fetchContactById(contactId))
      }
    }
  }

  dispatch(finishLoadingConversationList(await loadConversationMetadata()))
}

export const START_LOADING_FILE_CONTENT = 'START_LOADING_FILE_CONTENT'
export const startLoadingFileContent = payloadAction(START_LOADING_FILE_CONTENT)

export const FINISH_LOADING_FILE_CONTENT = 'FINISH_LOADING_FILE_CONTENT'
export const finishLoadingFileContent = payloadAction(FINISH_LOADING_FILE_CONTENT)

export const fetchImageForMessage = (message, convoOrId = null) => async (dispatch, getState) => {
  let convo = convoOrId

  if (typeof convo !== 'object') {
    const { chat: { activeConversation,
                    conversationMetadata } } = getState()

    convoOrId = convoOrId || activeConversation
    convo = conversationMetadata[convoOrId]
  }

  if (!convo) {
    return
  }

  const filename = message.content

  dispatch(startLoadingFileContent({ filename }))

  const data = await retrieveFileContentForMessage(message, convo)

  dispatch(finishLoadingFileContent({ filename, data }))
}

const loadConversationMetadata = async () => {
  const { conversations } = await getConversations()
  for (const key in conversations) {
    conversations[key] = new ConversationMetadata(conversations[key])
  }
  return conversations
}
