import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { TextInput } from '../../components/TextInput'

storiesOf('Forms/Text Input', module)
  .add('with placeholder', () => (
    <TextInput placeholder="1 Infinite Loop, Cupertino, CA 95014"
               onChange={action('onChange')}/>
  ))
