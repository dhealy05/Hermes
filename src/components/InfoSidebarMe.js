import React, { Component } from 'react'
import styled from 'styled-components'
import { Async } from 'react-select';
import swal from 'sweetalert'
import * as colors from '../colors'
import { getPublicAddress, getBalance } from '../services/bitcoin'
import { Avatar } from './Avatar'
import { Paper } from './Paper'
import { TextInput } from './TextInput'
import { Button } from './Button'
import { queryName } from '../services/queryNames'
import { sendBitcoinToIds } from '../services/bitcoin'

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

const Select = styled(Async)`
  width: 100%;
`

const SelectValue = styled.span`
  margin: 3px 4px;
  color: white;
  background-color: #648bfa;
  text-shadow: 1px 1px #46e;
  padding: 0px 6px;
  border-radius: 3px;
`

const Option = styled.span`
  display: flex;
  align-items: center;
`

const SelectAvatar = styled.img`
  display: inline-block;
  width: 2em;
  height: 2em;
  margin-right: .78571429rem;
  border-radius: 500rem;
`

const EmptyAvatar = styled.div`
  display: inline-block;
  width: 2em;
  height: 2em;
  margin-right: .78571429rem;
  border-radius: 500rem;
  border: 1px dashed #648bfa;
`

const SendBtcButton = styled(Button)`
  float: right;
`

export class InfoSidebarMe extends Component {
  state = { balance: 0, sendBtcTo: null, sendBtcAmount: 0 }
  async componentDidMount() {
    const address = getPublicAddress();
    const balance = await getBalance(address);
    this.setState({ address, balance: balance[address].final_balance });
  }

  getOptions = async (input, callback) => {
    const res = await queryName(input);
    const options = res.results.map(({username, profile}) => {
      const avatar = profile.image && profile.image.find(image => image.name === 'avatar')
      return {
        value: username,
        label: profile.name,
        avatar: avatar && avatar.contentUrl,
      };
    })
    callback(null, { options })
  }

  handleSendBtcChange = sendBtcTo => this.setState({ sendBtcTo })
  handleSendBtcAmount = evt => this.setState({ sendBtcAmount: evt.target.value })
  handleSendBtc = async () => {
    const { sendBtcTo, sendBtcAmount } = this.state
    console.log(sendBtcTo, sendBtcAmount);
    try {
      const amount = +sendBtcAmount
      if (sendBtcTo && amount) {
        await sendBitcoinToIds([sendBtcTo.value], amount)
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
            <Select
              cache={false}
              placeholder="Send BTC to..."
              loadOptions={this.getOptions}
              optionRenderer={({value, avatar}) => (
                <Option>
                  {avatar ? <SelectAvatar src={avatar} /> : <EmptyAvatar />}
                  {value}
                </Option>
              )}
              onSelectResetsInput={false} // TODO remove this when https://github.com/JedWatson/react-select/issues/2277 is fixed
              valueComponent={SelectValue}
              onChange={this.handleSendBtcChange}
              value={sendBtcTo}
            />
            <TextInput fullWidth
                      type="number"
                      value={sendBtcAmount}
                      onChange={this.handleSendBtcAmount}/>
            <SendBtcButton onClick={this.handleSendBtc}>Send</SendBtcButton>
          </div>
        </Section>
      </div>
    )
  }
}
