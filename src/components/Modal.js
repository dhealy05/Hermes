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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    ...style.overlay
  },
  content: {
    zIndex: 99999,
    backgroundColor: colors.white,
    left: '25%',
    right: '25%',
    top: '4em',
    bottom: '4em',
    borderRadius: '5px',
    ...style.content
  }
})

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const TitleContainer = styled.div`
  background-color: ${colors.greyLight};
  border-bottom: 1px solid ${colors.grey};
  margin: -20px -20px 0;
  padding: 20px;
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
  border-radius: 4px;
`

export const Modal = ({
  style,
  title,
  children,
  hasCancelButton = true,
  actions = [],
  onAction = () => {},
  onRequestClose,
  ...props
}) => {
  const actionButtons = actions.map(a => (
    <ActionButton key={a.value}
                  onClick={() => onAction(a.value)}
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
        {title && <TitleContainer>{title}</TitleContainer>}
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
