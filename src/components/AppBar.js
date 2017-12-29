import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'
import { Button } from './Button'
import { Icon } from './Icon'
import { Paper } from './Paper'

const OuterContainer = styled(Paper).attrs({
  unstyled: true,
  layer: 1
})`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: calc(100% - (14px * 2));
  height: 24px;
  padding: 14px;
  overflow: hidden;
  background-color: ${colors.white};
  color: ${colors.black};
  z-index: ${layers.AppBar};
  box-shadow: ${colors.border} 0 2px 4px 0;
`

const Logo = styled.div`
`

export const AppBar = ({ onSignOut, className }) => (
  <OuterContainer className={className}>
    <Button onClick={onSignOut} icon="exit_to_app"/>
  </OuterContainer>
)
AppBar.propTypes = {
  onSignOut: PropTypes.func
}
AppBar.defaultProps = {
  onSignOut: () => {}
}
