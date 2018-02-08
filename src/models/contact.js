import { Model } from './model'

export const Contact = Model('Contact', {
  /**
   * Blockstack ID of the contact
   */
  id: '',

  /**
   * Display name of the contact
   */
  name: '',

  //picture of the contact
  pic: '',

  //
  statusPage: '',

  //
  statusSecret: '',

  trusted: false,

})
