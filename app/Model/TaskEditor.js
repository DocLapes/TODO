/**
 * @fileoverview A subsystem for user interaction with his task.
 * @throws {CantOpenDatabaseException}
 */
import {
    TaskChangeDescription,
    TaskChangeTitle, TaskComplete,
    TaskCompleteAllSubtasks,
    TaskDelete,
    TaskExist,
    TaskGet, TaskSetCompletionStatus, TaskUncompleteAllSubtasks
} from "~/Model/TaskRepository";
import {
    SubtaskTitleLengthMustBeMoreThanZeroException,
    TaskDescriptionLengthMustBeMoreThanZeroException, TaskEditorNotInitialisedException,
    TaskNotFoundException,
    TaskTitleLengthMustBeMoreThanZeroException
} from "~/Model/Exceptions";
import {SubtaskChangeTitle, SubtaskCreate, SubtaskDelete} from "~/Model/SubtaskRepository";

let currTask = null;

/**
 * Returns the user's last modified task.
 * @returns {Task | null}
 */
export function TaskEditorGetCurrentlyModifiableTask()
{
    return currTask;
}

/**
 * Sets the user's task, which will be modified from now on.
 * @param {number} taskId. Id of user's task.
 * @throws {DatabaseErrorOccuredException}
 * @throws {TaskNotFoundException}
 * @returns {void}
 */
export function TaskEditorSetCurrentlyModifiableTask(taskId)
{
    currTask = TaskGet(taskId);
    if (currTask === null)
        throw new TaskNotFoundException();
}

/**
 * Sets a new title for the currently modifiable user's task.
 * @param {string} title
 * @throws {DatabaseErrorOccuredException}
 * @throws {TaskTitleLengthMustBeMoreThanZeroException}
 * @throws {TaskNotFoundException}
 * @throws {TaskEditorNotInitialisedException}
 * @returns {void}
 */
export function TaskEditorSetNewTitle(title)
{
    if (title.length === 0)
        throw new TaskTitleLengthMustBeMoreThanZeroException();
    if (currTask === null)
        throw new TaskEditorNotInitialisedException();
    currTask.title = title;
    TaskChangeTitle(currTask.id, title);
}

/**
 * Sets a new description for the currently modifiable user's task.
 * @param {string} description
 * @throws {DatabaseErrorOccuredException}
 * @throws {TaskNotFoundException}
 * @throws {TaskEditorNotInitialisedException}
 * @returns {void}
 */
export function TaskEditorSetNewDescription(description)
{
    if (currTask === null)
        throw new TaskEditorNotInitialisedException();
    currTask.description = description;
    TaskChangeDescription(currTask.id, description);
}

/**
 * Reverses completion status of the currently modifiable user's task.
 * @throws {DatabaseErrorOccuredException}
 * @throws {TaskNotFoundException}
 * @throws {TaskEditorNotInitialisedException}
 * @returns {void}
 */
export function TaskEditorReverseCompletionStatusOfTask()
{
    if (currTask === null)
        throw new TaskEditorNotInitialisedException();
    TaskSetCompletionStatus(currTask.id, !currTask.isCompleted);
    if (currTask.isCompleted)
        TaskUncompleteAllSubtasks(currTask.id);
    else
        TaskCompleteAllSubtasks(currTask.id);
    currTask.isCompleted = !currTask.isCompleted;
}

/**
 * Deletes user's currently modifiable task.
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @throws {TaskEditorNotInitialisedException}
 * @returns {void}
 */
export function TaskEditorDeleteTask()
{
    if (currTask === null)
        throw new TaskEditorNotInitialisedException();
    TaskDelete(currTask.id);
    currTask = null;
}

/**
 * Sets a new title for subtask of the currently modifiable user's task.
 * @param {number} subtaskId
 * @param {string} title
 * @throws {SubtaskNotFoundException}
 * @throws {SubtaskTitleLengthMustBeMoreThanZeroException}
 * @throws {DatabaseErrorOccuredException}
 * @returns {void}
 */
export function TaskEditorSetNewTitleForSubtask(subtaskId, title)
{
    if (title.length === 0)
        throw new SubtaskTitleLengthMustBeMoreThanZeroException();
    SubtaskChangeTitle(subtaskId, title);
}

/**
 * Creates a new subtask of user's currently modifiable task.
 * @param {number} subtaskId
 * @throws {TaskNotFoundException}
 * @throws {DatabaseErrorOccuredException}
 * @returns {void}
 */
export function TaskEditorCreateNewSubtask()
{
    if (currTask === null)
        throw new TaskEditorNotInitialisedException();
    SubtaskCreate(currTask.id, 'Новая подзадача');
}
