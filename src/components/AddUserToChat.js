import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import { Avatar } from './Avatar'
import { TextInput } from './TextInput'
import { queryName } from '../services/queryNames'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
  width: 30%;
`

const SelectedUsersContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Select = styled(Async)`
  width: 35em;
`

const SelectValue = styled.span`
  margin: 3px 4px;
  border: 1px solid #648bfa;
  padding: 0px 3px;
  border-radius: 2px;
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
  border: 1px dashed black;
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
    console.log('RERENDER', this.props)
    const { recipients } = this.props
    return (
      <Container>
        <Select
          ref="select"
          multi={true}
          cache={false}
          name="recipients"
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
      </Container>
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
