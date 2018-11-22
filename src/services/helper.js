import { Conversation, Message } from '../models'
import { HermesHelperId, HermesHelperContact } from '../constants'
import { identity } from './identity'
import { getConversationById, saveConversationById } from './conversations'
import { saveContactDataById } from './contacts'

const helperConvoId = () => `${HermesHelperId}-${identity().username}`

export async function handleHelpMessage(message){
  if (message.content instanceof File) {
    console.log("File")
    await sendHermesMessage("Oops, don't really handle pictures!")
  }
  var convo = await saveUserMessage(message)
  return await switchboard(message.content, convo)
}

export async function switchboard(text, convo){
  if(text.includes("contact")){
    return await sendHermesMessage("To add a contact, click the + in the top right of the screen. Search their name and click it. That’s it! If you want to start a conversation, go ahead and send them a message.", convo)
  } else if(text.includes("conversation")){
    return await sendHermesMessage("To start a conversation, click the + in the top left of the screen. Search their name and click it. Type your message and hit return to send!", convo)
  } else if(text.includes("bitcoin")){
    return await sendHermesMessage("Send and withdraw Bitcoin: You get a built in Bitcoin wallet, derived from your Blockstack application private key, right here on Hermes. To find your address and to withdraw, click the gear on the top right of your screen, and then select 'Settings'.  You can send Bitcoin to people you’re chatting with by hitting the Bitcoin symbol in the button of your screen. For group chats, your Bitcoin will be divided evenly among the group.", convo)
  } else if(text.includes("group")){
    return await sendHermesMessage("To start a group chat, click the plus on the top left of your screen. Search for IDs and add all the ones you want. Then send your message!", convo)
  } else if(text.includes("dissappearing") || text.includes("disappearing") || text.includes("dissapearing")){
    return await sendHermesMessage("To send a disappearing message, click the timer icon in the bottom panel and set how many hours your message should last for. Then send your message!", convo)
  } else if(text.includes("data") || text.includes("protected")){
    return await sendHermesMessage("Your data isn’t accessible to anyone but you. Data saved privately is encrypted before being saved to the storage location of your choosing. On Hermes, messages are sent via public data, and everything, even metadata, is encrypted and stored in locations known only to you and your recipients. There is some information, like when you were last online and who you’re friends, that all of your existing friends can see; but you have to approve or initiate any friend request.", convo)
  } else if(text.includes("unstoppable")){
    return await sendHermesMessage("Is Hermes really unstoppable? Well, not exactly. If they shut off the internet, we’re toast 🍞🔥😅…Really though, Blockstack’s decentralized structure means it’s pretty hard to kill Hermes. Right now, you connect to the Blockstack.org node, but in the future you’ll be able to connect to your own or one of your choosing. Take that, censors!", convo)
  } else if(text.includes("find")){
    return await sendHermesMessage("Since Hermes is decentralized, starting a conversation is a little different than what you're used to. If you don't have any contacts, you won't receive any messages. Think of it as a super strong spam filter! Once you add a contact, you can receive conversation requests from them or any of their friends. If you accept, they'll be able to see public data like your friends list, and when you were last online. If you send a new message to someone, you're asking them to be your friend. 🤝👭👬", convo)
  } else{
    return await sendHermesMessage("Sorry, idk what to say to that...I'm trying to learn English, but I'm only fluent in zeroes and ones!", convo)
  }
}

export async function saveUserMessage(text){
  const convoId = helperConvoId()
  const convo = await getConversationById(convoId)
  convo.messages.unshift(text)
  return convo
}

export async function sendHermesMessage(text, convo){
  const msg = new Message({
    sender: HermesHelperId,
    content: text,
    sentAt: new Date()
  })
  convo.messages.unshift(msg)
  return await saveConversationById(helperConvoId(), convo)
  //return await saveMessage(msg)
}

export async function saveMessage(message){
  const convoId = helperConvoId()
  const convo = await getConversationById(convoId)
  convo.messages.unshift(message)
  return await saveConversationById(convoId, convo)
}

export async function initHelper(){
  await createBotContact()
  await createBotConversation()
  //window.location.reload()
  //await sendHermesMessage("Hermes lets you talk to anyone with Blockstack ID in a way that’s impossible to surveil or censor. Welcome to the future 🚀🚀🚀")
  //await sendHermesMessage("Since the technology that powers us, Blockstack, is brand new, it might not be exactly what you’re used to. That’s why I’m here to help! Ask me questions and I’ll do my best to answer them.")
  //await sendHermesMessage("Suggestions: add a contact, start a conversation, send bitcoin, send a disappearing message, start a group chat, how is my data protected, is Hermes really unstoppable, find other users")
}

export async function createBotConversation(){

  const convoId = helperConvoId()

  const msg = new Message({
    sender: HermesHelperId,
    content: "Hi there! I'm the Hermes Help bot. Thanks for trying out Hermes! 😄",
    sentAt: new Date()
  })

  const msg1 = new Message({
    sender: HermesHelperId,
    content: "Hermes lets you talk to anyone with Blockstack ID in a way that’s impossible to surveil or censor. Welcome to the future 🚀🚀🚀",
    sentAt: new Date()
  })

  const msg2 = new Message({
    sender: HermesHelperId,
    content: "The technology that powers us, Blockstack, is brand new, so it might need some explaining. That’s why I’m here to help! 🤓",
    sentAt: new Date()
  })

  const msg3 = new Message({
    sender: HermesHelperId,
    content: "Since Hermes is decentralized, starting a conversation is a little different than what you're used to. If you don't have any contacts, you won't receive any messages. Think of it as a super strong spam filter! Once you add a contact, you can receive conversation requests from them or any of their friends. If you accept, they'll be able to see public data like your friends list, and when you were last online. If you send a new message to someone, you're asking them to be your friend. 🤝👭👬",
    sentAt: new Date()
  })

  const msg4 = new Message({
    sender: HermesHelperId,
    content: "Suggestions: add a contact, start a conversation, send bitcoin, send a disappearing message, start a group chat, how is my data protected, is Hermes really unstoppable, find other users.",
    sentAt: new Date()
  })

  const convo = new Conversation({
    filename: HermesHelperId,
    contacts: [HermesHelperId, identity().username],
    secret: HermesHelperId,
    messages: [msg4, msg3, msg2, msg1, msg],
    pic: 'https://www.hihermes.co/images/avatars/HermesHelper.svg',
    readAt: '',
    wasRead: false,
    trusted: true
  })

  saveConversationById(convoId, convo)
}

export async function createBotContact(){
  await saveContactDataById(HermesHelperId, HermesHelperContact)
}
