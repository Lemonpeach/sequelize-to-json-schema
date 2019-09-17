import { forEach, isNil } from 'lodash'
import { calcMultipleOf } from './utils'

const is = value => ({
  pattern: !isNil(value[0]) && typeof value[0] === 'string'
    ? value
    : value.toString()
})

const not = value => ({
  not: is(value)
})

const isEmail = () => ({
  format: 'email'
})

const isUrl = () => ({
  format: 'uri'
})

const isIP = () => ({
  anyOf: [
    { format: 'ipv4' },
    { format: 'ipv6' }
  ]
})

const isIPv4 = () => ({
  format: 'ipv4'
})

const isIPv6 = () => ({
  format: 'ipv6'
})

const isAlpha = () => ({
  pattern: '^[a-zA-Z]*$'
})

const isAlphanumeric = () => ({
  pattern: '^[a-zA-Z0-9]*$'
})

const isNumeric = () => ({
  pattern: '^[0-9]*$'
})

const isInt = () => ({
  multipleOf: 1
})

const isFloat = (value, options) => ({
  multipleOf: calcMultipleOf(options.decimals)
})

const isDecimal = (value, options) => ({
  multipleOf: calcMultipleOf(options.decimals)
})

const isLowercase = () => ({
  pattern: '^[a-z]*$'
})

const isUppercase = () => ({
  pattern: '^[A-Z]*$'
})

const isNull = () => ({
  oneOf: {
    type: 'null'
  }
})

const notEmpty = () => ({
  minLength: 1
})

const equals = value => ({
  const: value
})

const contains = value => ({
  pattern: `^.*${value}.*`
})

const notContains = value => ({
  not: contains(value)
})

const isIn = value => ({
  enum: value[0]
})

const notIn = value => ({
  not: isIn(value)
})

const len = value => ({
  minLength: value[0],
  maxLength: value[1]
})

const isUUID = value => ({
  format: 'uuid'
})

const isDate = value => ({
  oneOf: [
    { format: 'date' },
    { format: 'date-time' }
  ]
})

const max = value => ({
  maximum: value
})

const min = value => ({
  minimum: value
})

const VALIDATE_MAP = {
  is,
  not,
  isEmail,
  isUrl,
  isIP,
  isIPv4,
  isIPv6,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isInt,
  isFloat,
  isDecimal,
  isLowercase,
  isUppercase,
  isNull,
  notEmpty,
  equals,
  contains,
  notContains,
  notIn,
  isIn,
  len,
  isUUID,
  isDate,
  max,
  min
}

export const mapValidate = (validate, options) => {
  let result = {}

  forEach(validate, (value, key) => {
    const transformer = VALIDATE_MAP[key]
    result = {
      ...result,
      ...transformer(value, options)
    }
  })
  return result
}
