var baseURL = location.protocol + "//" + location.hostname + ":8080"

function sendUpload(){
    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];
    var deviceSelector = document.getElementById("deviceSelector");
    var fileReader = new FileReader();

    fileReader.addEventListener("loadend", (ev) => {
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "fileName" : file.name,
                "fileContents" : ev.target.result,
                "deviceName": deviceSelector.value

            })
        };

        console.log(options);

        fetch(baseURL + '/uploadFile', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
    })

    fileReader.readAsDataURL(file);

    
}

const options = {method: 'GET'};

fetch(baseURL + '/devices', options)
  .then(response => response.json())
  .then(response => {
    var deviceSelector = document.getElementById("deviceSelector");
    for(let device of response["data"]){
        var option = document.createElement("option");
        device = JSON.parse(device);
        console.log(device["devName"]);
        option.value = device["devName"];
        option.text = device["devName"];

        deviceSelector.appendChild(option);
    }
  })
  .catch(err => console.error(err));