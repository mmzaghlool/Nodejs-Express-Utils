import {Request, Response, NextFunction} from 'express';
import {inHTMLData} from 'xss-filters';

/**
 * @param {*} payload data payload
 * @return {object} payload
 */
function filter(payload: any): any {
    let payloadString = JSON.stringify(payload);
    payloadString = inHTMLData(payloadString).trim();

    return JSON.parse(payloadString);
}

/**
 * A middleware that used to filter the xss attacks
 * @return {Function} Middleware - A middleware to be executed
 *
 * @example
 * import express from 'express';
 * import {middleWares} from 'nodejs-express-utils';
 * const app = express();
 *
 * app.use(middleWares.xssFilter());
 *
 */
function xssFilter() {
    return function (req: Request, res: Response, next: NextFunction) {
        // Filter All Inputs
        if (req.body) {
            req.body = filter(req.body);
        }
        if (req.query) {
            req.query = filter(req.query);
        }
        if (req.params) {
            req.params = filter(req.params);
        }

        next();
    };
}
export default xssFilter;
