import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export const Greeting = props => (
  <div>
    {props.greeting}
  </div>
)
Greeting.propTypes = {
  greeting: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  greeting: state.greeting
})

export const GreetingContainer = connect(
  mapStateToProps
)(Greeting)
