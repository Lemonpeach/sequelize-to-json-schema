import Sequelize from 'sequelize'
import uuidv4 from 'uuid/v4'
import { forEach, isNil, get } from 'lodash'

import {
  isArray, removeBrackets, calcMaximum, isVirtual
} from './utils'

const getString = value => ({
  type: 'string',
  default: value.defaultValue,
  maxLength: get(value, 'type.options.length')
})

const getUUID = value => ({
  ...getString(value),
  format: 'uuid',
  default: value.defaultValue && uuidv4()
})

const getInteger = value => ({
  type: 'integer',
  default: value.defaultValue,
  minimum: get(value, 'type.options.unsigned') && 0,
  maximum: get(value, 'type.options.length')
})

const getNumber = value => ({
  type: 'number',
  default: value.defaultValue,
  minimum: get(value, 'type.options.unsigned') && 0,
  exclusiveMaximum: calcMaximum(get(value, 'type.options.length'))
})

const getTime = value => ({
  ...getString(value),
  format: 'time'
})

const getDate = value => ({
  ...getString(value),
  format: 'date'
})

const getDateTime = value => ({
  ...getString(value),
  format: 'date-time'
})

const getBoolean = value => ({
  type: 'boolean',
  default: value.defaultValue
})

const getBlob = value => ({
  ...getString(value),
  contentEncoding: 'base64'
})

const getArray = value => ({
  type: 'array',
  default: value.defaultValue
})

const getObject = value => ({
  type: 'object',
  default: value.defaultValue
})

const getEnum = value => ({
  ...getString(value),
  enum: get(value, 'type.values')
})

const TRANSFORM_MAP = {
  [removeBrackets(new Sequelize.STRING().toString())]: getString,
  [removeBrackets(new Sequelize.CHAR().toString())]: getString,
  [new Sequelize.TEXT().toString()]: getString,
  [new Sequelize.UUID().toString()]: getUUID,

  [new Sequelize.INTEGER().toString()]: getInteger,
  [new Sequelize.BIGINT().toString()]: getInteger,

  [new Sequelize.FLOAT().toString()]: getNumber,
  [new Sequelize.REAL().toString()]: getNumber,
  [new Sequelize.DOUBLE().toString()]: getNumber,
  [new Sequelize.DECIMAL().toString()]: getNumber,
  [new Sequelize.RANGE().toString()]: getNumber,

  [new Sequelize.TIME().toString()]: getTime,
  [new Sequelize.DATEONLY().toString()]: getDate,
  [new Sequelize.DATE().toString()]: getDateTime,
  'TIMESTAMP WITH TIME ZONE': getDateTime,

  [removeBrackets(new Sequelize.BOOLEAN().toString())]: getString,
  BOOLEAN: getBoolean,

  [new Sequelize.BLOB().toString()]: getBlob,
  BYTEA: getBlob,

  [new Sequelize.JSON().toString()]: getObject,
  [new Sequelize.JSONB().toString()]: getObject,

  [new Sequelize.ENUM().toString()]: getEnum
}

const transformArray = value => {
  const arraySchema = getArray(value)
  const itemsType = get(value, 'type.options.type')
  const itemsTransformer = TRANSFORM_MAP[removeBrackets(itemsType.toString())]
  arraySchema.items = itemsTransformer(get(value, 'type.options'))
  return arraySchema
}

const transformVirtual = value => {
  const returnType = get(value, 'type.returnType')
  const returnTypeTransformer = TRANSFORM_MAP[removeBrackets(returnType.toString())]
  return returnTypeTransformer(get(value, 'type.returnType'))
}

export const jsonSchema = model => {
  const schema = {
    type: 'object',
    properties: {},
    required: []
  }

  forEach(model.rawAttributes, (value, key) => {
    const type = value.type.toString()

    if (isArray(type)) {
      schema.properties[key] = transformArray(value)
    } else if (isVirtual(type)) {
      schema.properties[key] = transformVirtual(value)
    } else {
      const transformer = TRANSFORM_MAP[removeBrackets(type)]
      schema.properties[key] = transformer(value)
    }

    !isNil(value.allowNull) && !value.allowNull && schema.required.push(key)
  })

  return schema
}
