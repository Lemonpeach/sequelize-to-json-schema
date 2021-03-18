import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { get } from 'lodash'

import {
  removeBrackets,
  calcMaximum,
  isArray,
  isVirtual,
  calcMultipleOf,
  getIntegerPart
} from './utils'
import { mapValidate } from './map-validate'

const getString = value => ({
  type: 'string',
  default: value.defaultValue,
  maxLength: get(value, 'type.options.length'),
  ...mapValidate(get(value, 'validate'))
})

const getUUID = value => ({
  ...getString(value),
  format: 'uuid',
  default: value.defaultValue && uuidv4()
})

const getInteger = value => ({
  type: 'number',
  default: value.defaultValue,
  minimum: get(value, 'type.options.unsigned') && 0,
  exclusiveMaximum: calcMaximum(get(value, 'type.options.length')),
  multipleOf: 1,
  ...mapValidate(
    get(value, 'validate'),
    get(value, 'type.options')
  )
})

const getNumber = value => ({
  type: 'number',
  default: value.defaultValue,
  minimum: get(value, 'type.options.unsigned') && 0,
  exclusiveMaximum: calcMaximum(
    getIntegerPart(get(value, 'type.options.precision'), get(value, 'type.options.scale')) ||
    get(value, 'type.options.length')
  ),
  multipleOf: calcMultipleOf(get(value, 'type.options.scale')),
  ...mapValidate(
    get(value, 'validate'),
    get(value, 'type.options')
  )
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
  default: value.defaultValue,
  ...mapValidate(get(value, 'validate'))
})

const getBlob = value => ({
  ...getString(value),
  contentEncoding: 'base64'
})

const getArray = value => ({
  type: 'array',
  default: value.defaultValue,
  ...mapValidate(get(value, 'validate'))
})

const getObject = value => ({
  type: 'object',
  default: value.defaultValue,
  ...mapValidate(get(value, 'validate'))
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

export const mapType = value => {
  const type = value.type.toString()

  if (isArray(type)) {
    return transformArray(value)
  }

  if (isVirtual(type)) {
    return transformVirtual(value)
  }

  const transformer = TRANSFORM_MAP[removeBrackets(type)]
  return transformer(value)
}
