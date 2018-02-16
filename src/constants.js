import { Contact } from './models/contact'

export const HermesHelperId = 'hermesHelper'

export const HermesHelperContact = new Contact({
  id: HermesHelperId,
  name: 'Hermes Helper',
  pic: 'https://www.hihermes.co/images/avatars/HermesHelper.svg',
  statusPage: '',
  statusSecret: '',
  trusted: true
})
