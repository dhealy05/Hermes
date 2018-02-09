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

  &:hover {
    box-shadow: ${colors.borderLight} 0 1px 2px 0;
  }
`

const Title = styled.div`
  flex-grow: 10;
  text-align: center;
`

export const TopNav = ({
  showingInfoSidebar,
  toggleInfoSidebar,
  onSignOut,
  title,
  className
}) => (
  <OuterContainer className={className}>
    { title ? <Title>{title}</Title> : null }
    <Button style={{ color: showingInfoSidebar ? colors.blue : undefined }}
            onClick={toggleInfoSidebar}
            icon="info_outline"/>
    <Button onClick={onSignOut}
            icon="exit_to_app"/>
  </OuterContainer>
)
TopNav.propTypes = {
  title: PropTypes.string,
  onSignOut: PropTypes.func,
  showingInfoSidebar: PropTypes.bool,
  toggleInfoSidebar: PropTypes.func,
}
TopNav.defaultProps = {
  onSignOut: () => {},
  showingInfoSidebar: false,
  toggleInfoSidebar: () => {},
}
