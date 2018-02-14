import React, { Component } from 'react'
import styled from 'styled-components'
import * as colors from '../colors'
import { getPublicAddress, getBalance } from '../services/bitcoin'
import { Avatar } from './Avatar'
import { Paper } from './Paper'

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

export class InfoSidebarMe extends Component {
  state = { balance: 0 }
  async componentDidMount() {
    const address = getPublicAddress();
    const balance = await getBalance(address);
    const balanceInBtc = balance[address].final_balance / 100000000
    this.setState({ address, balance: balanceInBtc });
  }

  render() {
    const { profile } = this.props;
    const { address, balance } = this.state;
    console.log('oooooo', address, balance);
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
      </div>
    )
  }
}
