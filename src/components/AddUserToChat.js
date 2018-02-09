import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import { Avatar } from './Avatar'
import { TextInput } from './TextInput'
import { queryName } from '../services/queryNames'
import { Paper } from './Paper'
import * as colors from '../colors'
import * as layers from '../layers'

const OuterContainer = styled(Paper).attrs({
  unstyled: true,
  layer: 1
})`
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  padding: 18px;
  background-color: ${colors.white};
  color: ${colors.black};
  z-index: ${layers.TopNav};
  box-shadow: ${colors.borderLight} 0 1px 2px 0;
`

const SelectedUsersContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Select = styled(Async)`
  width: 100%;
  height: 24px;
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

export class AddUserToChat extends Component {

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

  handleChange = values => {
    const { onChange } = this.props;
    onChange(values.map(v => v.value));
  }

  render() {
    const { recipients } = this.props
    return (
      <OuterContainer>
        <Select
          ref="select"
          multi={true}
          cache={false}
          name="recipients"
          placeholder="Message to..."
          loadOptions={this.getOptions}
          optionRenderer={({value, avatar}) => (
            <Option>
              {avatar ? <SelectAvatar src={avatar} /> : <EmptyAvatar />}
              {value}
            </Option>
          )}
          onSelectResetsInput={false} // TODO remove this when https://github.com/JedWatson/react-select/issues/2277 is fixed
          valueComponent={SelectValue}
          onChange={this.handleChange}
          value={recipients.map(r => ({ value: r.id, label: r.name }))}
        />
      </OuterContainer>
    )
  }
}

AddUserToChat.propTypes = {
  recipients: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  onChange: PropTypes.func.isRequired // (array of recipientIds)
}
