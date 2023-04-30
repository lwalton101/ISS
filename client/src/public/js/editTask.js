let paramsString = document.location.search
let searchParams = new URLSearchParams(paramsString);

let fileContents = "";

if(searchParams.has("taskName")){
    var errorP = document.getElementById("error");
    errorP.remove();

    const options = {method: 'GET', headers: {'Task-ID': searchParams.get("taskName")}};

    fetch('http://localhost:8080/getTask', options)
    .then(response => response.json())
    .then(response => {
        if(response["message"] == "Task returned successfully"){
            var task = response["data"]["task"];
            
            var nameInput = document.getElementById("nameInput");
            nameInput.value = task["name"];

            var contentPreview = document.getElementById("codePreview");
            fileContents = task["content"];
            contentPreview.textContent = task["content"];

            var fileInput = document.getElementById("fileInput");
            fileInput.onchange = function(ev){
                var file = ev.target.files[0];
                var fileReader = new FileReader()

                fileReader.onload = function(pv){
                    contentPreview.innerText = pv.target.result;
                    console.log(pv.target.result);
                    fileContents = pv.target.result;
                }

                fileReader.readAsText(file);
            }

            for(let variable in task["variables"]){
                console.log(variable);
                
                addVariable(variable["name"], variable["type"]);
            }
        }
        
        
    })
    .catch(err => console.error(err));
    }

function addVariable(name = "", type = "INT"){
    var varHolder = document.getElementById("varHolder");
    var rootVar = document.createElement("li");

    var varName = document.createElement("input");
    varName.type = "text";
    varName.placeholder = "Enter Var Name: ";
    varName.value = name;
    rootVar.appendChild(varName);

    var typeInput = document.createElement("select");
    typeInput.id = "typeInput" + name;
    var options = ["INT", "STRING"]
    for(let x in options){
        var option = document.createElement("option");
        option.value = options[x];
        option.innerText = options[x];
        typeInput.appendChild(option);
    }

    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function(){
        rootVar.remove();
    }

    rootVar.appendChild(typeInput);
    rootVar.appendChild(deleteButton);
    varHolder.appendChild(rootVar);
}

function saveTask(){
    var taskObj = {};
    var options = ["INT", "STRING"]

    var nameInput = document.getElementById("nameInput");
    taskObj["name"] = nameInput.value;

    var contentPreview = document.getElementById("codePreview");
    taskObj["content"] = fileContents;

    var varHolder = document.getElementById("varHolder");

    var index = 0
    taskObj["variables"] = []
    for(const rootVar of varHolder.children){
        taskObj["variables"][index] = {}
        for(const kid of rootVar.children){
            

            if(kid.nodeName == "INPUT"){
                taskObj["variables"][index]["name"] = kid.value;
            }

            if(kid.nodeName == "SELECT"){
                taskObj["variables"][index]["type"] = options.indexOf(kid.value);
            }
        }
        index++;
    }
    console.log(JSON.stringify(taskObj));

    const options2 = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: `{\n	"taskID": "${nameInput.value}",\n	"taskJSON": ${JSON.stringify(taskObj)}\n}`
      };
      
      fetch('http://localhost:8080/editTask', options2)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

