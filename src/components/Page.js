import React from 'react'
import PropTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'
import logoSvg from '../logo.svg'
import { Button } from './Button'

const Wrapper = styled.div`
  text-align: center;
`

const Header = styled.header`
  background-color: #222;
  height: 150px;
  padding: 20px;
  color: white;
`

const Rotate360 = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const LogoImg = styled.img`
  animation: ${Rotate360} infinite 20s linear;
  height: 80px;
`

const Title = styled.h1`
  font-size: 1.5em;
`

export const Page = ({ onSignOut, children }) => (
  <Wrapper>
    <Header>
      <LogoImg src={logoSvg} alt="logo" />
      <Title>Welcome to React</Title>
      <Button onClick={onSignOut}>
        Sign Out
      </Button>
    </Header>
    {children}
  </Wrapper>
)
Page.propTypes = {
  onSignOut: PropTypes.func.isRequired
}
