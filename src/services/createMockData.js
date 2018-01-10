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
          content: 'general kenobi!',
          sentAt: new Date('1970-01-03T00:00:00')
        }),
        new Message({
          sender: 'you',
          content: 'hello there',
          sentAt: new Date('1970-01-02T00:00:00')
        }),
        new Message({
          sender: 'sarah',
          content: 'hi',
          sentAt: new Date('1970-01-01T00:00:00')
        })
      ]
    }),
    new Conversation({
      contacts: ['sarah', 'jessica'],
      messages: [
        new Message({
          sender: 'jessica',
          content: 'boi',
          sentAt: new Date('1970-01-03T00:00:00')
        }),
        new Message({
          sender: 'you',
          content: 'dat',
          sentAt: new Date('1970-01-02T00:00:00')
        }),
        new Message({
          sender: 'sarah',
          content: 'here come',
          sentAt: new Date('1970-01-01T00:00:00')
        })
      ]
    })
  ]
}

export async function createMockData() {
  // you'd think that sending these requests simultaneously would be a good
  // idea, but apparently that causes blockstack hub to return 503s. is that a
  // bug or a design decision??

  for (const c of data.contacts) {
    await saveContactById(c.id, c)
  }

  for (const c of data.conversations) {
    await saveConversationById(Conversation.getId(c), c)
  }
}
