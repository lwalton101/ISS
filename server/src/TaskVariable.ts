import TaskVariableType from "./TaskVariableType";

class TaskVariable{
    name: string;
    type: TaskVariableType

    constructor(name: string, type: TaskVariableType){
        this.name = name;
        this.type = type;
    }
}

export default TaskVariable;