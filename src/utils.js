export const removeBrackets = value => (
  value ? value.replace(/^(.*?)\(.*/, '$1') : value
)

export const isArray = value => (
  value.match(/^.*\[\]/)
)

export const isVirtual = value => (
  value.match(/^VIRTUAL/)
)

export const getIntegerPart = (precision, scale) => (
  precision && scale ? precision - scale : undefined
)

export const calcMaximum = length => (
  length ? Math.pow(10, length) : undefined
)

export const calcMultipleOf = decimals => (
  decimals ? Math.pow(10, -1 * decimals) : undefined
)
