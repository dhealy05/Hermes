import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { chain } from 'lodash'
import { Sidebar } from '../components/Sidebar'
import { ThumbnailsList } from '../components/ThumbnailsList'
import { actions } from '../store'
import { Conversation } from '../models'
import { identity } from '../services'

const WithRedux = connect(
  state => ({
    conversationsById: state.chat.conversationMetadata,
    contactsById: state.contacts.contactsById
  }),
  dispatch => ({
    selectActiveConversation: id => dispatch(actions.chat.setActiveConversation(id)),
    startComposing: () => dispatch(actions.chat.startComposing())
  })
)

export const ChatSidebar = ({
  conversationsById,
  contactsById,
  selectActiveConversation,
  startComposing
}) => {
  const thumbnails = chain(conversationsById)
    .map(c => {
      const contacts = c.contacts.map(id => contactsById[id])
      const contactsArray = contacts.map(c => c.name)
      const title = (contactsArray.filter(name => name !== identity().profile.name)).join(', ')
      const lastSender = contactsById[c.thumbnail.lastSender]
      const lastSenderName = (lastSender && lastSender.name) || 'Anonymous'

      return {
        ...Conversation.getDefaultThumbnail(),

        id: Conversation.getId(c),
        title,
        lastSenderName,

        ...c.thumbnail
      }
    })
    .sortBy(c => new Date(c.timestamp))
    .reverse()
    .value()

  return (
    <Sidebar title="hermes"
             onComposeMessage={startComposing}>
      <ThumbnailsList thumbnails={thumbnails}
                      onSelectConversation={selectActiveConversation}/>
    </Sidebar>
  )
}

export const ChatSidebarContainer = compose(
  WithRedux
)(ChatSidebar)
