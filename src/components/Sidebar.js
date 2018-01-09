import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'

const OuterContainer = styled.div`
  min-width: 16.66%;
  max-width: 20%;
  background-color: ${colors.white};
  box-shadow: ${colors.border} 2px 0 4px 0;
  z-index: ${layers.Sidebar};
`

const Title = styled.h2`
  padding: 18px;
  margin-top: 0;
`

export const Sidebar = ({ className, title, children }) => {
  return (
    <OuterContainer className={className}>
      {title ? <Title>{title}</Title> : null}
      {children}
    </OuterContainer>
  )
}
Sidebar.propTypes = {
  title: PropTypes.string
}
