import React from 'react'
import PropTypes from 'prop-types'
import { compose, branch, lifecycle, renderComponent } from 'recompose'
import { connect } from 'react-redux'
import { actions } from '../store'
import { Button } from '../components/Button'

const SignInButtonBase = props => (
  <Button onClick={props.redirectToSignIn}>
    Sign In with Blockstack
  </Button>
)
SignInButtonBase.propTypes = {
  redirectToSignIn: PropTypes.func.isRequired
}

const SignInButton = lifecycle({
  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      // don't show the button in prod
      this.props.redirectToSignIn()
    }
  }
})(SignInButtonBase)

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
    redirectToSignIn: () => dispatch(actions.auth.redirectToSignIn),
    onSignOut: () => dispatch(actions.auth.signOut)
  })
)

export const WithAuthChallenge = compose(
  WithData,
  RedirectToSignIn
)
