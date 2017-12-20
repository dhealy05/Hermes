import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Message } from './Message'

const MainLayout = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const BodyLayout = styled.div`
  display: flex;
  flex-grow: 1;
  width: 100%;
`

const AppBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 72px;
  width: 100%;
  border-bottom: 1px solid ${colors.border}
`

const AppBarInner = styled.div`
  margin: 22px 36px;
`

const Contacts = styled.div`
  min-width: 16.66%;
  flex-grow: 1;
  padding: 9px;
  border-right: 1px solid ${colors.border};
`

const Messaging = styled.div`
  flex-grow: 5;
  margin: 24px;
  overflow-y: auto;
`

export const ChatView = props => {
  const messages = props.messages.map(({ text, sender, ...msg }, i) => (
    <Message key={i}
             direction={sender.isCurrentUser ? 'right' : 'left'}
             sender={sender}
             paragraphs={[{ text }]}
             {...msg}/>
  ))

  return (
    <MainLayout>
      <AppBarContainer>
        <AppBarInner>dchat</AppBarInner>
      </AppBarContainer>
      <BodyLayout>
        <Contacts>
          this will be a list of contacts probably
        </Contacts>
        <Messaging>
          {messages}
        </Messaging>
      </BodyLayout>
    </MainLayout>
  )
}
ChatView.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    sender: PropTypes.shape({
      isCurrentUser: PropTypes.bool,
      avatar: PropTypes.shape({ url: PropTypes.string.isRequired }),
      displayName: PropTypes.string.isRequired
    }).isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    text: PropTypes.string.isRequired
  }))
}
