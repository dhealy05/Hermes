import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'
import { Button } from './Button'
import { Paper } from './Paper'

const OuterContainer = styled(Paper).attrs({
  unstyled: true,
  layer: 1
})`
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  padding: 18px;
  overflow: hidden;
  background-color: ${colors.white};
  color: ${colors.black};
  z-index: ${layers.TopNav};
  box-shadow: ${colors.borderLight} 0 1px 2px 0;
`

export const TopNav = ({ onSignOut, className }) => (
  <OuterContainer className={className}>
    <Button onClick={onSignOut} icon="exit_to_app"/>
  </OuterContainer>
)
TopNav.propTypes = {
  onSignOut: PropTypes.func
}
TopNav.defaultProps = {
  onSignOut: () => {}
}
