import React from 'react'
import styled from 'styled-components'
import { Icon } from './Icon'
import { Modal } from './Modal'
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
  btcToSet,
  onSet,
  ...other
}) => {
  const handleAction = type => {
    if (type === 'set') {
      onSet(btcToSet)
    }
  }

  return (
    <Modal title={<Title><Icon icon="timer" />Expiring Messages</Title>}
           onRequestClose={onRequestClose}
           actions={MODAL_ACTIONS}
           onAction={handleAction}
           style={{ content: { left: '35%', right: '35%', top: '6em', height: 220 } }}
           {...other}>
      <Header>Your next message expires in:</Header>
      <div>
        <SelectWrapper>
          <Select
            name="amount"
            options={[
              { value: 15, label: '15' },
              { value: 30, label: '30' },
              { value: 45, label: '45' },
              { value: 60, label: '60' },
            ]}
          />
        </SelectWrapper>
        <SelectWrapper>
          <Select
            name="unit"
            options={[
              { value: 'minutes', label: 'Minutes' },
              { value: 'hours', label: 'Hours' },
              { value: 'weeks', label: 'Weeks' },
              { value: 'months', label: 'Months' },
            ]}
          />
        </SelectWrapper>
      </div>
    </Modal>
  )
}
