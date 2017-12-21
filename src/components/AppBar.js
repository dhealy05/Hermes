import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Button } from './Button'
import { Paper } from './Paper'

const OuterContainer = styled(Paper).attrs({
  layer: 1
})`
  display: flex;
  flex-shrink: 0;
  height: 72px;
  width: 100%;
  border-bottom: 1px solid ${colors.border}
`

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin: 22px 36px;
`

const Logo = styled.div`
`

const RightNav = styled.div`
`

export const AppBar = ({ onSignOut, className }) => (
  <OuterContainer>
    <InnerContainer className={className}>
      <Logo>dchat</Logo>
      <RightNav>
        <Button onClick={onSignOut} linkButton>
          sign out
        </Button>
      </RightNav>
    </InnerContainer>
  </OuterContainer>
)
AppBar.propTypes = {
  onSignOut: PropTypes.func
}
AppBar.defaultProps = {
  onSignOut: () => {}
}
