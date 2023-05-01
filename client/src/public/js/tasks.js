
var modal = document.getElementById("runModal");
updateTasks();
updateScheduledTasks();
function updateTasks(){
    const options = {method: 'GET'};

    fetch('http://localhost:8080/getTasks', options)
    .then(response => response.json())
    .then(response => {
        var taskHolder = document.getElementById("taskHolder");
        while(taskHolder.firstChild){
            taskHolder.removeChild(taskHolder.firstChild);
        }
        tasks = response["data"]["tasks"]
  
        for(let x in tasks){
          var listItem = document.createElement("li");
          listItem.innerText = tasks[x]["name"];
          listItem.id = x;
  
          var runButton = document.createElement("button");
          runButton.id = x + "run";
          runButton.textContent = "RUN";

          runButton.onclick = function(){
            modal.style.display = "block";

            var modalHeader = document.getElementById("modalHeader")
            modalHeader.textContent = `Schedule task "${tasks[x]["name"]}"`
            updateScheduleOptions();
            updateVarDisplay(x);
            updateDevices();
          }
  
          var editButton = document.createElement("button");
          editButton.id = x + "edit";
          editButton.textContent = "EDIT";

          editButton.onclick = function(){
            console.log(location.host + "/editTask?taskName=" + x)
            document.location = location.protocol + "//" + location.host + "/editTask?taskName=" + x
          }
  
          var deleteButton = document.createElement("button");
          deleteButton.id = x + "DELETE";
          deleteButton.textContent = "DELETE";
          deleteButton.onclick = function(){
              document.getElementById(x).remove();
              const options = {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: `{"taskID":"${x}"}`
                };
                
              fetch('http://localhost:8080/deleteTask', options)
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

    fetch('http://localhost:8080/getScheduledTasks', options)
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

                unscheduleButton.onclick = function(){
                    
                    const options = {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: `{"scheduleID":"${x}"}`
                      };
                      
                    fetch('http://localhost:8080/unscheduleTask', options)
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

    fetch('http://localhost:8080/createTask', options)
    .then(response => response.json())
    .then(response => updateTasks())
    .catch(err => console.error(err));
}

function updateDevices(){
    const options = {method: 'GET'};

    fetch('http://localhost:8080/devices', options)
    .then(response => response.json())
    .then(response => {
        for(let x of response["data"]){
            var deviceHolder = document.getElementById("deviceSelect");
            var select = document.createElement("option");
            select.value = x;
            select.textContent = x;
            deviceHolder.appendChild(select);
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
function updateScheduleOptions(){
    var futureDiv = document.getElementById("futureContent");
    var reccuringDiv = document.getElementById("reccuringContent");
    var timerDiv = document.getElementById("timerContent");

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

    fetch('http://localhost:8080/getTask', options)
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


function scheduleTask(){
    var scheduleObj = {}

    var id = document.getElementById("modalHeader").textContent.replace("\"", "").replace("Schedule task ", "")
    id = id.slice(0, -1);
    console.log(id);
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

      fetch('http://localhost:8080/scheduleTask', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}