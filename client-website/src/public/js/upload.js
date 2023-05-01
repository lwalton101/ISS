var baseURL = location.protocol + "//" + location.hostname + ":8080"

function sendUpload(){
    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];

    var fileReader = new FileReader();

    fileReader.addEventListener("loadend", (ev) => {
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: `{"fileName":"${file.name}","fileContents":"${ev.target.result}"}`
        };

        console.log(options);

        fetch(baseURL + '/uploadFile', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
    })

    fileReader.readAsDataURL(file);

    
}