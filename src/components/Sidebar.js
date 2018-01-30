import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'
import { IconButton } from './IconButton'

const OuterContainer = styled.div`
  width: 25%;
  min-width: 165px;
  background-color: ${colors.white};
  box-shadow: ${colors.border} 1px 0 2px 0;
  z-index: ${layers.Sidebar};
`

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  // precise pixel values to line up with the header
  height: 29px; // height of logo
  padding: 15.5px;
  margin-top: 0;
  box-shadow: ${colors.borderLight} 0 1px 2px 0;
`

const ShortcutButton = styled(IconButton)`
  color: ${colors.blue};
  margin-left: 0.5em;
`

export const Sidebar = ({ className, title, onComposeMessage, children }) => {
  return (
    <OuterContainer className={className}>
      <Title>
        <img src="/title-logo-inverted.svg"/>
        <div>
          <ShortcutButton icon="message"
                          onClick={onComposeMessage}/>
        </div>
      </Title>
      {children}
    </OuterContainer>
  )
}
Sidebar.propTypes = {
  title: PropTypes.string,
  onComposeMessage: PropTypes.func.isRequired
}
