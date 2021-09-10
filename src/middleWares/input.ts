import {Request, Response, NextFunction} from 'express';
import {Schema} from 'joi';
import {badRequestResponse, errorResponse} from './responseShaper';

/**
 * a joi validator used takes a joi schema and validate it
 *
 * @param {Function} schema - The function to execute
 * @return {Function} Middleware - A middleware to be executed
 *
 * @example
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.get(
    '/',
    middleWares.inputJoi(extendedJoi.object({
        name: extendedJoi.string().required()
    })),
);
 */
function inputJoi(schema: Schema) {
    return function (req: Request, res: Response, next: NextFunction) {
        const data = {...req.body, ...req.query, ...req.params, originalUrl: req.originalUrl};

        validate(schema, data)
            .then((values) => {
                req.body = values;
                return next();
            })
            .catch((code) => {
                badRequestResponse(res, code);
            });
    };
}

function validate(schema: Schema, payload: any) {
    return new Promise((resolve, reject) => {
        const {error, value} = schema.validate(payload, {abortEarly: false});

        if (typeof error !== 'undefined') {
            reject(error);
        } else {
            resolve(value);
        }
    });
}

export {inputJoi};
