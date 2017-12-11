import React from 'react'
import PropTypes from 'prop-types'
import { compose, branch, renderComponent } from 'recompose'
import { connect } from 'react-redux'
import { actions } from '../store'
import { Button } from '../components/Button'
import { Page } from '../components/Page'

const SignInButton = props => (
  <Button onClick={props.redirectToSignIn}>
    Sign In with Blockstack
  </Button>
)
SignInButton.propTypes = {
  redirectToSignIn: PropTypes.func.isRequired
}

const WithAuthChallenge = branch(
  props => !props.identity,
  renderComponent(SignInButton)
)
WithAuthChallenge.propTypes = {
  identity: PropTypes.object
}

const WithData = connect(
  state => ({ identity: state.blockstack.identity }),
  dispatch => ({
    redirectToSignIn: actions.blockstack.redirectToSignIn
  })
)

export const PageContainer = compose(
  WithData,
  WithAuthChallenge
)(Page)
