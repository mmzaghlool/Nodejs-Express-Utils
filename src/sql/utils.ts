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

            query = query.replace(RegExp(`&${key}`, 'g'), `CAST(${decrypt(key, encryptionKey)} AS ${type})`);

            // Encrypt or Decrypt with variable
            query = query.replace(RegExp(`#:${key}`, 'g'), `${encrypt(`"${params[key]}"`, encryptionKey)}`);
            query = query.replace(
                RegExp(`&:${key}`, 'g'),
                `CAST(${decrypt(`${params[key]}`, encryptionKey)} AS ${type})`,
            );
        }
    }

    // Insert params values
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const value = params[key];

            query = query.replace(RegExp(`:${key}`, 'g'), `"${value}"`);
            // eslint-disable-next-line no-useless-escape
            query = query.replace(RegExp(`!${key}`, 'g'), '`' + value + '`');
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
    return `AES_ENCRYPT(${value}, "${encryptionKey}")`;
}

/**
 * @param {String} fieldName The column to decrypt
 * @param {String} encryptionKey The column to decrypt
 * @return {String}
 */
export function decrypt(fieldName: string, encryptionKey: string): string {
    return `AES_DECRYPT(${fieldName}, "${encryptionKey}")`;
}