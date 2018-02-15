import * as blockstack from 'blockstack'
import { fetchWithTimeout } from '../util'

const SEARCH_ENDPOINT_TIMEOUT = 5000

export async function queryName(query){
  const url = `https://core.blockstack.org/v1/search?query=${encodeURIComponent(query)}`

  try {
    const resp = await fetchWithTimeout(url, { timeout: SEARCH_ENDPOINT_TIMEOUT })

    if (resp.statusCode >= 400) {
      console.warn(`error status from ${url}: ${resp.statusCode}`)
      return []
    }

    try {
      const { results } = resp.json()
      return results
    } catch (e) {
      console.warn(`bad JSON from ${url}`)
      return []
    }
  } catch (e) {
    if (e.message === fetchWithTimeout.TimedOutError) {
      console.warn(`request to ${url} timed out`)
      return []
    }

    throw e
  }
}
