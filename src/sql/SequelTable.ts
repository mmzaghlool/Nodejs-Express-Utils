import MySQL from './SQL';
import {getColumnsType, paramsType, DatabaseSchema, insertReturnType, updateColumnsType, SchemaField} from './types';

export default class SequelTable<T> {
    private schema: DatabaseSchema;
    private tableName: string;
    private mysql: MySQL;

    constructor(tableName: string, schema: DatabaseSchema, mysql: MySQL) {
        this.schema = schema;
        this.tableName = tableName;
        this.mysql = mysql;
    }
    /**
     * @param {String} query SQL query
     * @param {paramsType} params the required params
     * @return {Promise}
     */
    executeQuery(query: string, params: paramsType = {}): Promise<any> {
        return this.mysql.executeQuery(query, params, this.schema);
    }

    // TODO: What if we want to add more columns ??
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

        for (const fieldName in this.schema) {
            if (typeof this.schema[fieldName] !== 'undefined' && (!reqColumns || reqColumns.includes(fieldName))) {
                columns.push({name: fieldName, as: fieldName, isEncrypted: this.schema[fieldName].isEncrypted});
            }
        }

        return this.mysql.getCustomData(this.schema, [{columns, tableName: this.tableName}], extraQuery, params);
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
        return this.mysql.getCustomData(
            this.schema,
            [{columns, tableName: this.tableName, tableAlias}],
            extraQuery,
            params,
        );
    }

    create(data: T, extraQuery = ''): Promise<insertReturnType> {
        return this.mysql.insertCustomData(data, this.tableName, this.schema, extraQuery);
    }

    update(data: paramsType, extraQuery: string, params?: paramsType): Promise<any> {
        const columns: updateColumnsType = [];

        for (const fieldName in data) {
            if (typeof this.schema[fieldName] !== 'undefined') {
                const value = data[fieldName];
                const field = this.schema[fieldName];

                columns.push({name: fieldName, value, isEncrypted: field.isEncrypted});
            } else {
                throw new Error(`trying to update "${fieldName}" but its not defined in the database schema`);
            }
        }

        return this.mysql.updateCustomData(this.schema, columns, this.tableName, extraQuery, params);
    }
}
