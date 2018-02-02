import { identity } from './identity'
import { getJson, saveJson} from './blockstack'
import { encodeText } from './keys'

export async function setTyping(convo){
  var outbox = await getJson(convo.filename, {username: identity().username})
  outbox.typing = encodeText(new Date().toISOString(), convo.secret)
  return await saveJson(convo.filename, outbox, { isPublic: true } )
}

export function checkTyping(typing){
  if(typing == ''){return false}
  var lastTyped = new Date(typing)
  var thirty_secs = 30 * 1000;
  if(((new Date) - lastTyped) < thirty_secs){return true}
  return false
}
