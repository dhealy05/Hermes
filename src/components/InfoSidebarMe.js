import React, { Component } from 'react'
import styled from 'styled-components'
import swal from 'sweetalert'
import * as colors from '../colors'
import { getPublicAddress, getBalance } from '../services/bitcoin'
import { Avatar } from './Avatar'
import { Paper } from './Paper'
import { TextInput } from './TextInput'
import { Button } from './Button'
import { makeTransaction } from '../services/bitcoin'

const Section = styled(Paper).attrs({
  unstyled: true,
  layer: 1
})`
  background-color: ${colors.white};
  color: ${colors.black};
  border-bottom: 1px solid ${colors.borderLight};
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.9em;
`
const AvatarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TextContainer = styled.div`
  overflow: hidden;
  margin-left: 1em;
  font-weight: bold;
`

const Header = styled.div`
  text-transform: uppercase;
  font-size: 0.6em;
  font-weight: bold;
  color: ${colors.greyDark};
  margin-bottom: 10px;
`

const BitcoinContainer = styled.div`
  overflow: hidden;
  color: ${colors.greyDark};
  background-color: ${colors.greyLight};
  border: 1px solid ${colors.grey};
  border-radius: 5px;
  width: 100%;
  padding: 10px 22px;
  box-sizing: border-box;
  font-size: 0.7em;
`

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: bold;
  font-size: 0.9em;
`

const SendBtcButton = styled(Button)`
  float: right;
  box-shadow: none;
`

export class InfoSidebarMe extends Component {
  state = { balance: 0, sendBtcTo: '', sendBtcAmount: 0 }
  async componentDidMount() {
    const address = getPublicAddress();
    const balance = await getBalance(address);
    const balanceInBtc = balance[address].final_balance / 100000000
    this.setState({ address, balance: balanceInBtc });
  }

  handleChange = evt => this.setState({ [evt.target.name]: evt.target.value })
  handleSendBtc = async () => {
    const { sendBtcTo, sendBtcAmount } = this.state
    try {
      const amount = +sendBtcAmount
      if (sendBtcTo && amount) {
        await makeTransaction([sendBtcTo.value], amount)
        swal('BTC sent')
      }
    } catch(err) {
      swal('Error', 'Error trying to send BTC')
      console.error('Error trying to send BTC', sendBtcTo.value, sendBtcAmount, err)
    }
  }

  render() {
    const { profile } = this.props;
    const { address, balance, sendBtcTo, sendBtcAmount } = this.state;
    return (
      <div>
        <Section>
          <AvatarContainer>
            <Avatar className="avatar"
                    size={40}
                    image={profile.pic}/>
            <TextContainer>{profile.name || profile.id}</TextContainer>
          </AvatarContainer>
        </Section>
        <Section>
          <Header>Your bitcoin address</Header>
          <BitcoinContainer>{address}</BitcoinContainer>
        </Section>
        <Section>
          <Header>Your balance</Header>
          <BalanceContainer>
            <img src="/Bitcoin.svg" alt="bitcoins" />&nbsp;{balance} BTC
          </BalanceContainer>
        </Section>
        <Section>
          <Header>Withdraw</Header>
          <div>
            <TextInput fullWidth
                      placeholder="BTC address"
                      name="sendBtcTo"
                      type="text"
                      value={sendBtcTo}
                      onChange={this.handleChange}/>
            <TextInput fullWidth
                      placeholder="Amount"
                      name="sendBtcAmount"
                      type="number"
                      value={sendBtcAmount}
                      onChange={this.handleChange}/>
            <SendBtcButton onClick={this.handleSendBtc}>Send</SendBtcButton>
          </div>
        </Section>
      </div>
    )
  }
}
