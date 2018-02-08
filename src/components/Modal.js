import React from 'react'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Button } from './Button'

const getModalStyle = (style = {}) => ({
  ...style,
  overlay: {
    zIndex: 99999,
    ...style.overlay
  },
  content: {
    zIndex: 99999,
    backgroundColor: colors.white,
    left: '25%',
    right: '25%',
    top: '4em',
    bottom: '4em',
    borderRadius: '2px',
    ...style.content
  }
})

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  flex-grow: 1;
`

const ActionsContainer = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const ActionButton = styled(Button)`
  margin-left: 2em;
`

export const Modal = ({
  style,
  children,
  hasCancelButton = true,
  actions = [],
  onAction = () => {},
  onRequestClose,
  ...props
}) => {
  const actionButtons = actions.map(a => (
    <ActionButton onClick={() => onAction(a.value)}
                  {...a.props}>
      {a.label}
    </ActionButton>
  ))

  if (hasCancelButton) {
    actionButtons.unshift(
      <ActionButton linkButton
                    onClick={onRequestClose}>
        Cancel
      </ActionButton>
    )
  }

  return (
    <ReactModal style={getModalStyle(style)}
                onRequestClose={onRequestClose}
                {...props}>
      <Container>
        <ContentContainer>
          {children}
        </ContentContainer>
        <ActionsContainer>
          {actionButtons}
        </ActionsContainer>
      </Container>
    </ReactModal>
  )
}
Modal.propTypes = {
  style: PropTypes.object,
  onRequestClose: PropTypes.func,
  onAction: PropTypes.func,
  hasCancelButton: PropTypes.bool,
  actions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    props: PropTypes.object
  }))
}
