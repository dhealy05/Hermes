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

export const actions = {
  auth: auth.actions
}

const reducer = combineReducers({
  [auth.namespace]: auth.reducer,
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
