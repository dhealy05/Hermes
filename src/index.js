import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { applyGlobalStyles } from './globalStyle'
import registerServiceWorker from './registerServiceWorker'
import { Routes } from './routes'
import { store, history, actions } from './store'
import * as services from './services'

// expose for using the console as a poor man's REPL
window.__HERMES = services

const ROOT_ELEMENT = document.getElementById('root')

applyGlobalStyles()

store.dispatch(actions.auth.checkAuth())

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes/>
    </ConnectedRouter>
  </Provider>,
  ROOT_ELEMENT
)

ReactModal.setAppElement(ROOT_ELEMENT)

registerServiceWorker()
