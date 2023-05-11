import ScheduleType from "./ScheduleType";
import ScheduledVariable from "./ScheduledVariable";
import Task from "./Task";
import VariableHolder from "./VariableHolder";

interface ScheduledTask{
    type: string;
    variables: Array<ScheduledVariable>;
    scheduleData: any;
    deviceID: string;
    id: string;
    name: string;
}

export default ScheduledTask;