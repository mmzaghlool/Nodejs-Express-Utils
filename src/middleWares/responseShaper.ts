import {Request, Response, NextFunction} from 'express';

export function successResponse(res: Response, result: object) {
    return res.status(200).json({success: true, ...result});
}
export function badRequestResponse(res: Response, code: string) {
    return res.status(400).json({success: false, code});
}
export function errorResponse(res: Response, err: any) {
    return res.status(500).json({success: false, err});
}

/**
 * Response handler it takes a function and shape the response
 * if it succeeded it will send res 200 and of an error happened it will send status 500
 *
 * @param {Function} handler - The function to execute
 * @return {Function} Middleware - A middleware to be executed
 *
 * @example
import express from 'express';
import {middleWares} from 'nodejs-express-utils';
const app = express();

app.get(
    '/',
    middleWares.handleResponse(() => {
        // your code here
    }),
);
 */
export default function handleResponse(handler: Function) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            const data = {...req.query, ...req.params, originalUrl: req.originalUrl, ...req.body};
            req.body = data;

            const result = await handler(data);

            if (result.status === 400) {
                badRequestResponse(res, result.code);
            } else {
                successResponse(res, result);
            }
        } catch (err: any) {
            console.error(req.originalUrl, err);
            errorResponse(res, err.message);
        }
    };
}

/**
 * A function to be used when you need to send badResponse status 400 to the user with specific errors code
 *
 * @param {string} code A string with the error code to be sent in the response
 * @return {object}
 */
export function formBadRequest(code: string): object {
    return {status: 400, code};
}
