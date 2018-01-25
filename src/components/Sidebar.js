import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'

const OuterContainer = styled.div`
  width: 25%;
  min-width: 165px;
  background-color: ${colors.white};
  box-shadow: ${colors.border} 1px 0 2px 0;
  z-index: ${layers.Sidebar};
`

const Title = styled.div`
  // precise pixel values to line up with the header
  height: 29px; // height of logo
  padding: 15.5px;
  margin-top: 0;
  box-shadow: ${colors.borderLight} 0 1px 2px 0;
`

export const Sidebar = ({ className, title, children }) => {
  return (
    <OuterContainer className={className}>
      <Title>
        <img src="/title-logo-inverted.svg"/>
      </Title>
      {children}
    </OuterContainer>
  )
}
Sidebar.propTypes = {
  title: PropTypes.string
}
