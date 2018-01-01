import { Model } from './model'

export const ContentTypes = {
  Text: 1
}

export const Conversation = Model('Conversation', {
  /**
   * List of IDs of contacts involved in the conversation
   */
  contacts: [],

  /**
   * List of messages contained in the conversation
   */
  messages: []
})

Conversation.getId = ({ contacts }) => contacts.sort().join('-')

Conversation.getThumbnail = convo => {
  const [firstMessage] = convo.messages

  if (!firstMessage) {
    return {
      name: convo.name,
      contentType: 1,
      content: '',
      time: new Date().toISOString()
    }
  }

  return {
    name: convo.name,
    contentType: firstMessage.type,
    content: firstMessage.content,
    time: firstMessage.time
  }
}

Conversation.getMetadata = convo => ({
  id: Conversation.getId(convo),
  thumbnail: Conversation.getThumbnail(convo),
  contacts: convo.contacts
})

export const Message = Model('Message', {
  /**
   * ID of the contact who sent this message
   */
  sender: '',

  /**
   * What type of content the message contains
   */
  type: ContentTypes.Text,

  /**
   * String content of the message
   */
  content: '',

  sentAt: new Date().toISOString()
})
