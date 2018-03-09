import { get, map, last, throttle } from 'lodash'
import swal from 'sweetalert'
import {
  ContentTypes,
  Conversation,
  ConversationMetadata,
  Message
} from '../../models'
import { HermesHelperId } from '../../constants'
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
  isUserOnHermes,
  setTyping,
  handleHelpMessage,
  getPublicFriendsForId,
  notify,
  initHelper
} from '../../services'
import { lookupProfile } from '../../services/identity'
import * as contactActions from '../contacts/actions'
import { payloadAction } from '../util'
import { hideSidebar, showActiveConversation } from '../sidebar/actions'

const FileSaver = require('file-saver');

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

  var finalIDs = []
  console.log(ids)

  //TODO: should have ".id" on entry
  for(var i = 0; i < ids.length; i++){
    var finalID = ids[i]
    if(!finalID.includes('.id')){
      finalID = ids[i] + '.id'
    }
    if(finalID === identity().username){
      continue
    }
    finalIDs.push(finalID)
  }

  for (var id of finalIDs) {
    if (!contactsById[id]) {
      dispatch(contactActions.fetchContactById(id))
    }
  }

  dispatch({
    type: SET_NEW_MESSAGE_RECIPIENTS,
    payload: finalIDs
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

    const sortedConversation = Object.keys(conversations).sort(function(a,b){
      return conversations[a].thumbnail.timestamp<conversations[b].thumbnail.timestamp
    })
    const defaultConvo = sortedConversation[0] || COMPOSE_CONVERSATION_ID

    await dispatch(fetchConversationDetails(defaultConvo))
  }

  dispatch(finishLoadingConversationList(conversations))
}

export const downloadFile = timestamp => async (dispatch, getState) => {
  const { chat: { activeConversation } } = getState()
  const convo = await getConversationById(activeConversation)
  const index = convo.messages.map(function(msg) { return msg.sentAt; }).indexOf(timestamp);
  const data = await retrieveFileContentForMessage(convo.messages[index], Conversation.getMetadata(convo))
  const file = dataURLtoFile(data, 'download.pdf')
  FileSaver.saveAs(file)
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
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

  convo.wasRead = true
  convo.readAt = new Date().toISOString()

  removeMsgAlert()

  dispatch(finishLoadingConversationDetails(await saveConversationById(id, convo)))
  dispatch(refreshConversationList())

  //resave convo sans expired messages + mark as read
  //dispatch(finishLoadingConversationDetails(convo))
}

export const MARK_CONVERSATION_AS_READ = 'MARK_CONVERSATION_AS_READ'

function removeMsgAlert() {
  /*const alertNumber = parseInt(
    get(document.title.match(/\d+/), '[0]'),
    10
  )

  if (!alertNumber) {
    return
  }

  if (alertNumber === 1) {
    document.title = 'Hermes'
    return
  }
  document.title = `(${alertNumber - 1}) Hermes`*/
  document.title = 'Hermes'
}


export const markActiveConversationAsRead = () => async (dispatch, getState) => {
  const { chat: { activeConversation } } = getState()

  if (!activeConversation
      || activeConversation === COMPOSE_CONVERSATION_ID
      || activeConversation.includes(HermesHelperId)) {
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

export const sendFile = (file, isImage) => async (dispatch, getState) => {
  const type = isImage ? ContentTypes.Image : ContentTypes.File
  const message = new Message({
    sender: identity().username,
    timestamp: new Date().toISOString(),
    type: type,
    content: file
  })

  return dispatch(sendRawMessage(message))
}

export const initHermesHelper = () => async (dispatch, getState) => {
  await initHelper()
  setTimeout(() => dispatch(refreshConversationList()), 500)
  setTimeout(() => dispatch(setActiveConversation(`${identity().username}-${HermesHelperId}`)), 1000)
}

export const START_SENDING_NEW_CONVERSATION = 'START_SENDING_NEW_CONVERSATION'
export const startSendingNewConversation = payloadAction(START_SENDING_NEW_CONVERSATION)

export const FINISH_SENDING_NEW_CONVERSATION = 'FINISH_SENDING_NEW_CONVERSATION'
export const finishSendingNewConversation = payloadAction(FINISH_SENDING_NEW_CONVERSATION)

export const sendRawMessage = message => async (dispatch, getState) => {

  const { chat: { activeConversation,
                  conversationMetadata,
                  newMessageRecipients,
                  messageExpirationDate } } = getState()

  message.expirationDate = messageExpirationDate
  dispatch(setExpirationDate(''))

  if (activeConversation === COMPOSE_CONVERSATION_ID) {

    // show an alert if the user you just messaged hasn't set up hermes yet
    const errorMessage = await checkHermes(newMessageRecipients)
    if (errorMessage) {
      swal(errorMessage)
      dispatch(setNewMessageRecipients([]))
      return
    }

    dispatch(startSendingNewConversation())

    const convo = await newConversation(message.content, newMessageRecipients)

    dispatch(setNewMessageRecipients([]))
    dispatch(setConversationDetails(convo))
    //dispatch(setActiveConversation(Conversation.getId(convo)))

    // TODO this timeout is necessary because sometimes it takes some time for
    // the metadata to be properly saved
    setTimeout(() => dispatch(refreshConversationList()), 500)
    setTimeout(() => dispatch(setActiveConversation(Conversation.getId(convo))), 1000)
    //dispatch(refreshConversationList())

    dispatch(finishSendingNewConversation())

    return
  }

  if (activeConversation.includes(HermesHelperId)) {
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
    if(message.type === ContentTypes.Image){dispatch(fetchImageForMessage(message, convo))}
  }

  dispatch(setConversationDetails(await saveMessageToJson(Conversation.getId(convo), message)))
  dispatch(refreshConversationList())
}

// cache promise from setTyping to avoid sending multiple simultaneous requests
let setTypingPromise = null

const _broadcastTypingThrottled = throttle((dispatch, getState) => {
  const BOT_CONVERSATION_ID = `${identity().username}-${HermesHelperId}`

  if (setTypingPromise) {
    console.info('already got a promise')
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
}, 5000)
export const broadcastTyping = () => _broadcastTypingThrottled

async function checkHermes(newMessageRecipients){
  let usersNotOnHermes = []
  let nullProfiles = []

  for (const id of newMessageRecipients) {

    const profile = await lookupProfile(id)

    if(profile == null){
      nullProfiles.push(id)
      continue
    }

    if (!(await isUserOnHermes(profile))) {
      usersNotOnHermes.push(profile)
    }
  }

  if(nullProfiles.length > 0){
    const ids = nullProfiles.join(', ')
    const message = `Oops! ${ids} hasn't signed on to Hermes yet. We'll let you know when they do :)`
    // TODO show a notification, not an alert
    return message
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
      if (contactId === identity().username
          || contactId === HermesHelperId) {
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

        const lastMessage = last(newMessages)
        var notificationContent = 'sent you an image'
        if(lastMessage.type === ContentTypes.Text){notificationContent = lastMessage.content}
        if(lastMessage.type === ContentTypes.File){notificationContent = 'sent you a file'}


        const { contacts: { contactsById } } = getState()
        const notificationTitle = get(contactsById, `[${contactId}].name`, contactId)

        notify(notificationTitle, { body: notificationContent, icon: "https://www.hihermes.co/images/icon.png" })
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

  console.log("POLLING NEW CONVOS")

  const { contacts: { contactsById },
          chat: { conversationDetails } } = getState()

  let discoveredNewConversation = false

  var previouslyPolledIds = []

  //primary poll for new contacts. this will probably mostly uncover group chats
  for (const contactId in contactsById) {
    if (contactId === identity().username
        || contactId === HermesHelperId) {
      continue
    }

    previouslyPolledIds.push(contactId)

    const profile = await lookupProfile(contactId)
    if (!(await isUserOnHermes(profile))) {
      continue
    }

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
    if (contactId === identity().username
        || contactId === HermesHelperId) {
      continue
    }
    var publicFriends = await getPublicFriendsForId(contactId)

    for (const contactId of publicFriends) {
      if (contactId === identity().username
          || contactId === HermesHelperId
          || previouslyPolledIds.includes(contactId)) {
        continue
      }

      const newConvo = await discoverConversation(contactId)
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
