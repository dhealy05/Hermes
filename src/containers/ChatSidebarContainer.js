import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { map } from 'lodash'
import { Button } from '../components/Button'
import { Sidebar } from '../components/Sidebar'
import { ThumbnailsList } from '../components/ThumbnailsList'
import { actions } from '../store'
import { Conversation } from '../models'

const WithRedux = connect(
  state => ({
    conversationsById: state.chat.conversationMetadata,
    contactsById: state.contacts.contactsById
  }),
  dispatch => ({
    selectActiveConversation: id => dispatch(actions.chat.setActiveConversation(id))
  })
)

export const ChatSidebar = ({ conversationsById, contactsById, selectActiveConversation }) => {
  const thumbnails = map(conversationsById, c => {
    const contacts = c.contacts.map(id => contactsById[id])
    const title = contacts.map(c => c.name).join(', ')

    return {
      ...Conversation.getDefaultThumbnail(),

      id: Conversation.getId(c),
      title,

      ...c.thumbnail
    }
  })

  return (
    <Sidebar title="dchat">
      <ThumbnailsList thumbnails={thumbnails}
                      onSelectConversation={selectActiveConversation}/>
    </Sidebar>
  )
}

export const ChatSidebarContainer = compose(
  WithRedux
)(ChatSidebar)
