import { forEach, isNil, get, pick, omit, merge } from 'lodash'
import { mapType } from './map-type'

const DEFAULT_OPTIONS = {
  ignore: [],
  include: []
}

export const jsonSchema = (model, options) => {
  const schema = {
    type: 'object',
    properties: {},
    required: []
  }

  const { ignore, include } = merge({}, DEFAULT_OPTIONS, options)

  let attributes = get(model, 'rawAttributes')

  if (include.length > 0) {
    attributes = pick(attributes, include)
  }

  attributes = omit(attributes, ignore)

  forEach(attributes, (value, key) => {
    schema.properties[key] = mapType(value)
    !isNil(value.allowNull) && !value.allowNull && schema.required.push(key)
  })

  return schema
}
