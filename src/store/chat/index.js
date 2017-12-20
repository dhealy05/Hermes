import * as _actions from './actions'

const robBoss = {
  avatar: { url: 'https://lorempixel.com/64/64' },
  displayName: 'rob boss'
}

export const namespace = 'chat'

export const actions = _actions

const initialState = {
  // TODO messages should be organized by conversation, but this is a start
  messages: [{
    sender: robBoss,
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
    sender: robBoss,
    timestamp: new Date(),
    text: `
      Hello? Are you still there?
    `
  }]
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actions.RECV_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      }
    default:
      return state
  }
}
