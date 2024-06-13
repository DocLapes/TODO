import {Dialogs, Frame, Observable} from "@nativescript/core";
import {SubtaskDelete, SubtaskGet, SubtaskInvertStatus, SubtaskSetCompletionStatus} from "~/Model/SubtaskRepository";
import {TaskEditorSetNewTitleForSubtask} from "~/Model/TaskEditor";
import {
    DatabaseErrorOccuredException,
    SubtaskNotFoundException,
    SubtaskTitleLengthMustBeMoreThanZeroException
} from "~/Model/Exceptions";


const TASK_EDITING_PATH = '/View/Task/EditTask/EditTask';
const TASK_LIST_PATH = '/View/Task/Task';
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

function updateSubtaskTitleInViewModel()
{
    let subtask = SubtaskGet(viewModel.get('subtaskId'));
    viewModel.set('subtaskTitle', subtask.title);
}

function updateSubtaskCompletionStatusInViewModel()
{
    let subtask = SubtaskGet(viewModel.get('subtaskId'));
    viewModel.set('subtaskCompletionStatus', subtask.isCompleted);
}

async function askUserIfHeWantsToDeleteSubtask()
{
    let result = await Dialogs.confirm({
        title: 'Удалить подзадачу',
        message: 'Удалить эту подзадачу?',
        okButtonText: 'Да',
        cancelButtonText: 'Нет',
    });
    return result;
}

async function deleteSubtask()
{
    if (!(await askUserIfHeWantsToDeleteSubtask()))
        return;
    try
    {
        let id = viewModel.get('subtaskId');
        SubtaskDelete(id);
        viewModel.set('subtaskHasBeenDeleted', true);
        navigateToTaskEditPage();
    }
    catch (e)
    {
        if (e instanceof SubtaskNotFoundException)
        {
            DisplayErrorMessage('Подзадача уже была удалена.');
            navigateToTaskEditPage();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне.');
            return;
        }
        throw e;
    }
}

function reverseCompletionStatusOfSubtask(args)
{
    try
    {
        let id = viewModel.get('subtaskId');
        SubtaskInvertStatus(id);
        updateSubtaskTitleInViewModel();
    }
    catch (e)
    {
        if (e instanceof SubtaskNotFoundException)
        {
            DisplayErrorMessage('Подзадача уже была удалена.');
            navigateToTaskEditPage();
            return;
        }
        if (e instanceof DatabaseErrorOccuredException)
        {
            DisplayErrorMessage('Невозможно взаимодействовать с хранилищем данных на телефоне.');
            return;
        }
        throw e;
    }
}

function setSubtaskTitle(args)
{
    let title = args.object.text;
    let subtaskId = viewModel.get('subtaskId');
    try
    {
        TaskEditorSetNewTitleForSubtask(subtaskId, title);
        updateSubtaskTitleInViewModel();
    }
    catch (e)
    {
        if (e instanceof SubtaskNotFoundException)
        {
            DisplayErrorMessage('Подзадача была удалена');
            navigateToTaskEditPage();
            return;
        }
        if (e instanceof SubtaskTitleLengthMustBeMoreThanZeroException)
        {
            DisplayErrorMessage('Введите название подзадачи');
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

function navigateToTaskEditPage()
{
    Frame.topmost().navigate({
        moduleName: TASK_EDITING_PATH,
        clearHistory: true
    });
}

function navigateToTasksList()
{
    Frame.topmost().navigate({
        moduleName: TASK_LIST_PATH,
        clearHistory: true
    });
}

export function createViewModel(context)
{
    viewModel.subtaskId = context.subtaskId;
    viewModel.deleteSubtask = deleteSubtask;
    viewModel.reverseCompletionStatusOfSubtask = reverseCompletionStatusOfSubtask;
    viewModel.setSubtaskTitle = setSubtaskTitle;
    viewModel.navigateToTasksList = navigateToTasksList;
    viewModel.navigateToTaskEditPage = navigateToTaskEditPage;
    viewModel.subtaskHasBeenDeleted = false;
    updateSubtaskTitleInViewModel();
    updateSubtaskCompletionStatusInViewModel();
    return viewModel;
}
