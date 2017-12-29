import moment from 'moment'
import { payloadAction } from '../util'
import { makeConversations } from './makeConversations'
import { getThumbnails } from './getConversations'
import { getConversation } from './getConversations'

export const RECV_MESSAGE = 'RECV_MESSAGE'
export const recvMessage = payloadAction(RECV_MESSAGE)

export const sendMessage = text => dispatch => {
  //Uncomment and run to have dummy conversation data available
  makeConversations()
  //Run to retrive thumbnails of dummy conversation data
  getThumbnails().then(t => console.info(t))

  if (text.length === 0) {
    return
  }

  dispatch(recvMessage({
    sender: {
      isCurrentUser: true,
      displayName: 'you',
      avatar: { url: 'https://lorempixel.com/65/65' }
    },
    timestamp: moment(new Date()).toISOString(),
    text
  }))
}
