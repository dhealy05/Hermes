import React from 'react'
import PropTypes from 'prop-types'
import { compose, branch, renderComponent } from 'recompose'
import { connect } from 'react-redux'
import { actions } from '../store'
import { Button } from '../components/Button'

const SignInButton = props => (
  <Button onClick={props.redirectToSignIn}>
    Sign In with Blockstack
  </Button>
)
SignInButton.propTypes = {
  redirectToSignIn: PropTypes.func.isRequired
}

const RedirectToSignIn = branch(
  props => !props.identity,
  renderComponent(SignInButton)
)
RedirectToSignIn.propTypes = {
  identity: PropTypes.object
}

const WithData = connect(
  state => ({ identity: state.auth.identity }),
  dispatch => ({
    redirectToSignIn: actions.auth.redirectToSignIn,
    onSignOut: actions.auth.signOut
  })
)

export const WithAuthChallenge = compose(
  WithData,
  RedirectToSignIn
)