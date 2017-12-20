import React from 'react'
import { storiesOf } from '@storybook/react'
import styled, { css } from 'styled-components'
import * as colors from '../../colors'
import { ChatView } from '../../components/ChatView'

const senders = {
  robBoss: {
    avatar: { url: 'https://lorempixel.com/64/64' },
    displayName: 'rob boss'
  },
  user: {
    isCurrentUser: true,
    avatar: { url: 'https://lorempixel.com/65/65' },
    displayName: 'you'
  }
}

const chat = {
  messages: [{
    sender: senders.robBoss,
    timestamp: new Date(),
    text: `
      All you need to paint is a few tools, a little instruction, and a vision in
      your mind. This is probably the greatest thing to happen in my life - to be
      able to share this with you. Let's build an almighty mountain. We'll put
      some happy little leaves here and there. Maybe he has a little friend that
      lives right over here. Steve wants reflections, so let's give him
      reflections.
    `
  },{
    sender: senders.robBoss,
    timestamp: new Date(),
    text: `
      The second message from Rob Boss
    `
  },{
    sender: senders.user,
    timestamp: new Date(),
    text: `
      I sent a message myself!
    `
  },{
    sender: senders.robBoss,
    timestamp: new Date(),
    text: `
      All you need to paint is a few tools, a little instruction, and a vision in
      your mind. This is probably the greatest thing to happen in my life - to be
      able to share this with you. Let's build an almighty mountain. We'll put
      some happy little leaves here and there. Maybe he has a little friend that
      lives right over here. Steve wants reflections, so let's give him
      reflections.
    `
  },{
    sender: senders.robBoss,
    timestamp: new Date(),
    text: `
      The second message from Rob Boss
    `
  },{
    sender: senders.user,
    timestamp: new Date(),
    text: `
      I sent a message myself!
    `
  }]
}

storiesOf('Chat', module)
  .add('p2p', () => <ChatView {...chat}/>)
