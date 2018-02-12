import React from 'react'
import styled from 'styled-components'
import { Modal } from './Modal'
import { TextInput } from './TextInput'

const Header = styled.p`
  text-align: center;
`

const Title = styled.div`
  display: flex;
`

const Image = styled.img`
  margin-right: 8px;
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
    <Modal title={<Title><Image src="/BitcoinDark.svg" alt="bitcoins" />Send BTC</Title>}
           onRequestClose={onRequestClose}
           actions={MODAL_ACTIONS}
           onAction={handleAction}
           style={{ content: { left: '40%', right: '40%', top: '6em', height: 200 } }}
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
