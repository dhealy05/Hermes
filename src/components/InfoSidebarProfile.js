import React, { Component } from 'react'
import styled from 'styled-components'
import * as colors from '../colors'
import { Avatar } from './Avatar'
import { getPublicAddress, getBalance } from '../services/bitcoin'
import { lookupProfile } from '../services/identity'

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 10px;
  border-bottom: 1px solid ${colors.borderLight};

  .avatar {
    margin-bottom: 15px;
  }
`

const Name = styled.div`
  color: ${colors.black};
  font-weight: bold;
  font-size: 1em;
`;

const Id = styled.div`
  color: ${colors.greyDark};
  font-size: 0.7em;
  font-weight: bold;
`;

const StatusSecret = styled.div`
  color: ${colors.greyDark};
  font-size: 0.6em;
  margin: 4px 0 10px;
`;

const Description = styled.div`
  color: ${colors.greyDark};
  font-weight: bold;
  font-size: 0.7em;
  font-weight: bold;
  margin: 4px 0 10px;
`;

export class InfoSidebarProfile extends Component {
  state = {}
  async componentDidMount() {
    const { profile } = this.props
    const loadedProfile = await lookupProfile(profile.id)
    console.log('0000', loadedProfile)
    this.setState({ loadedProfile })
  }

  render() {
    const { profile } = this.props;
    const { loadedProfile } = this.state;
    return (
      <div>
        <ProfileContainer>
          <Avatar className="avatar"
                  size={48}
                  image={profile.pic}/>
          {profile.name && <Name>{profile.name}</Name>}
          {profile.id && <Id>{profile.id}</Id>}
          {loadedProfile && loadedProfile.description && <Description>{loadedProfile.description}</Description>}
        </ProfileContainer>
      </div>
    )
  }
}
