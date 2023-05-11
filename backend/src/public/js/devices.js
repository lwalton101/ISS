var baseURL = location.protocol + "//" + location.hostname + ":8080/api"

const options = {method: 'GET'};

fetch(baseURL + '/devices', options)
  .then(response => response.json())
  .then(response => {
        var deviceHolder = document.getElementById("deviceHolder");
        var victimArr = response["data"]

        for(let victimIndex in victimArr){
            victimObj = JSON.parse(victimArr[victimIndex])
            console.log(victimObj["devName"])

            var victimName = document.createElement("li");
            victimName.id = victimObj["devName"];
            victimName.textContent = victimObj["devName"];

            var viewButton = document.createElement("button")
            viewButton.id = victimObj["devName"] + "view";
            viewButton.textContent = "View";
            viewButton.onclick = function(ev){
                document.location = location.protocol + "//" + location.host + "/device?deviceName=" + victimObj["devName"]
            }

            deviceHolder.appendChild(victimName);
            deviceHolder.appendChild(viewButton);
        }
  })
  .catch(err => console.error(err));