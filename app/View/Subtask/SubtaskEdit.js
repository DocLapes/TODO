import { createViewModel } from './SubtaskEdit-view-model';
import {SubtaskSetCompletionStatus} from "~/Model/SubtaskRepository";
import {Dialogs} from "@nativescript/core";
import {DatabaseErrorOccuredException, SubtaskNotFoundException} from "~/Model/Exceptions";

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel(page.navigationContext);
}

function DisplayErrorMessage(message)
{
    Dialogs.alert({
        title: 'Ошибка',
        message: message,
        okButtonText: 'Ок',
        cancelable: true
    });
}

function saveChangesOfSubtaskCompletionStatus(subtaskId, subtaskCompletionStatus)
{
    try
    {
        //We are leaving page, so we cannot tell anything to user.
        SubtaskSetCompletionStatus(subtaskId, subtaskCompletionStatus);
    }
    catch (e) {}
}

export function onUnloaded(args)
{
    const page = args.object;
    if (page.bindingContext.subtaskHasBeenDeleted)
        return;
    saveChangesOfSubtaskCompletionStatus(
        page.bindingContext.subtaskId,
        page.bindingContext.subtaskCompletionStatus
    );
}
