/**
 * @file subsystem for opening connection with sqlite database.
 */

export class CantOpenDatabaseException {}

const DB_NAME = 'TODO';
const SQLITE = require( "nativescript-sqlite" );
let DATABASE = undefined;
new SQLITE(DB_NAME, DatabaseInit);

function IsDatabaseSchemeReady()
{
    let result = false;
    DATABASE.get('SELECT 1 FROM Task', (err, res) =>
    {
        result = res[0] === 1;
    });
    return result;
}

function CreateDatabaseScheme()
{
    DATABASE.execSQL(
        'CREATE TABLE Task(' +
        'id             INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'title          TEXT,' +
        'is_completed   INTEGER DEFAULT 0 CHECK(is_completed IN (0,1)),' +
        'description    TEXT);'
    );
    DATABASE.execSQL(
        'CREATE TABLE Subtask(' +
        'id             INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'task_id        INTEGER,' +
        'title          TEXT,' +
        'is_completed   INTEGER DEFAULT 0 CHECK(is_completed IN (0,1)),' +
        'FOREIGN KEY (task_id) REFERENCES Task (id) ON DELETE CASCADE);'
    );
}


function DatabaseInit(err, db)
{
    if (err)
        throw new CantOpenDatabaseException();
    DATABASE = db;
    db.execSQL("PRAGMA foreign_keys=ON");
    if (!IsDatabaseSchemeReady())
        CreateDatabaseScheme();
}

/**
 * Returns instance for interaction with SQLite database.
 * @return {SQLITE}
 */
export function DatabaseGetInstance()
{
    return DATABASE;
}

/**
 * Wipes and completely recreates the SQLite database.
 * @returns {void}
 */
export function ResetDatabase()
{
    SQLITE.deleteDatabase(DB_NAME);
    new SQLITE(DB_NAME, DatabaseInit);
}
