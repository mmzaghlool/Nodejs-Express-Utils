# Nodejs-Express-Utils

A package to containing some useful utils for nodejs apps

## A full example

`app.ts "App entry point"`

```js
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

```js
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

```js
import express from 'express';
import {middleWares, extendedJoi} from 'nodejs-express-utils';
const app = express();

app.get(
    '/:userId/:timestamp',
    // Validation middleware with joi
    middleWares.inputJoi(extendedJoi.object({
        userId: extendedJoi.id().required(),
        timestamp: extendedJoi.timestamp().required(),
    })),
    middleWares.handleResponse((data) => {
        const {userId, timestamp} = data;
        // your code here

        return  {results: {}}
    }),
);
```

## Promise example

`routes/test.ts`

```js
import express from 'express';
import {middleWares, extendedJoi} from 'nodejs-express-utils';
const app = express();

app.get(
    '/:userId/:timestamp',
    // Validation middleware with joi
    middleWares.inputJoi(extendedJoi.object({
        userId: extendedJoi.id().required(),
        timestamp: extendedJoi.timestamp().required(),
    })),
    middleWares.handleResponse((data) => {
        const {userId, timestamp} = data;
        
        return new Promise((resolve, reject) => {
            // your code here

            resolve({results: {}})
        })

    }),
);
```

## MiddleWares

### xssFilter

A middleware that used to filter the xss attacks

```javascript
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.use(middleWares.xssFilter());
```

### responseShaper

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

### input

a joi validator used takes a joi schema and validate it.

```javascript
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.get('/', middleWares.inputJoi(extendedJoi.object({})));
```

## extendedJoi

Extended from Joi add added some functions

Added functions

- timestamp
- id
- uid
- nid
- landPhone
- cellPhone
- email
- english
- arabic
- extraEnglish
- extraArabic
- date
- ip
- packageName
- link

```javascript
import {extendedJoi, middleWares} from 'nodejs-express-utils';

app.get('/', middleWares.inputJoi(extendedJoi.object({name: extendedJoi.string().required()})));
```
