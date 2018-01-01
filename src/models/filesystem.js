import { Model } from './base'

export class ConversationListFile extends Model {
  static filename = 'conversations.json'

  conversations = {} // [key: conversationId]: ConversationMetadata

  constructor(attrs) {
    super(attrs)

    if (Array.isArray(this.conversations)) {
      this.conversations = this.conversations.reduce(
        (accm, c) => ({ ...accm, [c.id]: c }),
        {}
      )
    }
  }
}

export class ContactListFile extends Model {
  static filename = 'contacts.json'

  contacts = {} // [key: contactId]: Contact

  constructor(attrs) {
    super(attrs)

    if (Array.isArray(this.contacts)) {
      this.contacts = this.contacts.reduce(
        (accm, c) => ({ ...accm, [c.id]: c }),
        {}
      )
    }
  }
}
