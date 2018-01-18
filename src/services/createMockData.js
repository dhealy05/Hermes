import {
  Conversation,
  Contact,
  Message
} from '../models'
import {
  saveConversationById
} from './conversations'
import { saveContactsFile } from './contacts'

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
      filename: 'XYZ',
      secret: '1A2A',
      messages: [
        new Message({
          sender: 'mike',
          content: 'hey man'
        })
      ]
    }),
    new Conversation({
      contacts: ['sarah'],
      filename: 'ABC',
      secret: '3B4B',
      messages: [
        new Message({
          sender: 'sarah',
          content: 'general kenobi!',
          sentAt: new Date('1970-01-03T00:00:00')
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
      filename: '123',
      secret: '5C6C',
      messages: [
        new Message({
          sender: 'jessica',
          content: 'boi',
          sentAt: new Date('1970-01-03T00:00:00')
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

  await saveContactsFile(data.contacts)

  for (const c of data.conversations) {
    await saveConversationById(Conversation.getId(c), c)
  }
}
