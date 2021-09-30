# Nodejs-Express-Utils

![NPM](https://img.shields.io/npm/v/nodejs-express-utils.svg)
![NPM](https://img.shields.io/npm/dt/nodejs-express-utils.svg)

A package to containing some useful middleWares, MYSQL ORM, and other utils for nodejs apps.

Did you wanted to encrypt your database fields and get stuck in the searching loop, did not find the right ORM or have an issue in the implementation?

In this package i am trying to solve this problem.
You will find a useful middle wares solving some common problems and MySQL ORM with the encryption embedded using `AES` algorithms and it's corresponding MySQL functions `AES_ENCRYPT` and `AES_DECRYPT`.

## Reach Me

_`NOTE THAT`_ THIS PACKAGE IS BETA VERSION

If you need to report an issue or have suggestions feel free to contact me

<a href="https://www.linkedin.com/in/mmzaghlool/"><img align="center" src="https://icon-library.com/images/linkedin-icon-png-transparent-background/linkedin-icon-png-transparent-background-15.jpg" alt="LinkedIn profile" height="40" width="40" /></a>
<a href="mailto:mmzaghlool52@gmail.com"><img align="center" src="https://cdn.iconscout.com/icon/free/png-256/gmail-2981844-2476484.png" alt="Gmai account" height="40" width="40" /></a>

## Table of content

1. [MySQL](#mysql)
    1. [Defining the database constrains](#defining-the-database-constrains)
    2. [Defining Models](#defining-models)
    3. [Using Models](#using-models)
    4. [Joins](#joins)
2. [MiddleWares](#middlewares)
    1. [XSS Filter](#xss-filter)
    2. [Response Shaper](#response-shaper)
    3. [Input](#input)
3. [Extended Joi](#extended-joi)
4. [A full example](#a-full-example)
5. [Promise example](#promise-example)

## [Installation](installation)

```bash
npm i nodejs-express-utils
```

## [Importing](importing)

### [Commonjs](commonjs)

```javascript
const {DataTypes, MySQL, extendedJoi, formBadRequest, middleWares, JOIN_TYPES} = require('nodejs-express-utils');
```

### [ES6](es6)

```javascript
import {DataTypes, MySQL, extendedJoi, formBadRequest, middleWares, JOIN_TYPES} from 'nodejs-express-utils';
```

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
2. `extraQuery`: String applied while getting the data containing the `WHERE`, `ORDER BY`, and `LIMIT` conditions

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

### [Joins](#joins)

The next step is joining the models to get select data from multiple tables for that we will use a method called `executeJoin` from the main database connection object as follows:

`masterTable`: Is an object that contain the main table configuration to join other tables with:

-   `table`: _REQUIRED_ The table model
-   `tableAlias`: _OPTIONAL_ An alias to rename the table with while joining
-   `columnsAlias`: _OPTIONAL_ Object to rename the columns while joining. In the next example we renamed the column `userUid` to `uid`
-   `reqColumns`: _OPTIONAL_ The required columns only if not specified all columns will be retrieved. In the next example we want to get only the `id`, `userUid`, and `subject` from the contactUs model

`tables`: Is an array of objects that contain the joined tables configuration:

-   `table`: _REQUIRED_ The table model
-   `tableAlias`: _OPTIONAL_ An alias to rename the table with while joining. in the next example we renamed `Person` to `p`
-   `columnsAlias`: _OPTIONAL_ Object to rename the columns while joining.
-   `reqColumns`: _OPTIONAL_ The required columns only if not specified all columns will be retrieved.
-   `joinType`: Is the type of join one the the following `INNER`, `LEFT_OUTER`, `RIGHT_OUTER`, `FULL_OUTER`
-   `joinCondition`: Is the condition of the join

Also here you can use the same `extraQuery` and `params` that used [before](#using-models) in the same way

```TS
import {MasterTableType, JoinedTablesType} from 'nodejs-express-utils';
import database from '../core/database';
import ContactUs from '../models/ContactUs';
import Person from '../models/Person';

const masterTable: MasterTableType = {
    table: ContactUs,
    tableAlias: 'c',
    columnsAlias: {userUid: 'uid'},
    reqColumns: ['id', 'userUid', 'subject'],
};

const tables: JoinedTablesType = [
    {
        table: Person,
        tableAlias: 'p',
        // columnsAlias: {},
        // reqColumns: undefined,
        joinType: JOIN_TYPES.LEFT_OUTER,
        joinCondition: 'p.uid=c.userUid',
    },
];


const extraQuery = 'WHERE timestamp=:timestamp';
const params = {timestamp: 1632049210};

database
    .executeJoin(masterTable, tables, extraQuery, params)
    .then((res) => console.log('res', res))
    .catch((err) => console.error('err', err));
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
