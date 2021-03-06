import MySQL from './SQL';
import {
    getColumnsType,
    paramsType,
    DatabaseSchema,
    insertReturnType,
    updateColumnsType,
    JoinedSchemasType,
} from './types';

export enum JOIN_TYPES {
    INNER = 'INNER JOIN',
    LEFT_OUTER = 'LEFT OUTER JOIN',
    RIGHT_OUTER = 'RIGHT OUTER JOIN',
    FULL_OUTER = 'FULL JOIN',
}

export default class SequelTable<T> {
    private _schema: DatabaseSchema;
    private _tableName: string;
    private _mysql: MySQL;

    constructor(tableName: string, schema: DatabaseSchema, mysql: MySQL) {
        this._schema = schema;
        this._tableName = tableName;
        this._mysql = mysql;
    }

    public get tableName(): string {
        return this._tableName;
    }

    public get schema(): DatabaseSchema {
        return this._schema;
    }

    /**
     * @param {String} query SQL query
     * @param {paramsType} params the required params
     * @return {Promise}
     */
    executeQuery(query: string, params: paramsType = {}): Promise<any> {
        return this._mysql.executeQuery(query, params, this._schema);
    }

    /**
     *
     * @param {string} extraQuery The Join and where conditions needed
     * @param {paramsType} params
     * @param {string[]} reqColumns
     * An optional array containing the required columns, if not specified all the columns will be returned
     * @return {Promise}
     */
    get(extraQuery: string, params: paramsType = {}, reqColumns?: string[]): Promise<T[]> {
        const columns: getColumnsType = [];

        for (const fieldName in this._schema) {
            if (typeof this._schema[fieldName] !== 'undefined' && (!reqColumns || reqColumns.includes(fieldName))) {
                columns.push({name: fieldName, as: fieldName, isEncrypted: this._schema[fieldName].isEncrypted});
            }
        }

        return this._mysql.getCustomData(this._schema, [{columns, tableName: this._tableName}], extraQuery, params);
    }

    /**
     *
     * @param {getColumnsType} columns
     * @param {string} extraQuery The Join and where conditions needed
     * @param {paramsType} params
     * An optional array containing the required columns, if not specified all the columns will be returned
     * @param {string} tableAlias
     * @return {Promise}
     */
    getCustomData(columns: getColumnsType, extraQuery: string, params: paramsType, tableAlias?: string) {
        return this._mysql.getCustomData(
            this._schema,
            [{columns, tableName: this._tableName, tableAlias}],
            extraQuery,
            params,
        );
    }

    create(data: T, extraQuery = ''): Promise<insertReturnType> {
        return this._mysql.insertCustomData(data, this._tableName, this._schema, extraQuery);
    }

    update(data: paramsType, extraQuery: string, params?: paramsType): Promise<any> {
        const columns: updateColumnsType = [];

        for (const fieldName in data) {
            if (typeof this._schema[fieldName] !== 'undefined') {
                const value = data[fieldName];
                const field = this._schema[fieldName];

                columns.push({name: fieldName, value, isEncrypted: field.isEncrypted});
            } else {
                throw new Error(`trying to update "${fieldName}" but its not defined in the database schema`);
            }
        }

        return this._mysql.updateCustomData(this._schema, columns, this._tableName, extraQuery, params);
    }
}
