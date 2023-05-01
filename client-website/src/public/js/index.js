var button = document.getElementById("testButton")

button.onclick = function(){
    const options = {method: 'GET'};
    console.log(`http://${location.hostname}:8080/online`)
    fetch(`http://${location.hostname}:8080/online`, options)
    .then(response => console.log(response))
    .catch(err => console.error(err));
}