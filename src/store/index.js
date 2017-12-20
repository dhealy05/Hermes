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

export const actions = {
  auth: auth.actions,
  chat: chat.actions,
  contacts: contacts.actions
}

const reducer = combineReducers({
  [auth.namespace]: auth.reducer,
  [chat.namespace]: chat.reducer,
  [contacts.namespace]: contacts.reducer,
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

export const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
      createLogger()
    )
  )
)
