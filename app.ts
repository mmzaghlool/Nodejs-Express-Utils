import express from 'express';
import {middleWares} from './src';
const app = express();

app.use(middleWares.xssFilter());
app.get(
    '/',
    middleWares.handleResponse(() => {
        // your code here
    }),
);
