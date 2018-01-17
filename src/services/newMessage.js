import {saveJson, getJson} from './blockstack'
import {encodeText} from './keys'

export async function newMessage(text, convoID){
  var convo = await getJson(convoID)
  var encodedText = encodeText(text, convo.secret)

}
