import { merge, cloneDeep } from 'lodash'

export const Model = (name, defaults) => {
  function Record(attrs) {
    if (!this instanceof Record) {
      return new Record(...arguments)
    }
    merge(this, cloneDeep(defaults), attrs)
  }

  Object.defineProperty(Record, 'name', {
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
    writable: false,
    enumerable: false,
    configurable: true,
    value: name || 'Record'
  })

  return Record
}
