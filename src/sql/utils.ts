import {paramsType, DatabaseSchema, getColumnsType} from './types';

/**
 *
 * @param {string} query
 * @param {paramsType} params
 * @param {DatabaseSchema} schema
 * @param {string} encryptionKey
 * @return {string}
 */
export function parseQuery(query: string, params: paramsType, schema: DatabaseSchema, encryptionKey: string): string {
    // Encrypt or Decrypt fields
    for (const key in schema) {
        if (Object.prototype.hasOwnProperty.call(schema, key)) {
            const {type} = schema[key];
            const value = params[key];

            query = query.replace(RegExp(`&${key}`, 'g'), `CAST(${decrypt(key, encryptionKey)} AS ${type})`);

            // Encrypt or Decrypt with variable
            if (RegExp(`#:${key}`, 'g').test(query)) {
                // query = query.replace(RegExp(`#:${key}`, 'g'), `${encrypt(`"${value}"`, encryptionKey)}`);
                query = query.replace(
                    RegExp(`#:${key}`, 'g'),
                    `${encrypt(`"${value.replace(RegExp(`"`, 'g'), '\\"')}"`, encryptionKey)}`,
                );
            }
            if (RegExp(`&:${key}`, 'g').test(query)) {
                query = query.replace(
                    RegExp(`&:${key}`, 'g'),
                    `CAST(${decrypt(`${value}`, encryptionKey)} AS ${type})`,
                );
            }
        }
    }

    // Insert params values
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const value = params[key];

            if (RegExp(`#:${key}`, 'g').test(query)) {
                query = query.replace(
                    RegExp(`#:${key}`, 'g'),
                    `${encrypt(`"${value.replace(RegExp(`"`, 'g'), '\\"')}"`, encryptionKey)}`,
                );
            }

            query = query.replace(RegExp(`:${key}`, 'g'), `"${value}"`);
            query = query.replace(RegExp(`:\`${key}\``, 'g'), `"${value}"`);
            query = query.replace(RegExp(`!\`${key}\``, 'g'), '`' + value + '`');
        }
    }

    if (RegExp(' &[a-zA-Z.]+', 'g').test(query)) {
        let exec = RegExp('&[a-zA-Z.]+', 'g').exec(query);
        console.log('exec: ', exec);

        while (exec !== null) {
            const key = exec[0].substr(1);
            query = query.replace(RegExp(`&${key}`, 'g'), `CAST(${decrypt(key, encryptionKey)} AS CHAR)`);

            exec = RegExp('&[a-zA-Z.]+', 'g').exec(query);
        }
    }

    if (RegExp(` #'([a-zA-Z]+)'`, 'g').test(query)) {
        let exec = RegExp(`#'([a-zA-Z]+)'`, 'g').exec(query);
        console.log('exec: ', exec);

        while (exec !== null) {
            const key = exec[0].substr(1);
            query = query.replace(RegExp(`#${key}`, 'g'), encrypt(key, encryptionKey));

            exec = RegExp(`#'([a-zA-Z]+)'`, 'g').exec(query);
        }
    }

    return query;
}

/**
 * @param {String} value The column to encrypt
 * @param {String} encryptionKey The column to encrypt
 * @return {String}
 */
export function encrypt(value: string, encryptionKey: string): string {
    return `AES_ENCRYPT(${value}, '${encryptionKey}')`;
}

/**
 * @param {String} fieldName The column to decrypt
 * @param {String} encryptionKey The column to decrypt
 * @return {String}
 */
export function decrypt(fieldName: string, encryptionKey: string): string {
    return `AES_DECRYPT(${fieldName}, "${encryptionKey}")`;
}
