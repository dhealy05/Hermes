import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import { queryName } from '../services/queryNames'

const OuterContainer = styled.div`
  height: 34px;
  width: 100%;
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
