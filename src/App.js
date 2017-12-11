import React from 'react'
import { Provider } from 'react-redux'
import * as blockstack from 'blockstack'
import { store } from './store'
import logo from './logo.svg'
import './App.css'
import { GreetingContainer } from './containers/Greeting'
import { Button } from './components/Button'

export const App = props => (
  <Provider store={store}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Welcome to React</h1>
      </header>
      <p className="App-intro">
        <Button onClick={() => blockstack.redirectToSignIn()}>
          Sign in with Blockstack
        </Button>
      </p>
      <GreetingContainer/>
    </div>
  </Provider>
)

export default App
