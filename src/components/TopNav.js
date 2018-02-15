import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DropdownMenu from 'react-dd-menu'
import 'react-dd-menu/dist/react-dd-menu.css';
import 'react-dd-menu/dist/react-dd-menu.min.css';
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
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  padding: 18px;
  background-color: ${colors.white};
  color: ${colors.black};
  z-index: ${layers.TopNav};
  box-shadow: ${colors.borderLight} 0 1px 2px 0;

  &:hover {
    box-shadow: ${colors.borderLight} 0 1px 2px 0;
  }
`

const MenuItem = styled.a`
  text-align: left !important;
  display: flex !important;
  padding: 0.5em 1.5em !important;
  align-items: center;
`

export class TopNav extends Component {
  state = { isMenuOpen: false }

  toggleMenu = () => this.setState({ isMenuOpen: !this.state.isMenuOpen })
  closeMenu = () => this.setState({ isMenuOpen: false })

  render() {
    const { showingInfoSidebar, toggleInfoSidebar, showProfileSidebar, onSignOut, children, className } = this.props
    const { isMenuOpen } = this.state

    return (
      <OuterContainer className={className}>
        { children }
        <Button style={{ color: showingInfoSidebar ? colors.blue : undefined }}
                onClick={toggleInfoSidebar}
                icon="info_outline"/>
        <DropdownMenu isOpen={isMenuOpen}
                      close={this.closeMenu}
                      toggle={<Button onClick={this.toggleMenu} icon="settings"/>}
                      align="right">
          <li><MenuItem href="#" onClick={showProfileSidebar}><Icon icon="perm_identity" />Settings</MenuItem></li>
          <li><MenuItem href="#" onClick={onSignOut}><Icon icon="exit_to_app" />Logout</MenuItem></li>
        </DropdownMenu>
      </OuterContainer>
    )
  }
}

TopNav.propTypes = {
  onSignOut: PropTypes.func,
  showingInfoSidebar: PropTypes.bool,
  toggleInfoSidebar: PropTypes.func,
  showProfileSidebar: PropTypes.func,
}

TopNav.defaultProps = {
  onSignOut: () => {},
  showingInfoSidebar: false,
  toggleInfoSidebar: () => {},
  showProfileSidebar: () => {},
}
