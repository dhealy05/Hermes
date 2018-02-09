import React from 'react'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'

const OuterContainer = styled.div`
  width: 25%;
  min-width: 165px;
  flex-shrink: 0;
  background-color: ${colors.white};
  box-shadow: ${colors.border} 1px 0 2px 0;
  z-index: ${layers.Sidebar};
  padding: 10px;
`

export const InfoSidebar = () => {
  return (
    <OuterContainer>
      Blank INFO panel
    </OuterContainer>
  )
}
