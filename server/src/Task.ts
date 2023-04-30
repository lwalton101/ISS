import TaskVariable from "./TaskVariable";

interface Task {
    name: string;
    content: string;
    variables: Array<TaskVariable>;
}

export default Task;