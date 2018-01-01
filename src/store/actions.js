import { Conversation } from '../models'
import { data, ensureFilesExist } from '../services'
import { actions as chatActions } from './chat'
import { actions as contactActions } from './contacts'

export const setup = () => async dispatch => {
  await ensureFilesExist()

  dispatch(chatActions.startLoadingConversationList())
  dispatch(contactActions.startLoadingContacts())

  setTimeout(() => {
    const conversations = data.conversations.reduce((accm, c) => ({ ...accm, [Conversation.getId(c)]: Conversation.getMetadata(c) }), {})
    const contacts = data.contacts.reduce((accm, c) => ({ ...accm, [c.id]: c }), {})

    dispatch(chatActions.finishLoadingConversationList({ conversations }))
    dispatch(contactActions.finishLoadingContacts({ contacts }))

    data.conversations.forEach(c => dispatch(chatActions.finishLoadingConversationDetails(c)))
  }, 1000)
}
