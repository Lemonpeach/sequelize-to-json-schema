import { forEach, isNil, get } from 'lodash'
import { mapType } from './map-type'

export const jsonSchema = model => {
  const schema = {
    type: 'object',
    properties: {},
    required: []
  }

  forEach(get(model, 'rawAttributes'), (value, key) => {
    schema.properties[key] = mapType(value)
    !isNil(value.allowNull) && !value.allowNull && schema.required.push(key)
  })

  return schema
}
