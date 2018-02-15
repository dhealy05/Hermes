import React, { Component } from 'react'
import styled from 'styled-components'
import { Async } from 'react-select';
import { Icon } from './Icon'

const Select = styled(Async)`
  width: 100%;
  padding: 6px;
`

const PlaceHolder = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export class Search extends Component {
  getOptions = async (input, callback) => {
    const options = [
      { value: 'Sample1', label: 'Sample result' },
      { value: 'Sample2', label: 'Another result' },
    ];
    callback(null, { options })
  }

  handleChange = value => {
    console.log('Searching', value);
  }

  render() {
    return (
      <Select
        cache={false}
        placeholder={<PlaceHolder><Icon icon="search" />Search Hermes</PlaceHolder>}
        loadOptions={this.getOptions}
        onSelectResetsInput={false} // TODO remove this when https://github.com/JedWatson/react-select/issues/2277 is fixed
        onChange={this.handleSendBtcChange}
      />
    )
  }
}
