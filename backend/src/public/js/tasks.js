var baseURL = location.protocol + "//" + location.hostname + ":8080/api"
var modal = document.getElementById("runModal");
updateTasks();
updateScheduledTasks();
function updateTasks(){
    const options = {method: 'GET'};

    fetch(baseURL + '/getTasks', options)
    .then(response => response.json())
    .then(response => {
        var taskHolder = document.getElementById("taskHolder");
        while(taskHolder.firstChild){
            taskHolder.removeChild(taskHolder.firstChild);
        }
        tasks = response["data"]["tasks"]
  
        for(let x in tasks){
            var id = tasks[x]["id"];
          var listItem = document.createElement("li");
          listItem.innerText = tasks[x]["name"];
          listItem.id = id;
  
          var runButton = document.createElement("button");
          runButton.id = id + "run";
          runButton.textContent = "RUN";

          runButton.onclick = function(){
            modal.style.display = "block";

            var modalHeader = document.getElementById("modalHeader")
            modalHeader.textContent = `Schedule task "${tasks[x]["name"]}"`
            updateScheduleOptions(x);
            updateVarDisplay(x);
            updateDevices();
          }
  
          var editButton = document.createElement("button");
          editButton.id = id + "edit";
          editButton.textContent = "EDIT";
          editButton.onclick = function(ev){
            var newID = ev.target.id.replace("edit", "");
            document.location = location.protocol + "//" + location.host + "/editTask?taskName=" + newID
          }
  
          var deleteButton = document.createElement("button");
          deleteButton.id = id + "DELETE";
          deleteButton.textContent = "DELETE";
          deleteButton.onclick = function(ev){
              document.getElementById(ev.target.id.replace("DELETE", "")).remove();
              const options = {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: `{"taskID":"${ev.target.id.replace("DELETE", "")}"}`
                };
                
              fetch(baseURL + '/deleteTask', options)
                  .then(response => response.json())
                  .then(response => console.log(response))
                  .catch(err => console.error(err));
  
  
              //console.log(deleteButton.id.replace("DELETE", ""))
              
              
          }
  
          listItem.appendChild(runButton);
          listItem.appendChild(editButton);
          listItem.appendChild(deleteButton);
          
          taskHolder.appendChild(listItem);
      }
  
      
    })
    .catch(err => console.error(err));
}

function updateScheduledTasks(){
    const options = {method: 'GET'};

    fetch(baseURL + '/getScheduledTasks', options)
        .then(response => response.json())
        .then(response => {
            var tasks = response["data"]["tasks"]
            for(let x in tasks){
                var taskObj = tasks[x];
                var scheduledTasksHolder = document.getElementById("scheduledTasksHolder");
                while(scheduledTasksHolder.firstChild){
                    scheduledTasksHolder.removeChild(scheduledTasksHolder.firstChild);
                }

                var listItem = document.createElement("li");
                listItem.innerText = taskObj["name"];
                listItem.id = x + "sched";
        
                var unscheduleButton = document.createElement("button");
                unscheduleButton.id = x + "UNSCHEDULE";
                unscheduleButton.textContent = "UNSCHEDULE";

                unscheduleButton.onclick = function(ev){
                    
                    const options = {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: `{"scheduleID":"${x}"}`
                      };
                      
                    fetch(baseURL + '/unscheduleTask', options)
                        .then(response => response.json())
                        .then(response => document.getElementById(x + "sched").remove())
                        .catch(err => console.error(err));
                }

                listItem.appendChild(unscheduleButton);
                scheduledTasksHolder.appendChild(listItem);
            }
        })
        .catch(err => console.error(err));
}
function createTask(){
    const options = {method: 'POST'};

    fetch(baseURL + '/createTask', options)
    .then(response => response.json())
    .then(response => updateTasks())
    .catch(err => console.error(err));
}

function updateDevices(){
    const options = {method: 'GET'};

    fetch(baseURL + '/devices', options)
    .then(response => response.json())
    .then(response => {
        for(let x of response["data"]){
            var deviceHolder = document.getElementById("deviceSelect");
            var option = document.createElement("option");
            option.value = JSON.parse(x)["devName"];
            option.textContent = JSON.parse(x)["devName"];
            deviceHolder.appendChild(option);
        }
    })
    .catch(err => console.error(err));
}

var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
var scheduleTypeSelect = document.getElementById("scheduleTypeSelect");
function updateScheduleOptions(id){
    var futureDiv = document.getElementById("futureContent");
    var reccuringDiv = document.getElementById("reccuringContent");
    var timerDiv = document.getElementById("timerContent");
    var idText = document.getElementById("schedId")

    idText.textContent = id;
    futureDiv.style.display = "none";
    reccuringDiv.style.display = "none";
    timerDiv.style.display = "none";
    if(scheduleTypeSelect.value == "Future"){
        futureDiv.style.display = "block";
    }
    if(scheduleTypeSelect.value == "Recurring"){
        reccuringDiv.style.display = "block";
    }
    if(scheduleTypeSelect.value == "Timer"){
        timerDiv.style.display = "block";
    }
}


function updateVarDisplay(id){
    const options = {method: 'GET', headers: {'Task-ID': id}};

    fetch(baseURL + '/getTask', options)
    .then(response => response.json())
    .then(response => {
        var vars = response["data"]["task"]["variables"];
        var varHolder = document.getElementById("scheduleVarHolder");


        while(varHolder.firstChild){
            varHolder.removeChild(varHolder.firstChild);
        }

        for(let x of vars){
            var varDiv = document.createElement("div");
            varDiv.id = x["name"];

            var varNameP = document.createElement("p");
            varNameP.textContent = x["name"];

            var input = document.createElement("input");
            if(x["type"] === 0){
                input.type = "number";
            } else{
                input.type = "text";
            }

            varDiv.appendChild(varNameP);
            varDiv.appendChild(input);
            varHolder.appendChild(varDiv);
        }
    })
    .catch(err => console.error(err));
}

document.getElementById("scheduleButton").onclick = () => {
    scheduleTask(document.getElementById("schedId").textContent)
}

function scheduleTask(id){
    var scheduleObj = {}

    scheduleObj["id"] = id;
    scheduleObj["name"] = document.getElementById("scheduleNameInput").value;
    var scheduleType = document.getElementById("scheduleTypeSelect").value;
    scheduleObj["type"] = scheduleType;
    scheduleObj["deviceID"] = document.getElementById("deviceSelect").value;

    var scheduleData = {}
    if(scheduleType == "Future"){
        scheduleData["date"] = document.getElementById("futureDateInput").value;
        scheduleData["time"] = document.getElementById("futureTimeInput").value;
    }
    if(scheduleType == "Recurring"){
        var days = []
        var ids = ["mondayCheckbox", "tuesdayCheckbox", "wednesdayCheckbox", "thursdayCheckbox", "fridayCheckbox", "saturdayCheckbox", "sundayCheckbox"]

        for(let x of ids){
            var element = document.getElementById(x);
            if(element.checked === true){
                days.push(element.value);
            }
        }
        scheduleData["days"] = days;
        scheduleData["time"] = document.getElementById("timeInput").value;
    }
    if(scheduleType == "Timer"){
        scheduleData["interval"] = document.getElementById("intervalInput").value;
    }
    scheduleObj["scheduleData"] = scheduleData;

    var varData = {};
    var scheduleVarHolder = document.getElementById("scheduleVarHolder");
    let index = 0;
    for(let varDiv of scheduleVarHolder.children){
        varData[index] = {}
        varData[index]["name"] = varDiv.id;
        for(let varElement of varDiv.children){
            if(varElement.nodeName === "INPUT"){
                varData[index]["value"] = varElement.value;
            }
        }
        
        index++;
    }
    scheduleObj["variables"] = varData;
    
    console.log(scheduleObj);

    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: `{"scheduleJSON": ${JSON.stringify(scheduleObj)}}`
      };

      fetch(baseURL + '/scheduleTask', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}