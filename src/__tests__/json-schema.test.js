describe('json-schema', () => {
  const Sequelize = require('sequelize')
  const sequelize = new Sequelize('postgres://fakeUser:pass@fake.com:1111/fake')
  const SEQUELIZE_JSON_TABLE = [
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
      { type: 'integer' }
    ],
    [
      'integer',
      Sequelize.BIGINT,
      { type: 'integer' }
    ],
    [
      'float',
      Sequelize.FLOAT,
      { type: 'number' }
    ],
    [
      'float 11',
      Sequelize.FLOAT(5),
      {
        type: 'number',
        exclusiveMaximum: 100000
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
      { type: 'number' }
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
          type: 'number'
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
    ]
  ]

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

  test.each(SEQUELIZE_JSON_TABLE)(
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
            type: 'integer'
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

  test('should handle default values', () => {
    const Sequelize = require('sequelize')
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
          type: 'integer'
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
          type: 'integer'
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
    const Sequelize = require('sequelize')
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
          type: 'integer',
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
})
