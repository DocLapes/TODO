import {
    TaskChangeDescription,
    TaskChangeTitle, TaskCompleteAllSubtasks,
    TaskCreate,
    TaskDelete,
    TaskGetAll, TaskInvertStatus
} from "~/Model/TaskRepository";
import {ResetDatabase} from "~/Model/database";
import {SubtaskCreate, SubtaskGetAll} from "~/Model/SubtaskRepository";

QUnit.test("creating task test", testCreatingTask);

function testCreatingTask(assert)
{
    ResetDatabase();
    let amount = TaskGetAll().length;
    TaskCreate('Новая задача', 'бла');
    let task = TaskGetAll()[0];
    TaskChangeTitle(task.id, 'My task haha');
    TaskChangeDescription(task.id, 'My holy desc');
    TaskInvertStatus(task.id);
    task = TaskGetAll()[0];
    assert.deepEqual(task.title, 'My task haha');
    assert.deepEqual(task.description, 'My holy desc');
    assert.true(task.isCompleted);
    SubtaskCreate(task.id, 'sub');
    TaskCompleteAllSubtasks(task.id);
    assert.true(SubtaskGetAll(task.id)[0].isCompleted);
    TaskDelete(task.id);
    assert.deepEqual(SubtaskGetAll(task.id).length, 0);
    //assert.deepEqual(TaskGetAll().length, amount);
}
