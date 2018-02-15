import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const Wrapper = styled.div`
  ${props => !props.inline && css`
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -100px;
    margin-left: -100px;
    width: 200px;
    height: 200px;
    text-align: center;
  `}
`

export const Loader = ({ ...props }) => (
  <Wrapper {...props}>
    <img src="/LogoAnimatedBig.svg"
         alt="loading..." />
  </Wrapper>
)
Loader.propTypes = {
  inline: PropTypes.bool
}
