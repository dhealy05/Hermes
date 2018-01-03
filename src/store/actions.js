import { ensureFilesExist } from '../services'

export const setup = () => async dispatch => {
  await ensureFilesExist()
}
