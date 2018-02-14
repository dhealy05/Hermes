import React from 'react'
import { connect } from 'react-redux'
import { SidebarContentTypes } from '../store/sidebar/contentTypes'
import { InfoSidebar } from '../components/InfoSidebar'
import { InfoSidebarConversation } from '../components/InfoSidebarConversation'
import { InfoSidebarProfile } from '../components/InfoSidebarProfile'
import { InfoSidebarMe } from '../components/InfoSidebarMe'

const PopulatedSidebar = ({
  visible,
  content = {},
  contacts = [],
  identity,
}) => {
  if (!visible) return null;

  let renderedContent = null;
  switch(content.type) {
    case SidebarContentTypes.Conversation:
      renderedContent = <InfoSidebarConversation contacts={contacts} />
      break;
    case SidebarContentTypes.Profile:
      renderedContent = content.profile.id === identity.username ?
        <InfoSidebarMe profile={content.profile} /> :
        <InfoSidebarProfile profile={content.profile} />
      break;
    default:
  }

  return (
    <InfoSidebar>{renderedContent}</InfoSidebar>
  )
}

export const InfoSidebarContainer = connect(
  state => {
    const identity = state.auth.identity
    const { visible, content } = state.sidebar
    const contacts = content &&
                     content.conversation &&
                     content.conversation.contacts &&
                     content.conversation.contacts.map(contact => state.contacts.contactsById[contact])
    if (contacts) {
      const allMessages = Object.values(state.chat.conversationDetails).reduce((all, conversation) => ([...all, ...conversation.messages]), []);
      contacts.forEach(c => {
        const lastMessage = allMessages
          .filter(m => m.sender === c.id)
          .sort((a, b) => (new Date(b.sentAt) - new Date(a.sentAt)))
          .reverse()
          .pop()
        c.lastMessageTimestamp = lastMessage && lastMessage.sentAt
      })
    }
    return {
      visible,
      content,
      contacts,
      identity,
    }
  }
)(PopulatedSidebar)
