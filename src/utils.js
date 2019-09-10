export const removeBrackets = value => (
  value ? value.replace(/^(.*?)\(.*/, '$1') : value
)

export const isArray = value => (
  value.match(/^.*\[\]/)
)

export const isVirtual = value => (
  value.match(/^VIRTUAL/)
)

export const calcMaximum = length => (
  length ? Math.pow(10, length) : undefined
)
