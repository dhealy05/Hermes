import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -100px;
  margin-left: -100px;
  width: 200px;
  height: 200px;
  text-align: center;
`

export const Loader = () => (
  <Wrapper>
    <img src="/LogoAnimatedBig.svg" alt="loading..." />
    Loading...
  </Wrapper>
)
