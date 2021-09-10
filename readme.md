# Nodejs-Express-Utils

A package to containing some useful utils for nodejs apps

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
