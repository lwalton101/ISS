import Task from "./Task";

interface Tasks{
    [key: string]: Task;
}

interface TaskContainer{
    tasks: Tasks
}

export default TaskContainer;