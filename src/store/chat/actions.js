import moment from 'moment'
import { payloadAction } from '../util'

export const RECV_MESSAGE = 'RECV_MESSAGE'
export const recvMessage = payloadAction(RECV_MESSAGE)

export const sendMessage = text => dispatch =>
  dispatch(recvMessage({
    sender: {
      isCurrentUser: true,
      displayName: 'you',
      avatar: { url: 'https://lorempixel.com/65/65' }
    },
    timestamp: moment(new Date()).toISOString(),
    text
  }))
