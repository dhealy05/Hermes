import {
  Conversation,
  Contact,
  Message
} from '../models'
import {
  saveConversationById
} from './conversations'
import {
  saveContactById
} from './contacts'

export const data = {
  contacts: [
    new Contact({
      id: 'mike',
      name: 'Mike Raymond'
    }),
    new Contact({
      id: 'sarah',
      name: 'Sarah Miller'
    }),
    new Contact({
      id: 'jessica',
      name: 'Jessica Belwick'
    })
  ],
  conversations: [
    new Conversation({
      contacts: ['mike'],
      messages: [
        new Message({
          sender: 'mike',
          content: 'hey man'
        })
      ]
    }),
    new Conversation({
      contacts: ['sarah'],
      messages: [
        new Message({
          sender: 'sarah',
          content: 'hi',
          sentAt: new Date('1970-01-01T00:00:00')
        }),
        new Message({
          sender: 'you',
          content: 'hello there',
          sentAt: new Date('1970-01-02T00:00:00')
        }),
        new Message({
          sender: 'sarah',
          content: 'general kenobi!',
          sentAt: new Date('1970-01-03T00:00:00')
        })
      ]
    }),
    new Conversation({
      contacts: ['sarah', 'jessica'],
      messages: [
        new Message({
          sender: 'sarah',
          content: 'here come',
          sentAt: new Date('1970-01-01T00:00:00')
        }),
        new Message({
          sender: 'you',
          content: 'dat',
          sentAt: new Date('1970-01-02T00:00:00')
        }),
        new Message({
          sender: 'jessica',
          content: 'boi',
          sentAt: new Date('1970-01-03T00:00:00')
        })
      ]
    })
  ]
}

export async function createMockData() {
  await Promise.all([
    ...data.contacts.map(c => saveContactById(c.id, c)),
    ...data.conversations.map(c => saveConversationById(Conversation.getId(c), c))
  ])
}
