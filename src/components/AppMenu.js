import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import * as layers from '../layers'
import { Button } from './Button'

const OuterContainer = styled.div`
  min-width: 16.66%;
  flex-grow: 1;
  padding: 18px;
  background-color: ${colors.white};
  //border-right: 1px solid ${colors.border};
  box-shadow: ${colors.border} 2px 0 4px 0;
  z-index: ${layers.AppMenu};
`

const Title = styled.h2`
  margin-top: 0;
`

const ActionList = styled.ul`
  list-style: none;
  padding: 0;
`

const ActionListItem = styled.li`
`

const ActionButton = styled(Button).attrs({ linkButton: true })``

export const AppMenu = ({ className, title, actions = [] }) => {
  const actionButtons = actions.map(({ label, handler }, i) => (
    <ActionListItem key={i}>
      <ActionButton onClick={handler}>
        {label}
      </ActionButton>
    </ActionListItem>
  ))

  return (
    <OuterContainer className={className}>
      {title ? <Title>{title}</Title> : null}
      <ActionList>
        {actionButtons}
      </ActionList>
    </OuterContainer>
  )
}
AppMenu.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    handler: PropTypes.func.isRequired,
    isActive: PropTypes.bool
  }))
}
