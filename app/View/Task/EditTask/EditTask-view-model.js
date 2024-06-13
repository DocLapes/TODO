import {Dialogs, Frame, Observable} from '@nativescript/core';
import {
    SubtaskDelete, SubtaskGet,
    SubtaskGetAll,
    SubtaskInvertStatus
} from "~/Model/SubtaskRepository";
import {
    DatabaseErrorOccuredException,
    SubtaskNotFoundException,
    SubtaskTitleLengthMustBeMoreThanZeroException,
    TaskDescriptionLengthMustBeMoreThanZeroException,
    TaskEditorNotInitialisedException,
    TaskNotFoundException,
    TaskTitleLengthMustBeMoreThanZeroException
} from "~/Model/Exceptions";
import {
    TaskEditorCreateNewSubtask,
    TaskEditorDeleteTask,
    TaskEditorGetCurrentlyModifiableTask, TaskEditorReverseCompletionStatusOfTask,
    TaskEditorSetNewDescription,
    TaskEditorSetNewTitle,
    TaskEditorSetNewTitleForSubtask
} from "~/Model/TaskEditor";

const TASK_LIST_PATH = '/View/Task/Task';
const SUBTASK_EDITING_PATH = '/View/Subtask/SubtaskEdit';
const viewModel = new Observable();

function DisplayErrorMessage(message)
{
    Dialogs.alert({
        title: 'Ошибка',
        message: message,
        okButtonText: 'Ок',
        cancelable: true
    });
}

function updateSubtasksListInViewModel()
{
    let task = TaskEditorGetCurrentlyModifiableTask();
    if (task === null)
        navigateToTasksList();
    try
    {
        viewModel.set('subtasks', SubtaskGetAll(task.id));
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Редактируемая задача была удалена.');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;
    }
}

function updateTaskDetailsInViewModel()
{
    let task = TaskEditorGetCurrentlyModifiableTask();
    if (task === null)
        navigateToTasksList();
    viewModel.set('taskTitle', task.title);
    viewModel.set('taskDescription', task.description);
    viewModel.set('taskCompletionStatus', task.isCompleted);
    if (task.isCompleted)
        viewModel.set('taskCompletionText', "Начать задачу заново");
    else
        viewModel.set('taskCompletionText', "Выполнить задачу");
}

function setTaskTitle(args)
{
    let title = args.object.text;
    if (title.length === 0)
    {
        DisplayErrorMessage('Введите название задачи.');
        return;
    }
    try
    {
        TaskEditorSetNewTitle(title);
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Задача была удалена.')
            navigateToTasksList();
            return;
        }
        if (e instanceof TaskEditorNotInitialisedException)
        {
            DisplayErrorMessage('Внутренняя ошибка.');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;
    }
}

function setTaskDescription(args)
{
    let description = args.object.text;
    try
    {
        TaskEditorSetNewDescription(description);
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Задача была удалена.')
            navigateToTasksList();
            return;
        }
        if (e instanceof TaskEditorNotInitialisedException)
        {
            DisplayErrorMessage('Внутренняя ошибка.');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;
    }
}

async function askUserIfHeWantsToDeleteTask()
{
    let result = await Dialogs.confirm({
        title: 'Удалить задачу',
        message: 'Удалить эту задачу?',
        okButtonText: 'Да',
        cancelButtonText: 'Нет',
    });
    return result;
}

function completeTask()
{
    try
    {
        TaskEditorReverseCompletionStatusOfTask();
        updateTaskDetailsInViewModel();
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Задача была удалена.')
            navigateToTasksList();
            return;
        }
        if (e instanceof TaskEditorNotInitialisedException)
        {
            DisplayErrorMessage('Внутренняя ошибка.');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;
    }
}

async function deleteTask()
{
    if (!(await askUserIfHeWantsToDeleteTask()))
        return;
    try
    {
        TaskEditorDeleteTask();
        navigateToTasksList();
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Задача уже была удалена');
            navigateToTasksList();
            return;
        }
        if (e instanceof TaskEditorNotInitialisedException)
        {
            DisplayErrorMessage('Внутренняя ошибка');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;
    }
}

function createNewSubtask()
{
    try
    {
        TaskEditorCreateNewSubtask();
        updateSubtasksListInViewModel();
    }
    catch (e)
    {
        if (e instanceof TaskNotFoundException)
        {
            DisplayErrorMessage('Задача уже была удалена');
            navigateToTasksList();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне');
            return;
        }
        throw e;

    }
}

function editSubtask(args)
{
    let subtaskId = +args.object.items[args.index].id;
    Frame.topmost().navigate({
        moduleName: SUBTASK_EDITING_PATH,
        context: {subtaskId: subtaskId}
    });
}

function navigateToTasksList()
{
    Frame.topmost().navigate({
        moduleName: TASK_LIST_PATH,
        clearHistory: true
    });
}

export function createViewModel()
{
    if (TaskEditorGetCurrentlyModifiableTask() === null)
        navigateToTasksList();
    viewModel.setTaskTitle = setTaskTitle;
    viewModel.setTaskDescription = setTaskDescription;
    viewModel.deleteTask = deleteTask;
    viewModel.createNewSubtask = createNewSubtask;
    viewModel.gotoTasksList = navigateToTasksList;
    viewModel.editSubtask = editSubtask;
    viewModel.completeTask = completeTask;
    updateTaskDetailsInViewModel();
    updateSubtasksListInViewModel();
    return viewModel;
}
