import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Button } from './Button'
import { Icon } from './Icon'
import { Paper } from './Paper'

const OuterContainer = styled(Paper).attrs({
  layer: 1
})`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 36px;
  height: calc(100% - (14px + 26px));
  padding: 14px;
  padding-top: 26px;
  overflow: hidden;
  background-color: ${colors.brand.medium};
  color: ${colors.white};

  & > *:not(:first-child) {
    margin-top: 1em;
  }
`

const Logo = styled.div`
`

export const AppBar = ({ onSignOut, className }) => (
  <OuterContainer className={className}>
    <Logo>dchat</Logo>
    <Button onClick={onSignOut} icon="exit_to_app"/>
  </OuterContainer>
)
AppBar.propTypes = {
  onSignOut: PropTypes.func
}
AppBar.defaultProps = {
  onSignOut: () => {}
}
