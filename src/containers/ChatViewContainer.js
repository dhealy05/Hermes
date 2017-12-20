import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { ChatView } from '../components/ChatView'
import { WithAuthChallenge } from './WithAuthChallenge'
import { actions } from '../store'

export const ChatViewContainer = compose(
  WithAuthChallenge,
  connect(
    state => ({
      messages: state.chat.messages
    }),
    dispatch => ({
      onSendMessage: text => dispatch(actions.chat.sendMessage(text))
    })
  )
)(ChatView)
