/**
 * @fileoverview subsystem for changing user's tasks data.
 * @throws {CantOpenDatabaseException}
 *
 * prepared sql queries are available only in the paid version of
 * nativescript-sqlite plugin, so, please, ignore SQL-injection moments.
 */

import {DatabaseGetInstance} from "~/Model/database";
import {
    DatabaseErrorOccuredException, TaskDescriptionLengthMustBeMoreThanZeroException,
    TaskNotFoundException,
    TaskTitleLengthMustBeMoreThanZeroException
} from "~/Model/Exceptions";

/**
 * Object for storing data of user's task.
 */
export class Task
{
    id;
    title;
    description;
    isCompleted;
    constructor(id, title, isCompleted, description)
    {
        this.id = id;
        this.title = title;
        this.isCompleted = isCompleted !== 0;
        this.description = description;
    }
}

/**
 * Creates a new task for the user, filling it with default data.
 * @param {string} title Task's title.
 * @param {string} description Task's description.
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskCreate(title, description)
{
    let db = DatabaseGetInstance();
    let query = 'INSERT INTO Task (title, description) VALUES (\'' + title + '\', \'' + description + '\')';
    console.log('TaskCreate: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Returns a list of the user's tasks.
 * @throws {DatabaseErrorOccuredException}
 * @return {Task[]}
 */
export function TaskGetAll()
{
    let result = [];
    let db = DatabaseGetInstance();
    let query = 'SELECT * FROM Task';
    console.log('TaskGetAll: ' + query);
    db.all(query, (err, rows) =>
    {
        if (err)
            throw new DatabaseErrorOccuredException();
        for (let row of rows)
            result.push(new Task(row[0], row[1], row[2], row[3]));
    });
    return result;
}

/**
 * Returns a list of completed user's tasks.
 * @throws {DatabaseErrorOccuredException}
 * @return {Task[]}
 */
export function TaskGetCompletedTasks()
{
    let result = [];
    let db = DatabaseGetInstance();
    let query = 'SELECT * FROM Task WHERE is_completed = 1';
    console.log('TaskGetCompletedTasks: ' + query);
    db.all(query, (err, rows) =>
    {
        if (err)
            throw new DatabaseErrorOccuredException();
        for (let row of rows)
            result.push(new Task(row[0], row[1], row[2], row[3]));
    });
    return result;
}

/**
 * Returns a list of uncompleted user's tasks.
 * @throws {DatabaseErrorOccuredException}
 * @return {Task[]}
 */
export function TaskGetUncompletedTasks()
{
    let result = [];
    let db = DatabaseGetInstance();
    let query = 'SELECT * FROM Task WHERE is_completed = 0';
    console.log('TaskGetUncompletedTasks: ' + query);
    db.all(query, (err, rows) =>
    {
        if (err)
            throw new DatabaseErrorOccuredException();
        for (let row of rows)
            result.push(new Task(row[0], row[1], row[2], row[3]));
    });
    return result;
}

/**
 * Checks if task with that identifier exists.
 * @param {number} taskId Task's identifier.
 * @throws {DatabaseErrorOccuredException}
 * @return {boolean}
 */
export function TaskExist(taskId)
{
    let result = false;
    let db = DatabaseGetInstance();
    let query = "SELECT 1 FROM Task WHERE id = '" + taskId + "' LIMIT 1";
    console.log('TaskExist: ' + query);
    db.get(query, (err, rows) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
            if (rows.length === 0)
                return;
            result = true;
        });
    return result;
}

/**
 * Returns user's task if exists.
 * @param {number} taskId Task's identifier.
 * @throws {DatabaseErrorOccuredException}
 * @return {Task | null}
 */
export function TaskGet(taskId)
{
    let result = null;
    let db = DatabaseGetInstance();
    let query = 'SELECT * FROM Task WHERE id = ' + taskId + ' LIMIT 1';
    console.log('TaskGet: ' + query);
    db.get(query, (err, rows) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
            if (rows.length === 0)
                return;
            result = new Task(rows[0], rows[1], rows[2], rows[3]);
        });
    return result;
}

/**
 * Deletes user's task.
 * @param {number} taskId Task's identifier
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskDelete(taskId)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'DELETE FROM Task WHERE id = ' + taskId;
    console.log('TaskDelete: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Changes title of the user's task.
 * @param {number} taskId  Task's identifier
 * @param {string} newTitle Task's new title.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskChangeTitle(taskId, newTitle)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'UPDATE Task SET title = \'' + newTitle + '\' WHERE id = ' + taskId;
    console.log('TaskChangeTitle: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Changes description of the user's task.
 * @param {number} taskId Task's identifier
 * @param {string} newDescription Task's new description.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskChangeDescription(taskId, newDescription)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'UPDATE Task SET description = "' + newDescription + '" WHERE id = ' + taskId;
    console.log('TaskChangeDescription: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Sets completion status of the task to true.
 * @param {number} taskId Task's identifier.
 * @param {boolean} status
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskSetCompletionStatus(taskId, status)
{
    let numStatus = status? 1: 0;
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = "UPDATE Task SET is_completed = " + numStatus + ' WHERE id = ' + taskId;
    console.log('TaskSetCompletionStatus: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Inverts completion status of the task.
 * @param {number} taskId Task's identifier.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskInvertStatus(taskId)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'UPDATE Task SET is_completed = ((is_completed | 1) - (is_completed & 1)) WHERE id = ' + taskId;
    console.log('TaskInvertStatus: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}

/**
 * Completes all subtasks of the task.
 * @param {number} taskId Task's identifier.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskCompleteAllSubtasks(taskId)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'UPDATE Subtask SET is_completed = 1 WHERE task_id = ' + taskId;
    console.log('TaskCompleteAllSubtasks: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}
/**
 * Uncompletes all subtasks of the task.
 * @param {number} taskId Task's identifier.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @return {void}
 */
export function TaskUncompleteAllSubtasks(taskId)
{
    if (!TaskExist(taskId))
        throw new TaskNotFoundException();
    let db = DatabaseGetInstance();
    let query = 'UPDATE Subtask SET is_completed = 0 WHERE task_id = ' + taskId;
    console.log('TaskUncompleteAllSubtasks: ' + query);
    db.execSQL(query, (err, _) =>
        {
            if (err)
                throw new DatabaseErrorOccuredException();
        });
}
