import React from 'react'
import { storiesOf } from '@storybook/react'
import { decorateAction } from '@storybook/addon-actions'
import { Button } from '../../components/Button'
import { TextInput } from '../../components/TextInput'

const preventDefault = decorateAction([
  ([evt]) => {
    evt.preventDefault()
    return [evt]
  }
])

storiesOf('Forms/Examples', module)
  .add('payment form', () => (
    <form onSubmit={preventDefault('submit')}>
      <div>
        <TextInput label="first name"
                   name="firstName"
                   placeholder="tim"/>
        <TextInput label="last name"
                   name="lastName"
                   placeholder="cook"/>
      </div>
      <div>
        <TextInput label="card number"
                   name="cardNumber"
                   placeholder="4242424242424242"/>
      </div>
      <div>
        <TextInput label="exp date"
                   name="expiry"
                   placeholder="01/23"/>
        <TextInput label="cvc"
                   name="cvc"
                   placeholder="123"/>
      </div>
      <div>
        <Button>Submit</Button>
      </div>
    </form>
  ))
