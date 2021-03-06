import {
  applyMiddleware,
  createStore,
  combineReducers,
  compose
} from 'redux'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import { createLogger } from 'redux-logger'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import * as auth from './auth'
import * as chat from './chat'
import * as contacts from './contacts'
import * as emoji from './emoji'
import * as sidebar from './sidebar'
import * as baseActions from './actions'

export const actions = {
  ...baseActions,
  auth: auth.actions,
  chat: chat.actions,
  contacts: contacts.actions,
  emoji: emoji.actions,
  sidebar: sidebar.actions,
}

const reducer = combineReducers({
  [auth.namespace]: auth.reducer,
  [chat.namespace]: chat.reducer,
  [contacts.namespace]: contacts.reducer,
  [emoji.namespace]: emoji.reducer,
  [sidebar.namespace]: sidebar.reducer,
  router: routerReducer
})

export const history = createHistory()

const devtoolsOptions = {
  actionCreators: actions
}
const devtoolsCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
const composeEnhancers = devtoolsCompose
                       ? devtoolsCompose(devtoolsOptions)
                       : compose

const FILTERED_ACTIONS = [
  chat.actions.START_POLLING_MESSAGES,
  chat.actions.FINISH_POLLING_MESSAGES,
  chat.actions.START_POLLING_CONVERSATIONS,
  chat.actions.FINISH_POLLING_CONVERSATIONS,
  chat.actions.SET_CONTACT_TYPING,
  chat.actions.SET_MESSAGE_INPUT_VALUE
]

const logger = createLogger({
  predicate: (getState, action) => !FILTERED_ACTIONS.includes(action.type)
})

export const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
      logger
    )
  )
)
