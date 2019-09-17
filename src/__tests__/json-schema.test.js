describe('json-schema', () => {
  const Sequelize = require('sequelize')
  const sequelize = new Sequelize('postgres://fakeUser:pass@fake.com:1111/fake')

  beforeEach(() => {
    jest.mock('uuid/v4', () => ({
      __esModule: true,
      default: () => '0ef9f424-c6f0-4bfe-b55e-87c50420180f'
    }))
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  const DATATYPES_TABLE = [
    [
      'string',
      Sequelize.STRING,
      { type: 'string' }
    ],
    [
      'string',
      Sequelize.CHAR,
      { type: 'string' }
    ],
    [
      'string 123',
      Sequelize.STRING(1234),
      {
        type: 'string',
        maxLength: 1234
      }
    ],
    [
      'text',
      Sequelize.TEXT,
      { type: 'string' }
    ],
    [
      'uuid',
      Sequelize.UUID,
      {
        type: 'string',
        format: 'uuid'
      }
    ],
    [
      'integer',
      Sequelize.INTEGER,
      { type: 'number' }
    ],
    [
      'integer',
      Sequelize.BIGINT,
      { type: 'number' }
    ],
    [
      'float',
      Sequelize.FLOAT,
      { type: 'number' }
    ],
    [
      'float 5',
      Sequelize.FLOAT(5),
      {
        type: 'number'
      }
    ],
    [
      'real',
      Sequelize.REAL,
      { type: 'number' }
    ],
    [
      'double',
      Sequelize.DOUBLE,
      { type: 'number' }
    ],
    [
      'decimal',
      Sequelize.DECIMAL,
      { type: 'number' }
    ],
    [
      'decimal 10,2',
      Sequelize.DECIMAL(10, 2),
      {
        type: 'number',
        precision: 10,
        scale: 2
      }
    ],
    [
      'date',
      Sequelize.TIME,
      {
        type: 'string',
        format: 'time'
      }
    ],
    [
      'date',
      Sequelize.DATE,
      {
        type: 'string',
        format: 'date-time'
      }
    ],
    [
      'date',
      Sequelize.DATEONLY,
      {
        type: 'string',
        format: 'date'
      }
    ],
    [
      'boolean',
      Sequelize.BOOLEAN,
      { type: 'boolean' }
    ],
    [
      'blob',
      Sequelize.BLOB,
      {
        type: 'string',
        contentEncoding: 'base64'
      }
    ],
    [
      'array date',
      Sequelize.ARRAY(Sequelize.DATE),
      {
        type: 'array',
        items: {
          type: 'string',
          format: 'date'
        }
      }
    ],
    [
      'array two decimals',
      Sequelize.ARRAY(Sequelize.DECIMAL(10, 2)),
      {
        type: 'array',
        items: {
          type: 'number',
          precision: 10,
          scale: 2
        }
      }
    ],
    [
      'json',
      Sequelize.JSON,
      {
        type: 'object'
      }
    ],
    [
      'enum',
      Sequelize.ENUM('clowns', 'balloons'),
      {
        type: 'string',
        enum: ['clowns', 'balloons']
      }
    ],
    [
      'enum with array',
      Sequelize.ENUM(['rice', 'pasta']),
      {
        type: 'string',
        enum: ['rice', 'pasta']
      }
    ],
    [
      'virtual with return type string',
      Sequelize.VIRTUAL(Sequelize.STRING, ['firstName']),
      {
        type: 'string'
      }
    ]
  ]

  test.each(DATATYPES_TABLE)(
    'should handle type %s',
    (type, _sequelize, json) => {
      const { jsonSchema } = require('../json-schema')
      const model = sequelize.define(type, {
        field: {
          type: _sequelize
        }
      })

      expect(jsonSchema(model)).toEqual({
        type: 'object',
        properties: {
          field: json,
          id: {
            type: 'number'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            default: undefined
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            default: undefined
          }
        },
        required: ['id', 'createdAt', 'updatedAt']
      })
    }
  )

  const VALIDATE_TABLE = [
    [
      'isEmail',
      {
        type: Sequelize.STRING,
        validate: {
          isEmail: true
        }
      },
      {
        type: 'string',
        format: 'email'
      }
    ],
    [
      'isUrl',
      {
        type: Sequelize.STRING,
        validate: {
          isUrl: true
        }
      },
      {
        type: 'string',
        format: 'uri'
      }
    ],
    [
      'isIP',
      {
        type: Sequelize.STRING,
        validate: {
          isIP: true
        }
      },
      {
        type: 'string',
        anyOf: [
          { format: 'ipv4' },
          { format: 'ipv6' }
        ]
      }
    ],
    [
      'isIPv4',
      {
        type: Sequelize.STRING,
        validate: {
          isIPv4: true
        }
      },
      {
        type: 'string',
        format: 'ipv4'
      }
    ],
    [
      'isIPv6',
      {
        type: Sequelize.STRING,
        validate: {
          isIPv6: true
        }
      },
      {
        type: 'string',
        format: 'ipv6'
      }
    ],
    [
      'isAlpha',
      {
        type: Sequelize.STRING,
        validate: {
          isAlpha: true
        }
      },
      {
        type: 'string',
        pattern: '^[a-zA-Z]*$'
      }
    ],
    [
      'isAlphaNumeric',
      {
        type: Sequelize.STRING,
        validate: {
          isAlphanumeric: true
        }
      },
      {
        type: 'string',
        pattern: '^[a-zA-Z0-9]*$'
      }
    ],
    [
      'isNumeric',
      {
        type: Sequelize.STRING,
        validate: {
          isNumeric: true
        }
      },
      {
        type: 'string',
        pattern: '^[0-9]*$'
      }
    ],
    [
      'isInt',
      {
        type: Sequelize.INTEGER,
        validate: {
          isInt: true
        }
      },
      {
        type: 'number',
        multipleOf: 1
      }
    ],
    [
      'isFloat',
      {
        type: Sequelize.FLOAT(42, 2),
        validate: {
          isFloat: true
        }
      },
      {
        type: 'number',
        multipleOf: 0.01
      }
    ],
    [
      'isDecimal',
      {
        type: Sequelize.DECIMAL(42, 2),
        validate: {
          isDecimal: true
        }
      },
      {
        type: 'number',
        precision: 42,
        scale: 2
      }
    ],
    [
      'isLowercase',
      {
        type: Sequelize.STRING(),
        validate: {
          isLowercase: true
        }
      },
      {
        type: 'string',
        pattern: '^[a-z]*$'
      }
    ],
    [
      'isUppercase',
      {
        type: Sequelize.STRING(),
        validate: {
          isUppercase: true
        }
      },
      {
        type: 'string',
        pattern: '^[A-Z]*$'
      }
    ],
    [
      'isNull',
      {
        type: Sequelize.STRING(),
        validate: {
          isNull: true
        }
      },
      {
        type: 'string',
        oneOf: {
          type: 'null'
        }
      }
    ],
    [
      'notEmpty',
      {
        type: Sequelize.STRING(),
        validate: {
          notEmpty: true
        }
      },
      {
        type: 'string',
        minLength: 1
      }
    ],
    [
      'equals',
      {
        type: Sequelize.STRING(),
        validate: {
          equals: 'cupcakes'
        }
      },
      {
        type: 'string',
        const: 'cupcakes'
      }
    ],
    [
      'contains',
      {
        type: Sequelize.STRING(),
        validate: {
          contains: 'puppies'
        }
      },
      {
        type: 'string',
        pattern: '^.*puppies.*'
      }
    ],
    [
      'notContains',
      {
        type: Sequelize.STRING(),
        validate: {
          notContains: 'puppies'
        }
      },
      {
        type: 'string',
        not: {
          pattern: '^.*puppies.*'
        }
      }
    ],
    [
      'notIn',
      {
        type: Sequelize.STRING(),
        validate: {
          notIn: [['planes', 'delivery', 'magic']]
        }
      },
      {
        type: 'string',
        not: {
          enum: ['planes', 'delivery', 'magic']
        }
      }
    ],
    [
      'isIn',
      {
        type: Sequelize.STRING(),
        validate: {
          isIn: [['cloud', 'meatballs', 'sunny']]
        }
      },
      {
        type: 'string',
        enum: ['cloud', 'meatballs', 'sunny']
      }
    ],
    [
      'len',
      {
        type: Sequelize.STRING(),
        validate: {
          len: [2, 8]
        }
      },
      {
        type: 'string',
        minLength: 2,
        maxLength: 8
      }
    ],
    [
      'isUUID',
      {
        type: Sequelize.STRING(),
        validate: {
          isUUID: true
        }
      },
      {
        type: 'string',
        format: 'uuid'
      }
    ],
    [
      'isDate',
      {
        type: Sequelize.STRING(),
        validate: {
          isDate: true
        }
      },
      {
        type: 'string',
        oneOf: [
          { format: 'date' },
          { format: 'date-time' }
        ]
      }
    ],
    [
      'max',
      {
        type: Sequelize.INTEGER(),
        validate: {
          max: 98
        }
      },
      {
        type: 'number',
        maximum: 98
      }
    ],
    [
      'min',
      {
        type: Sequelize.INTEGER(),
        validate: {
          min: 98
        }
      },
      {
        type: 'number',
        minimum: 98
      }
    ]
  ]

  test.each(VALIDATE_TABLE)(
    'should handle validate %s',
    (validate, _sequelize, json) => {
      const { jsonSchema } = require('../json-schema')
      const validateModel = sequelize.define(validate, {
        field: _sequelize
      })

      expect(jsonSchema(validateModel)).toEqual({
        type: 'object',
        properties: {
          field: json,
          id: {
            type: 'number'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        },
        required: ['id', 'createdAt', 'updatedAt']
      })
    }
  )

  test('should handle default values', () => {
    const { jsonSchema } = require('../json-schema')

    const defaultUuidModel = sequelize.define('default-uuid', {
      field: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      }
    })

    expect(jsonSchema(defaultUuidModel)).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          format: 'uuid',
          default: '0ef9f424-c6f0-4bfe-b55e-87c50420180f'
        },
        id: {
          default: undefined,
          type: 'number'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        }
      },
      required: ['id', 'createdAt', 'updatedAt']
    })

    const defaultStringModel = sequelize.define('default-string', {
      field: {
        type: Sequelize.STRING,
        defaultValue: 'wonkey watermelon'
      }
    })

    expect(jsonSchema(defaultStringModel)).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          default: 'wonkey watermelon'
        },
        id: {
          type: 'number'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        }
      },
      required: ['id', 'createdAt', 'updatedAt']
    })
  })

  test('should handle required values', () => {
    const { jsonSchema } = require('../json-schema')

    const requiredModel = sequelize.define('required-uuid', {
      field: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      }
    })

    expect(jsonSchema(requiredModel)).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          format: 'uuid',
          default: '0ef9f424-c6f0-4bfe-b55e-87c50420180f'
        },
        id: {
          type: 'number',
          default: undefined
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          default: undefined
        }
      },
      required: ['id', 'field', 'createdAt', 'updatedAt']
    })
  })

  test('should ignore ignoredAttributes', () => {
    const { jsonSchema } = require('../json-schema')

    const requiredModel = sequelize.define('required-uuid', {
      field: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      }
    })

    expect(jsonSchema(requiredModel, ['id', 'createdAt', 'updatedAt'])).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          format: 'uuid',
          default: '0ef9f424-c6f0-4bfe-b55e-87c50420180f'
        }
      },
      required: ['field']
    })
  })
})
