import {
    SubtaskChangeTitle,
    SubtaskCreate,
    SubtaskDelete,
    SubtaskExist,
    SubtaskGet,
    SubtaskGetAll, SubtaskInvertStatus
} from "~/Model/SubtaskRepository";
import {ResetDatabase} from "~/Model/database";
import {TaskCreate, TaskGetAll} from "~/Model/TaskRepository";

QUnit.test("creating subtask test", testCreatingSubtask);

function testCreatingSubtask(assert)
{
    ResetDatabase();
    TaskCreate('фан', 'армина ван бармина');
    let task = TaskGetAll()[0];
    SubtaskCreate(task.id, 'пОдзадача');
    assert.deepEqual(SubtaskGetAll(task.id).length, 1);
    let subtask = SubtaskGetAll(task.id)[0];
    assert.true(SubtaskExist(subtask.id));
    SubtaskChangeTitle(subtask.id, 'My subtask haha');
    SubtaskInvertStatus(subtask.id);
    subtask = SubtaskGetAll(subtask.id)[0];
    assert.deepEqual(subtask.title, 'My subtask haha');
    assert.true(subtask.isCompleted);
    SubtaskDelete(subtask.id);
    assert.deepEqual(SubtaskGetAll(subtask.id).length, 0);
}
