import React, { Component } from 'react'
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

export class ChatSidebar extends Component {
  state = { searchValue: '' }
  handleSearchChange = evt => this.setState({ searchValue: evt.target.value })

  render() {
    const {
      activeConversation,
      conversationsById,
      contactsById,
      selectActiveConversation,
      startComposing
    } = this.props;
    const { searchValue } = this.state;
    const searchValueUpper = searchValue && searchValue.toUpperCase()
    const thumbnails = chain(conversationsById)
      .map(c => {
        const contacts = c.contacts.map(id => contactsById[id])

        const title = contacts
          .filter(({ id }) => id !== identity().username)
          .map(contact => contact.name)
          .join(', ')

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
      .filter(c => !searchValue || c.title.toUpperCase().includes(searchValueUpper))
      .sortBy(c => new Date(c.timestamp))
      .reverse()
      .value()

    return (
      <Sidebar title="hermes"
              onComposeMessage={startComposing}>
        <Search value={searchValue} onChange={this.handleSearchChange} />
        <ThumbnailsList thumbnails={thumbnails}
                        activeConversation={activeConversation}
                        onSelectConversation={selectActiveConversation}/>
      </Sidebar>
    )
  }
}

export const ChatSidebarContainer = compose(
  WithRedux
)(ChatSidebar)
