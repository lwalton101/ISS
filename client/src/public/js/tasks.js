const options = {method: 'GET'};

fetch('http://localhost:8080/getTasks', options)
  .then(response => response.json())
  .then(response => {
    tasks = response["data"]["tasks"]

    for(let x in tasks){
        console.log(x);
        var taskHolder = document.getElementById("taskHolder");
        var listItem = document.createElement("li");
        listItem.innerText = x;
        listItem.id = x;

        var runButton = document.createElement("button");
        runButton.id = x + "run";
        runButton.textContent = "RUN";

        var editButton = document.createElement("button");
        editButton.id = x + "edit";
        editButton.textContent = "EDIT";

        var deleteButton = document.createElement("button");
        deleteButton.id = x + "DELETE";
        deleteButton.textContent = "DELETE";

        listItem.appendChild(runButton);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        
        taskHolder.appendChild(listItem);
    }

    
  })
  .catch(err => console.error(err));