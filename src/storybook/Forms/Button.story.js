import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Button } from '../../components/Button'

storiesOf('Forms/Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello</Button>
  ))
  .add('with emojis', () => (
    <Button onClick={action('clicked')}>Spooky 👻</Button>
  ))
  .add('link button', () => (
    <Button onClick={action('clicked')} linkButton>a link button</Button>
  ))
