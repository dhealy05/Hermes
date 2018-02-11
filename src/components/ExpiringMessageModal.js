import React from 'react'
import styled from 'styled-components'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { TextInput } from './TextInput'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

const Header = styled.p`
  text-align: center;
`

const Title = styled.div`
  display: flex;
`

const SelectWrapper = styled.div`
  display: inline-block;
  width: 50%;
`

const MODAL_ACTIONS = [{
  label: 'Set',
  value: 'set'
}]

export const ExpiringMessageModal = ({
  onRequestClose,
  numberOfHours,
  onSetHours,
  setExpirationDate,
  ...other
}) => {
  const handleAction = type => {
    if (type === 'set') {
      setExpirationDate(numberOfHours)
    }
  }

  return (
    <Modal title={<Title><Icon icon="timer" />Expiring Messages</Title>}
           onRequestClose={onRequestClose}
           actions={MODAL_ACTIONS}
           onAction={handleAction}
           style={{ content: { left: '35%', right: '35%', top: '6em', height: 220 } }}
           {...other}>
      <Header>Enter the number of hours you want your message to last:</Header>
      <div>
        <TextInput fullWidth
                   type="number"
                   value={numberOfHours}
                   onChange={onSetHours}/>
      </div>
    </Modal>
  )
}
