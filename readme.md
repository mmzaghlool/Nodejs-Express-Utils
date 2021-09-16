# Nodejs-Express-Utils

A package to containing some useful utils for nodejs apps

1. [MySQL](#mysql)
    1. [Defining the database constrains](#defining-the-database-constrains)
    2. [Defining Models](#defining-models)
    3. [Using Models](#using-models)
2. [MiddleWares](#middlewares)
    1. [XSS Filter](#xss-filter)
    2. [Response Shaper](#response-shaper)
    3. [Input](#input)
3. [Extended Joi](#extended-joi)
4. [A full example](#a-full-example)
5. [Promise example](#promise-example)

## [MySQL](#mysql)

An ORM to be used on MySQL servers with built in methods for encryption and decryption using AES algorithms

### [Defining the database constrains](#defining-the-database-constrains)

First we need to initialize the connection to the database server and the key used to encrypt and decrypt the encrypted fields. I would recommend separating this code in separate file in the core folder in your backend for example i will define it here:
`/src/core/database.ts`

```ts
import {MySQL, MySQLConfig} from 'nodejs-express-utils';

// the key that is used for the encryption and decryption the database
const encryptionKey = '';

// Your MySQL server credentials used initialize the connection
const config: MySQLConfig = {
    host: '',
    user: '',
    password: '',
    database: '',
};
const database = new MySQL(config, encryptionKey);

export default database;
```

### [Defining Models](#defining-models)

Next we need to define our model classes. Every model should define only one of the database table.
I suggest defining it in separate folder for example i would define all models under `/src/models/`.

Every model should have it's type and table name and also the columns in this table each column should have three properties (type, isEncrypted, isRequired).

_-_ _`type`_: The datatype to cast the results for following the MySQL CAST rules.
Available types (CHAR, INTEGER, DECIMAL, SIGNED, UNSIGNED, TIME, DATETIME, DATE).

Read More:

1. [12.11 Cast Functions and Operators](https://dev.mysql.com/doc/refman/8.0/en/cast-functions.html#function_cast)
2. [MySQL CAST() Function - javatpoint](https://www.javatpoint.com/mysql-cast-function)

_-_ _`isEncrypted`_: Boolean indicating if this field should be encrypted when inserting or updating and decrypted when getting the data from the database.

Note that:

1. The encrypted fields on the database should be in `VARBINARY()` datatype and the length should be calculated.
2. The length is calculated using this formula `(Math.floor("EXPECTED_LENGTH" / 16) + 1) * 16` replace `"EXPECTED_LENGTH"` with your max data length
3. This field is only used to replace the data with with `AES_ENCRYPT('data', 'encryptionKey'))` or `AES_DECRYPT('data', 'encryptionKey'))`
4. The keys (primaryKey, and foreignKey) should not be encrypted

_-_ _`isRequired`_: Boolean indicating if this field is optional or required

Note that:

This filed should be true if no one of the following applied

1. The database has a default/generated value
2. The database has Not Null unchecked
3. You do not want to restrict the inserts 'Can insert data may not have a value for this field'

Example: Contact us table `/src/models/contactUs.ts`

```ts
import {DataTypes} from 'nodejs-express-utils';
import database from '../core/database';

export type ContactUsType = {
    id?: number;
    body: string;
    status?: string;
};
const tableName = 'contactUs';

export default database.init<ContactUsType>(tableName, {
    id: {
        type: DataTypes.UNSIGNED,
        isEncrypted: false,
        isRequired: false,
    },
    body: {
        type: DataTypes.CHAR,
        isEncrypted: true,
        isRequired: true,
    },
    status: {
        type: DataTypes.CHAR,
        isEncrypted: false,
        isRequired: false,
    },
});
```

### [Using Models](#using-models)

After creating the models now we can use it in our code to insert, get, update the data in the database. We can use the following methods:

_-_ create(data: {})

Note that:

1. `data`: An Object containing all the data that will be inserted and should follow the passed type while defining the model

_-_ get(extraQuery: string, params?: {}, fields?: string[])

Note that:

1. `extraQuery`: String applied while getting the data containing the where, orderby, limit conditions
2. `params`: Optional object containing the values for any variable used in the extraQuery in the next example we putted a variable called timestamp. You can define a variable using "`:`" before naming it
3. `fields`: Optional array containing the required fields to get, if not specified it will retrieve all fields

_-_ update(data: {}, extraQuery: string)

Note that:

1. `data`: An Object containing all the data that will be updated in the database
2. `extraQuery`: String applied while getting the data containing the where conditions

Also if you need to use encrypted fields in the `extraQuery` you can put "`&`" before the column name to decrypt it OR "`&:`" before the variable name to decrypt a variable OR "`#:`" before the variable name to encrypt a variable.

for example in the previous 'contactUs' example we may use `&body` OR `&:blaBla` and define `blaBla` in the params `{blaBla: 'body'}`

OR `WHERE body=#:var` and define `var` in the params `{var: 'some data to be encrypted'}`

For example

```ts
import {DataTypes} from 'nodejs-express-utils';
import ContactUs from '../models/ContactUs';

// Insert data into the database
ContactUs.create({
    status: 'Pending',
    body: 'Issue',
})
    .then((res) => console.log(res))
    .catch((err) => console.error(err));

// Get data from the database
const extraQuery = 'WHERE timestamp=:timestamp';
const params = {timestamp: 1631318513};
const fields = ['id', 'body'];

ContactUs.get(extraQuery, params, fields)
    .then((res) => console.log(res))
    .catch((err) => console.error(err));

// Update data
const data = {subject: 'Issue 12134'};
ContactUs.update(data, extraQuery)
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
```

## [MiddleWares](#middlewares)

### [XSS Filter](#xss-filter)

A middleware that used to filter the xss attacks

```javascript
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.use(middleWares.xssFilter());
```

### [Response Shaper](#response-shaper)

Response handler it takes a function and shape the response
if it succeeded it will send res 200 and of an error happened it will send status 500

@param {Function} handler - The function to execute

```javascript
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.get(
    '/',
    middleWares.handleResponse(() => {
        // your code here
    }),
);
```

### [Input](#input)

a joi validator used takes a joi schema and validate it.

```javascript
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.get('/', middleWares.inputJoi(extendedJoi.object({})));
```

## [Extended Joi](#extended-joi)

Extended from Joi add added some functions

Added functions

-   timestamp
-   id
-   uid
-   nid
-   landPhone
-   cellPhone
-   email
-   english
-   arabic
-   extraEnglish
-   extraArabic
-   extendedDate
-   ip
-   packageName
-   extendedLink

```javascript
import {extendedJoi, middleWares} from 'nodejs-express-utils';

app.get('/', middleWares.inputJoi(extendedJoi.object({name: extendedJoi.string().required()})));
```

## [A full example](#a-full-example)

`app.ts "App entry point"`

```ts
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
import index from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// XSS Filter
app.use(middleWares.xssFilter());

index('/v1', app);

export default app;
```

`routes/index.ts "routes entry point"`

```ts
import test from './test';

/**
 * Main routes entry point
 *
 * @param {string} baseURL The base added to the start of the route
 * @param {any} app
 */
export default function (baseURL: string, app: any) {
    app.use(baseURL + '/test', test);

    // ... rest of your routes

    // 404 Not Found Route
    app.all('*', (_, res) => res.status(404).json({success: false, code: 'NOT_FOUND'}));
}
```

`routes/test.ts`

```ts
import express from 'express';
import {middleWares, extendedJoi} from 'nodejs-express-utils';
const app = express();

app.get(
    '/:userId/:timestamp',
    // Validation middleware with joi
    middleWares.inputJoi(
        extendedJoi.object({
            userId: extendedJoi.id().required(),
            timestamp: extendedJoi.timestamp().required(),
        }),
    ),
    middleWares.handleResponse((data) => {
        const {userId, timestamp} = data;
        // your code here

        return {results: {}};
    }),
);
```

## [Promise example](#promise-example)

`routes/test.ts`

```ts
import express from 'express';
import {middleWares, extendedJoi} from 'nodejs-express-utils';
const app = express();

app.get(
    '/:userId/:timestamp',
    // Validation middleware with joi
    middleWares.inputJoi(
        extendedJoi.object({
            userId: extendedJoi.id().required(),
            timestamp: extendedJoi.timestamp().required(),
        }),
    ),
    middleWares.handleResponse((data) => {
        const {userId, timestamp} = data;

        return new Promise((resolve, reject) => {
            // your code here

            resolve({results: {}});
        });
    }),
);
```
