import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { chain } from 'lodash'
import { Sidebar } from '../components/Sidebar'
import { Search } from '../components/Search'
import { ThumbnailsList } from '../components/ThumbnailsList'
import { actions } from '../store'
import { Conversation } from '../models'
import { identity } from '../services'

const WithRedux = connect(
  state => ({
    activeConversation: state.chat.activeConversation,
    conversationsById: state.chat.conversationMetadata,
    contactsById: state.contacts.contactsById
  }),
  dispatch => ({
    selectActiveConversation: id => dispatch(actions.chat.setActiveConversation(id)),
    startComposing: () => dispatch(actions.chat.startComposing())
  })
)

export const ChatSidebar = ({
  activeConversation,
  conversationsById,
  contactsById,
  selectActiveConversation,
  startComposing
}) => {
  const thumbnails = chain(conversationsById)
    .map(c => {
      const contacts = c.contacts.map(id => contactsById[id])
      var contactsArray = contacts.map(c => c.name)
      var title = (contactsArray.filter(name => name !== identity().profile.name)).join(', ')
      if(identity().profile.name == '' || identity().profile.name == null){
        var titleArray = []
        for(var i = 0; i < contacts.length; i++){
          if(contacts[i].id !== identity().username){
            titleArray.push(contacts[i].name)
          }
        }
        title = titleArray.join(', ')
      }
      const lastSender = contactsById[c.thumbnail.lastSender]
      const lastSenderName = (lastSender && lastSender.name) || (lastSender && lastSender.id) || 'Anonymous'

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
      <Search />
      <ThumbnailsList thumbnails={thumbnails}
                      activeConversation={activeConversation}
                      onSelectConversation={selectActiveConversation}/>
    </Sidebar>
  )
}

export const ChatSidebarContainer = compose(
  WithRedux
)(ChatSidebar)
