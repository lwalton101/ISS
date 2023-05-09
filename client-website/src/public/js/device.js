let paramsString = document.location.search
let searchParams = new URLSearchParams(paramsString);

var baseURL = location.protocol + "//" + location.hostname + ":8080"

const options = {method: 'GET', headers: {'Device-ID': searchParams.get("deviceName")}};


fetch(baseURL + '/device', options)
  .then(response => response.json())
  .then(response => {
    console.log(response)
    if(searchParams.has("deviceName")){
      document.getElementById("deviceName").textContents = searchParams.get("deviceName")
    }
        var terminal = document.getElementById("terminal");
        var fileHolder = document.getElementById("fileHolder");
        for(let line of response["data"]["debugLines"]){
            var entry = document.createElement("p");
            entry.textContent = line;
            terminal.appendChild(entry);
        }

        for(let line of response["data"]["fileNames"]){
          var entry = document.createElement("li");
          entry.textContent = line;
          entry.id = line;
          fileHolder.appendChild(entry);

          var deleteButton = document.createElement("button")
          deleteButton.textContent = "delete"
          deleteButton.id = line + "DELETE"

          deleteButton.onclick = function(ev){
            console.log(ev.target.id.substring(0, ev.target.id.length - 6))
            const options = {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({"deviceName":searchParams.get("deviceName"),"fileName": ev.target.id.substring(0, ev.target.id.length - 6)})
            };
            
            fetch(baseURL + '/deleteFile', options)
              .then(response => response.json())
              .then(response => {
                document.getElementById(ev.target.id.substring(0, ev.target.id.length - 6)).remove()
                ev.target.remove()
              
              })
              .catch(err => console.error(err));
          }

          fileHolder.appendChild(deleteButton);
      }
  })
  .catch(err => console.error(err));