import mysql from 'mysql';
import {JOIN_TYPES} from '.';
import SequelTable from './SequelTable';

export type getColumnsType = {name: string; isEncrypted?: boolean; custom?: string; as?: string}[];
export type insertColumnsType = {name: string; value: string | number | boolean | null; isEncrypted?: boolean}[];
export type updateColumnsType = {name: string; value: string | number | boolean | null; isEncrypted?: boolean}[];
export type insertReturnType = mysql.OkPacket;
export type paramsType = {[key: string]: any};
export type procedureColumnsType = {name: string; value: string; isEncrypted?: boolean}[];

export interface SchemaField {
    type: DataTypes;
    isEncrypted: boolean;
    isRequired: boolean;
}
export type DatabaseSchema = {[key: string]: SchemaField};
export type JoinedSchemasType = {
    schema: DatabaseSchema;
    condition: string;
    tableName: string;
    alias?: string;
    columnsAlias?: {[key: string]: string}[];
}[];

export type MasterTableType = {
    table: SequelTable<unknown>;
    tableAlias?: string;
    reqColumns?: string[];
    columnsAlias?: {[key: string]: string};
};

export type JoinedTablesType = {
    table: SequelTable<unknown>;
    joinType: JOIN_TYPES;
    joinCondition: string;
    tableAlias?: string;
    reqColumns?: string[];
    columnsAlias?: {[key: string]: string};
}[];
export interface MySQLConfig extends mysql.ConnectionConfig {}

enum DataTypes {
    CHAR = 'CHAR',
    INTEGER = 'INTEGER',
    DECIMAL = 'DECIMAL',
    SIGNED = 'SIGNED',
    UNSIGNED = 'UNSIGNED',
    TIME = 'TIME',
    DATETIME = 'DATETIME',
    DATE = 'DATE',
}

export default DataTypes;
