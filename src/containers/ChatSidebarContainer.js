import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { map } from 'lodash'
import { Button } from '../components/Button'
import { Sidebar } from '../components/Sidebar'
import { Conversation } from '../models'
import { actions } from '../store'

const WithRedux = connect(
  state => ({
    conversations: map(state.chat.conversationMetadata)
  }),
  dispatch => ({
    selectActiveConversation: id => () => dispatch(actions.chat.setActiveConversation(id))
  })
)

export const ChatSidebar = ({ conversations, selectActiveConversation }) => {
  const convos = conversations.map(c => {
    const id = Conversation.getId(c)

    return (
      <Button key={id}
              onClick={selectActiveConversation(id)}>
        {c.contacts.join(', ')}
      </Button>
    )
  })

  return (
    <Sidebar title="dchat">
      {convos}
    </Sidebar>
  )
}

export const ChatSidebarContainer = compose(
  WithRedux
)(ChatSidebar)
