import mysql from 'mysql';

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
export type JoinedSchemasType = {schema: DatabaseSchema; condition: string; tableName: string; alias?: string}[];
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
