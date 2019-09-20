# sequelize-to-json-schema

## Example
```javascript

import Errors from '@feathersjs/errors';
import Ajv from 'ajv';
import { validateSchema } from 'feathers-hooks-common';
import jsonSchema from '@lemonpeach/sequelize-to-json-schema';

const getSchema = context => jsonSchema(
  context.service.Model,
  ['createdAt', 'updatedAt', 'id']
);

export const validateSchemaHook = async (
  context,
  schema = getSchema(context)
) => {
  try {
    switch (context.method) {
      case 'patch':
      case 'update':
        schema.required = [];
      /* eslint no-fallthrough: "error" */
      case 'create':
        await validateSchema(schema, new Ajv())(context);
        break;
      default:
        break;
    }
  } catch (error) {
   // handle error
  }
  return context;
};
```
