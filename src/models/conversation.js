import { Model } from './model'

export const CURRENT_THUMBNAIL_VERSION = 1

export const ContentTypes = {
  Text: 1,
  Image: 2
  //TODO: change this to a string so it can be encoded in transit
}

export const ConversationMetadata = Model('ConversationMetadata', {
  id: '',
  filename: '',
  secret: '',
  contacts: [],
  pic: '',
  thumbnail: {},
  readAt: '',
  wasRead: false
})

export const Conversation = Model('Conversation', {
  /**
   * List of IDs of contacts involved in the conversation
   */
  contacts: [],

  /**
   * Filename for the public file where outgoing messages are saved
   */
  filename: '',

  /**
   * The secret for the convo
   */
  secret: '',

  /**
   * The pic of the sender
   */
  pic: '',

  /**
   * List of messages contained in the conversation
   */
  messages: [],

  /**
   * Read receipt to calculate if read
   */
  readAt: '',

  /**
   * Read bool for display purposes
   */
  wasRead: false
})

Conversation.getId = ({ contacts }) => contacts.sort().join('-')

Conversation.getDefaultThumbnail = () => ({
  id: null,
  version: CURRENT_THUMBNAIL_VERSION,
  contentType: ContentTypes.Text,
  content: '',
  timestamp: new Date().toISOString(),
  pic: 'https://lorempixel.com/64/64',
  readAt: '',
  wasRead: false
})

Conversation.getThumbnail = convo => {
  const id = Conversation.getId(convo)
  const version = CURRENT_THUMBNAIL_VERSION
  const [firstMessage] = convo.messages //should this be convo.messages[0]?

  const base = Conversation.getDefaultThumbnail()

  if (!firstMessage) {
    return {
      ...base,
      id,
      version
    }
  }

  return {
    ...base,
    id,
    version,
    contentType: firstMessage.type,
    content: firstMessage.content,
    lastSender: firstMessage.sender,
    timestamp: firstMessage.sentAt,
    pic: convo.pic,
    readAt: convo.readAt,
    wasRead: convo.wasRead
  }
}

Conversation.getMetadata = convo => new ConversationMetadata({
  id: Conversation.getId(convo),
  thumbnail: Conversation.getThumbnail(convo),
  contacts: convo.contacts,
  filename: convo.filename,
  secret: convo.secret,
  pic: convo.pic,
  readAt: convo.readAt,
  wasRead: convo.wasRead
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

  sentAt: new Date().toISOString(),

  expirationDate: '',

  isPaid: '0',

  value: '0.00'
})
