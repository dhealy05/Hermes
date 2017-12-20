import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import * as faker from 'faker'
import * as colors from '../colors'
import { Message } from './Message'
import { AppBar } from './AppBar'
import { Button } from './Button'

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

const Contacts = styled.div`
  min-width: 16.66%;
  flex-grow: 1;
  padding: 9px;
  border-right: 1px solid ${colors.border};
`

const Messaging = styled.div`
  flex-grow: 5;
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  overflow-y: auto;
`

export class ChatView extends React.Component {
  state = {
    msgInput: ''
  }

  senderIdx = 1

  recvFakeMessage = () => {
    this.props.onRecvMessage({
      sender: {
        displayName: faker.name.findName(),
        avatar: {
          url: `https://lorempixel.com/${65 + this.senderIdx}/${65 + this.senderIdx}`
        }
      },
      timestamp: moment().toISOString(),
      text: faker.lorem.paragraph()
    })

    this.senderIdx++
  }

  onMsgInputChange = evt => {
    this.setState({ msgInput: evt.target.value })
  }

  onMsgInputKeyUp = evt => {
    if (evt.keyCode === 13) {
      this.props.onSendMessage(this.state.msgInput)
      this.setState({
        msgInput: ''
      })
    }
  }

  render() {
    const { messages, onSignOut } = this.props

    const messageEls = messages.map(({ text, sender, ...msg }, i) => (
      <Message key={i}
               direction={sender.isCurrentUser ? 'right' : 'left'}
               sender={sender}
               paragraphs={[{ text }]}
               {...msg}/>
    ))

    return (
      <MainLayout>
        <AppBar onSignOut={onSignOut} />
        <BodyLayout>
          <Contacts>
            <Button linkButton onClick={this.recvFakeMessage}>
              get mock message
            </Button>
          </Contacts>
          <Messaging>
            {messageEls}
            <input type="text"
                   placeholder="type your message"
                   style={{width: '100%'}}
                   value={this.state.msgInput}
                   onChange={this.onMsgInputChange}
                   onKeyUp={this.onMsgInputKeyUp}/>
          </Messaging>
        </BodyLayout>
      </MainLayout>
    )
  }
}
ChatView.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    sender: PropTypes.shape({
      isCurrentUser: PropTypes.bool,
      avatar: PropTypes.shape({ url: PropTypes.string.isRequired }),
      displayName: PropTypes.string.isRequired
    }).isRequired,
    timestamp: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })),
  onRecvMessage: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
}
