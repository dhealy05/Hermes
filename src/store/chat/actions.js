import { map, throttle } from 'lodash'
import {
  ContentTypes,
  Conversation,
  ConversationMetadata,
  Message
} from '../../models'
import {
  acknowledgeConversation,
  deleteConversation as deleteConversationService,
  getConversations,
  getConversationById,
  saveConversationById,
  sendMessage as saveMessageToJson,
  newConversation,
  discoverMessages,
  discoverConversation,
  uploadFileForOutbox,
  retrieveFileContentForMessage,
  identity,
  lookupProfile,
  isUserOnHermes,
  setTyping,
  handleHelpMessage,
  getLastSeenForId,
  getPublicFriendsForId
} from '../../services'
import * as contactActions from '../contacts/actions'
import { payloadAction } from '../util'
import { hideSidebar, showActiveConversation } from '../sidebar/actions'
import swal from 'sweetalert'

export const SET_MESSAGE_INPUT_VALUE = 'SET_MESSAGE_INPUT_VALUE'
export const setMessageInputValue = payloadAction(SET_MESSAGE_INPUT_VALUE)

export const SET_MESSAGE_EXPIRATION_DATE = 'SET_MESSAGE_EXPIRATION_DATE'
export const setExpirationDate = payloadAction(SET_MESSAGE_EXPIRATION_DATE)

export const COMPOSE_CONVERSATION_ID = 'compose'

export const SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION'
export const setActiveConversation = id => async (dispatch, getState) => {
  const { chat: { conversationDetails } } = getState()

  dispatch(showActiveConversation(id))

  if (id && id !== COMPOSE_CONVERSATION_ID && !conversationDetails[id]) {
    // not using `await` because we want to show a loading state
    dispatch(fetchConversationDetails(id))
  }

  return dispatch({
    type: SET_ACTIVE_CONVERSATION,
    payload: id
  })
}

export const startComposing = () => async (dispatch, getState) => {
  dispatch(hideSidebar())
  return dispatch ({
    type: SET_ACTIVE_CONVERSATION,
    payload: COMPOSE_CONVERSATION_ID
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

export const SET_NEW_MESSAGE_RECIPIENTS = 'SET_NEW_MESSAGE_RECIPIENTS'
export const setNewMessageRecipients = ids => (dispatch, getState) => {
  const { contacts: { contactsById } } = getState()

  //TODO: should have ".id" on entry
  for(var i = 0; i < ids.length; i++){
    if(!ids[i].includes('.id')){
      ids[i] = ids[i] + '.id'
    }
  }

  for (var id of ids) {
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

  for (var i = 0; i < convo.messages.length; i++) {
    if (convo.messages[i].type === ContentTypes.Image) {
      dispatch(fetchImageForMessage(convo.messages[i], convo))
    }
    //if msg.expirationDate has passed, remove from array
    if(convo.messages[i].expirationDate !== ''){
      if(new Date(convo.messages[i].expirationDate) < new Date()){
        convo.messages.splice(i, 1)
      }
    }
  }

  saveConversationById(id, convo)
  //resave convo sans expired messages

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

export const sendBtc = amt => async (dispatch, getState) => {
  const value = amt.toString()
  //const defaultMessage = identity().username + " just sent you " + value + " bitcoins!"
  const defaultMessage = ''
  const message = new Message({
    sender: identity().username,
    timestamp: new Date().toISOString(),
    content: defaultMessage,
    paymentStatus: 'paid',
    value: value
  })
  return dispatch(sendRawMessage(message))
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

  const BOT_CONVERSATION_ID = identity().username + '-hermesHelper'

  const { chat: { activeConversation,
                  conversationMetadata,
                  newMessageRecipients,
                  messageExpirationDate } } = getState()

  message.expirationDate = messageExpirationDate
  dispatch(setExpirationDate(''))

  if (activeConversation === COMPOSE_CONVERSATION_ID) {

    // show an alert if the user you just messaged hasn't set up hermes yet
    var errorMessage = await checkHermes(newMessageRecipients)
    if(errorMessage != ''){swal(errorMessage); dispatch(setNewMessageRecipients([])); return}

    dispatch(startSendingNewConversation())

    const convo = await newConversation(message.content, newMessageRecipients)

    dispatch(setNewMessageRecipients([]))
    dispatch(setConversationDetails(convo))
    dispatch(setActiveConversation(Conversation.getId(convo)))

    // TODO this timeout is necessary because sometimes it takes some time for
    // the metadata to be properly saved
    setTimeout(() => dispatch(refreshConversationList()), 200)

    dispatch(finishSendingNewConversation())

    return
  }

  if(activeConversation === BOT_CONVERSATION_ID){
    //await handleHelpMessage(message)
    dispatch(setConversationDetails(await handleHelpMessage(message)))
    dispatch(refreshConversationList())
    return
  }

  const convo = conversationMetadata[activeConversation]

  if (!convo) {
    throw new Error(`tried to send to nonexistent conversation ${activeConversation}`)
  }

  if (!convo.trusted) {
    await dispatch(acceptActiveConversation())
  }

  if (message.content instanceof File) {
    // kind of hacky, but it works for now
    message.content = await uploadFileForOutbox(activeConversation, message.content)
    dispatch(fetchImageForMessage(message, convo))
  }

  dispatch(setConversationDetails(await saveMessageToJson(Conversation.getId(convo), message)))
  dispatch(refreshConversationList())
}

// cache promise from setTyping to avoid sending multiple simultaneous requests
let setTypingPromise = null
export const broadcastTyping = throttle(() => (dispatch, getState) => {

  const BOT_CONVERSATION_ID = identity().username + '-hermesHelper'

  if (setTypingPromise) {
    return setTypingPromise
  }

  const { chat: { activeConversation,
                  conversationMetadata } } = getState()

  if (!activeConversation
      || activeConversation === COMPOSE_CONVERSATION_ID
      || !conversationMetadata[activeConversation]
      || activeConversation === BOT_CONVERSATION_ID) {
    return
  }

  setTypingPromise = setTyping(conversationMetadata[activeConversation])
    .then(x => {
      setTypingPromise = null
      return x
    })
  return setTypingPromise
}, 5000) // typing indicator is good for 30 seconds so we don't have to call setTyping very often

async function checkHermes(newMessageRecipients){
  let usersNotOnHermes = []

  for (const id of newMessageRecipients) {
    const profile = await lookupProfile(id)

    if (!(await isUserOnHermes(profile))) {
      usersNotOnHermes.push(profile)
    }
  }

  if (usersNotOnHermes.length > 0) {
    const names = usersNotOnHermes.map(p => p.name).join(', ')
    const message = `Oops! ${names} hasn't signed on to Hermes yet. We'll let you know when they do :)`
    // TODO show a notification, not an alert
    return message
  }
  return ''
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

export const SET_CONTACT_TYPING = 'SET_CONTACT_TYPING'
export const setContactTyping = payloadAction(SET_CONTACT_TYPING)

export const START_POLLING_CONVERSATIONS = 'START_POLLING_CONVERSATIONS'
export const startPollingConversations = payloadAction(START_POLLING_CONVERSATIONS)

export const FINISH_POLLING_CONVERSATIONS = 'FINISH_POLLING_CONVERSATIONS'
export const finishPollingConversations = payloadAction(FINISH_POLLING_CONVERSATIONS)

const NEW_CONVERSATION_POLL_INTERVAL = 5
let conversationPollCounter = NEW_CONVERSATION_POLL_INTERVAL

export const pollNewMessages = () => async (dispatch, getState) => {

  if (++conversationPollCounter >= NEW_CONVERSATION_POLL_INTERVAL) {
    conversationPollCounter = 0
    await dispatch(pollNewConversations())
  }

  dispatch(startPollingMessages())

  const { chat: { conversationMetadata } } = getState()

  let discoveredNewMessages = false

  for (const id in conversationMetadata) {
    const meta = conversationMetadata[id]

    for (const contactId of meta.contacts) {
      if (contactId == identity().username || contactId == 'hermesHelper') {
        continue
      }

      const {
        messages: newMessages,
        typing
      } = await discoverMessages(meta, contactId)

      dispatch(setContactTyping({
        conversationId: id,
        contactId,
        typing
      }))

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

  console.log("POLLING NEW CONVOS --ME")

  const { contacts: { contactsById },
          chat: { conversationDetails } } = getState()

  let discoveredNewConversation = false

  //primary poll for new contacts. this will probably mostly uncover group chats
  for (const contactId in contactsById) {
    if(contactId == identity().username || contactId == 'hermesHelper'){continue}

    const convo = await discoverConversation(contactId)

    if (!convo || conversationDetails[convo]) {
      continue
    }

    discoveredNewConversation = true

    if (convo.trusted) {
      dispatch(fetchConversationDetails(convo))
    }
  }

  //secondary poll for friends of friends
  for (const contactId in contactsById) {
    if(contactId == identity().username || contactId == 'hermesHelper'){continue}
    var publicFriends = await getPublicFriendsForId(contactId)
    for(var i = 0; i < publicFriends.length; i++){
      if(publicFriends[i] == identity().username || publicFriends[i] == 'hermesHelper'){continue}
      const newConvo = await discoverConversation(publicFriends[i])
      if (!newConvo || conversationDetails[newConvo]) {
        continue
      }
      discoveredNewConversation = true
      if (newConvo.trusted) {
        dispatch(fetchConversationDetails(newConvo))
      }
    }
  }

  if (discoveredNewConversation) {
    dispatch(refreshConversationList())
  }

  dispatch(finishPollingConversations())
}

export const acceptActiveConversation = () => async (dispatch, getState) => {
  const { chat: { activeConversation,
                  conversationMetadata } } = getState()

  const convo = conversationMetadata[activeConversation]

  if (!convo || convo.trusted) {
    return
  }

  dispatch(finishLoadingConversationDetails(await acknowledgeConversation(convo)))
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
