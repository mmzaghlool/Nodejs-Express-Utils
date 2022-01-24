import mysql, {MysqlError} from 'mysql';
import {JOIN_TYPES} from '.';
import SequelTable from './SequelTable';
import {
    MySQLConfig,
    DatabaseSchema,
    getColumnsType,
    paramsType,
    insertReturnType,
    updateColumnsType,
    JoinedTablesType,
    MasterTableType,
} from './types';
import {decrypt, parseQuery} from './utils';

export default class MySQL {
    private database: mysql.Connection;
    private encryptionKey: string;

    constructor(config: MySQLConfig, encryptionKey: string) {
        this.database = mysql.createConnection(config);
        this.encryptionKey = encryptionKey;
    }

    public get databaseConnection(): mysql.Connection {
        return this.database;
    }

    private getColumns(schema: DatabaseSchema, reqColumns?: string[], columnsAlias: {[key: string]: string} = {}) {
        const columns: getColumnsType = [];

        for (const fieldName in schema) {
            if (typeof schema[fieldName] !== 'undefined' && (!reqColumns || reqColumns.includes(fieldName))) {
                const alias = columnsAlias[fieldName];

                columns.push({
                    name: fieldName,
                    as: alias ? alias : fieldName,
                    isEncrypted: schema[fieldName].isEncrypted,
                });
            } else if (typeof schema[fieldName] === 'undefined') {
                throw new Error(`Schema dose not contain fieldName: ${fieldName}`);
            }
        }

        return columns;
    }

    init<T>(tableName: string, schema: DatabaseSchema): SequelTable<T> {
        return new SequelTable<T>(tableName, schema, this);
    }

    public executeJoin(
        masterTable: MasterTableType,
        joinTables: JoinedTablesType,
        extraQuery: string = '',
        params: paramsType = {},
        customFields: string[] = [],
    ) {
        const tables: {columns: getColumnsType; tableName: string; tableAlias?: string}[] = [];
        const {table: msTable, columnsAlias, reqColumns, tableAlias} = masterTable;

        tables.push({
            columns: this.getColumns(msTable.schema, reqColumns, columnsAlias),
            tableName: msTable.tableName,
            tableAlias,
        });
        let query = '';
        let jSchema: {[key: string]: any} = this.getAliasedSchema(
            tableAlias ? tableAlias : msTable.tableName,
            msTable.schema,
        );

        for (let i = 0; i < joinTables.length; i++) {
            const {joinCondition, table, joinType, columnsAlias, tableAlias, reqColumns} = joinTables[i];
            const condition = ` ${joinType} \`${table.tableName}\` ${tableAlias ? `\`${tableAlias}\`` : ''} 
            ON ${joinCondition} `;

            tables.push({
                columns: this.getColumns(table.schema, reqColumns, columnsAlias),
                tableName: table.tableName,
                tableAlias,
            });

            query = query.concat(condition);

            jSchema = {...jSchema, ...this.getAliasedSchema(tableAlias ? tableAlias : table.tableName, table.schema)};
        }
        query = query.concat(extraQuery);

        return this.getCustomData(jSchema, tables, query, params, customFields);
    }

    private getAliasedSchema(alias: string, schema: {[key: string]: any}) {
        const res: {[key: string]: any} = {};
        for (const key in schema) {
            if (Object.prototype.hasOwnProperty.call(schema, key)) {
                const element = schema[key];
                res[`${alias}.${key}`] = element;
            }
        }

        return {...schema, ...res};
    }

    public static getColumns(schema: DatabaseSchema, tableName: string, as?: string, reqColumns?: string[]) {
        const columns: getColumnsType = [];
        for (const fieldName in schema) {
            if (typeof schema[fieldName] !== 'undefined' && (!reqColumns || reqColumns.includes(fieldName))) {
                const column: {name: string; as?: string; isEncrypted: boolean} = {
                    name: `\`${tableName}\`.\`${fieldName}\``,
                    isEncrypted: schema[fieldName].isEncrypted,
                };
                if (as) {
                    column.as = `${as}_${fieldName}`;
                }
                columns.push(column);
            }
        }

        return columns;
    }

    /**
     * @param {String} query SQL query
     * @param {paramsType} params the required params
     * @param {DatabaseSchema} schema
     * @return {Promise}
     */
    executeQuery(query: string, params: paramsType = {}, schema: DatabaseSchema = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            query = parseQuery(query, params, schema, this.encryptionKey);

            this.database.query(query, function (error: mysql.MysqlError, results: any) {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

    /**
     * @param {DatabaseSchema} schema
     * @param {Array} columns columns to get data from {name, isEncrypted, custom, as}
     * @param {String} tableName table name
     * @param {String} extraQuery added to query like where and join... etc
     * @param {object} params the required params
     * @param {String} tableAlias alias for table name
     * @return {Promise}
     */

    public getCustomData(
        schema: DatabaseSchema,
        tables: {
            columns: getColumnsType;
            tableName: string;
            tableAlias?: string;
        }[],
        extraQuery: string = '',
        params: paramsType = {},
        customFields: string[] = [],
    ): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let query = `SELECT`;
            const tableName: string = tables[0].tableName;
            const tableAlias: string = tables[0].tableAlias || tableName;

            for (const customField of customFields) {
                query = query.concat(` ${customField},`);
            }

            for (let {columns, tableName, tableAlias} of tables) {
                tableAlias = tableAlias || tableName;

                for (const {name, isEncrypted, custom, as} of columns) {
                    if (isEncrypted === true) {
                        // query = query.concat(` &${tableAlias}.${name},`);
                        query = query.concat(
                            ` CAST(${decrypt(`\`${tableAlias}\`.\`${name}\``, this.encryptionKey)} 
                                AS ${schema[name].type}),`,
                        );
                    } else if (custom !== undefined) {
                        query = query.concat(` ${custom},`);
                    } else {
                        query = query.concat(` \`${tableAlias}\`.\`${name}\`,`);
                    }

                    // With table custom name
                    if (as !== undefined) {
                        query = query.substring(0, query.length - 1);
                        query = query.concat(` AS \`${as}\`,`);
                    }
                }
            }

            query = query.substring(0, query.length - 1);
            query = query.concat(` FROM !\`tableName\` \`${tableAlias}\` ${extraQuery} ;`);

            this.executeQuery(query, {...params, tableName}, schema)
                .then((result: any[]) => resolve(result))
                .catch((err: MysqlError) => reject(err));
        });
    }

    /**
     * @param {paramsType} data
     * @param {String} tableName table name
     * @param {DatabaseSchema} schema
     * @param {String} extraQuery extra Query
     * @return {Promise}
     */
    insertCustomData<T>(
        data: paramsType,
        tableName: string,
        schema: DatabaseSchema,
        extraQuery: string = '',
    ): Promise<insertReturnType> {
        return new Promise((resolve, reject) => {
            let insertQuery = `INSERT INTO !\`tableName\` (`;
            let insertData = `VALUE(`;
            const params: paramsType = {tableName};

            for (const key in schema) {
                if (Object.prototype.hasOwnProperty.call(schema, key)) {
                    const {isEncrypted, isRequired} = schema[key];

                    // If data provided
                    if (typeof data[key] !== 'undefined') {
                        params[key] = data[key];

                        // Data not provided and it's required
                    } else if (isRequired) {
                        reject(Error(`${key} is required but not provided`));
                        break;
                        // Data not provided and not required
                    } else {
                        continue;
                    }

                    insertQuery = insertQuery.concat(`\`${key}\`,`);

                    if (isEncrypted === true) insertData = insertData.concat(` #:${key},`);
                    else insertData = insertData.concat(` :${key},`);
                }
            }

            insertQuery = insertQuery.substring(0, insertQuery.length - 1);
            insertData = insertData.substring(0, insertData.length - 1);
            const query = `${insertQuery} ) ${insertData} ) ${extraQuery};`;

            this.executeQuery(query, params, schema)
                .then((result) => resolve(result))
                .catch((err) => reject(err));
        });
    }

    /**
     * @param {DatabaseSchema} schema
     * @param {Array} columns columns to get data from {name, value, isEncrypted}
     * @param {String} tableName table name
     * @param {String} extraQuery added to query like where and join... etc
     * @param {object} params the required params
     * @return {Promise}
     */
    updateCustomData(
        schema: DatabaseSchema,
        columns: updateColumnsType,
        tableName: string,
        extraQuery: string,
        params: paramsType = {},
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            let updateQuery = `UPDATE !\`tableName\` SET `;
            params = {...params, tableName};

            for (const {name, value, isEncrypted} of columns) {
                params[name] = value;

                if (isEncrypted === true) {
                    updateQuery = updateQuery.concat(`\`${name}\`=#:${name},`);
                } else {
                    updateQuery = updateQuery.concat(`\`${name}\`=:\`${name}\`,`);
                }
            }
            updateQuery = updateQuery.substring(0, updateQuery.length - 1);
            updateQuery = updateQuery.concat(` ${extraQuery};`);

            this.executeQuery(updateQuery, params, schema)
                .then((result) => resolve(result))
                .catch((err) => reject(err));
        });
    }
}
