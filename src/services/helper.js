import { ContentTypes, Conversation, Message, Contact } from '../models'
import { identity } from './identity'
import { getConversationById, saveConversationById } from './conversations'
import { saveContactDataById } from './contacts'

export async function handleHelpMessage(message){
  console.log("ENTERED")
  if (message.content instanceof File) {
    console.log("File")
  }
  console.log(message.content)
  await saveMessage(message)
  await sendHermesMessage("Message Received")
}

export async function sendHermesMessage(text){
  const msg = new Message({
    sender: "hermesHelper",
    content: text,
    sentAt: new Date()
  })
  await saveMessage(msg)
}

export async function saveMessage(message){
  const convoID = identity().username + '-hermesHelper'
  const convo = await getConversationById(convoID)
  convo.messages.unshift(message)
  await saveConversationById(convoID, convo)
}

export async function initHelper(){
  await createBotContact()
  await createBotConversation()
}

export async function createBotConversation(){

  const convoID = identity().username + '-hermesHelper'

  const msg = new Message({
    sender: "hermesHelper",
    content: "Hi there! I'm the Hermes Help bot. Thanks for trying out Hermes! 😄",
    sentAt: new Date()
  })

  const convo = new Conversation({
    filename: 'hermesHelper',
    contacts: [identity().username, 'hermesHelper'],
    secret: 'hermesHelper',
    messages: [msg],
    pic: 'https://www.hihermes.co/images/avatars/HermesHelper.svg',
    readAt: '',
    wasRead: false,
    trusted: true
  })

  saveConversationById(convoID, convo)
}

export async function createBotContact(){
  var pic = 'https://www.hihermes.co/images/avatars/HermesHelper.svg'
  const contact = new Contact({
    id: 'hermesHelper',
    name: "Hermes Helper",
    pic,
    statusPage: '',
    statusSecret: '',
    trusted: true
  })
  await saveContactDataById("hermesHelper", contact)
}
