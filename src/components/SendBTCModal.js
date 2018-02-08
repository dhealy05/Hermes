import React from 'react'
import styled from 'styled-components'
import { Modal } from './Modal'
import { TextInput } from './TextInput'
import { Button } from './Button'

const Header = styled.h2`
  text-align: center;
`

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`

const MODAL_ACTIONS = [{
  label: 'Send',
  value: 'send'
}]

export const SendBTCModal = ({
  onRequestClose,
  btcToSend,
  onBtcValueChange,
  onSend,
  ...other
}) => {
  const handleAction = type => {
    if (type === 'send') {
      onSend(btcToSend)
    }
  }

  return (
    <Modal contentLabel="Send BTC"
           onRequestClose={onRequestClose}
           actions={MODAL_ACTIONS}
           onAction={handleAction}
           {...other}>
      <Header>How much BTC would you like to send?</Header>
      <div>
        <TextInput fullWidth
                   type="number"
                   value={btcToSend}
                   onChange={onBtcValueChange}/>
      </div>
    </Modal>
  )
}
