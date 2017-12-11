import {
  applyMiddleware,
  createStore,
  compose
} from 'redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { reducer } from './reducer'
import * as actions from './actions'

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
      thunk,
      createLogger()
    )
  )
)
