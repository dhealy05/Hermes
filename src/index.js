import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import { store, history, actions } from './store'
import { Routes } from './routes'

store.dispatch(actions.blockstack.checkAuth())

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()
