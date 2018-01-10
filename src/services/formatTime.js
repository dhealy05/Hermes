import moment from 'moment'

export const formatTime = isostring => {
  const now = moment()
  const m = moment(isostring)

  if (now.isSame(m, 'day')) {
    return m.format('h:mma')
  }

  if (now.subtract(7, 'days') < m) {
    return m.format('ddd')
  }

  return m.format('MMM Do')
}
