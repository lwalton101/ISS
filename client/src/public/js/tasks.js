

updateTasks();

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
function createTask(){
    const options = {method: 'POST'};

    fetch('http://localhost:8080/createTask', options)
    .then(response => response.json())
    .then(response => updateTasks())
    .catch(err => console.error(err));
}