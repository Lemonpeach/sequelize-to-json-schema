import { forEach, isNil, get, includes } from 'lodash'
import { mapType } from './map-type'

export const jsonSchema = (model, ignoredAttributes = []) => {
  const schema = {
    type: 'object',
    properties: {},
    required: []
  }

  forEach(get(model, 'rawAttributes'), (value, key) => {
    if (!includes(ignoredAttributes, key)) {
      schema.properties[key] = mapType(value)
      !isNil(value.allowNull) && !value.allowNull && schema.required.push(key)
    }
  })

  return schema
}
