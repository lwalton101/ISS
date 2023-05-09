import websocket
import os
import json, base64, datetime, threading
# Define the websocket URL
url = "ws://localhost:25565"
deviceName = "Luke_PC"


if(not os.path.exists("DOWNLOADS")):
    os.mkdir("DOWNLOADS")

headers = {
    "device-name" : deviceName
}

# Define the function to be executed when the connection is established
def on_open(ws):
    print("Connection established!")
    wsPrint("Connected!")

def on_error(ws, error):
    print('Error during Websocket connection')
    print(error)
    wsPrint(str(error))

def wsPrint(message):
    ws.send(json.dumps({
        "deviceName" : deviceName,
        "messageType" : "PRINT",
        "content" : f"[{datetime.datetime.now()}] {message}"
    }))

def execute(content):
    exec(content)
    wsPrint("Finished Executing.")

cwd = os.getcwd()


# Define the function to be executed when a message is received
def on_message(ws, message):
    command = json.loads(message)
    
    #this is not a good idea coz it prints the base64 of an upload to the terminal and that is messy wsPrint(f"Received Command: {command}")
    
    commandType = command["messageType"]
    content = command["content"]

    print(f"Received message: {commandType}")

    if commandType == "EXECUTE":
        wsPrint(f"Executing: {command}...")
        thread = threading.Thread(target=lambda: execute(content))
        thread.start()

    if commandType == "DOWNLOAD":

        filename = command["fileName"]

        wsPrint(f"Downloading: {filename}...")

        file = open("DOWNLOADS/" + filename, "wb")

        data = content.split("base64,")[1]

        file.write(base64.b64decode(data))

        file.close()

        wsPrint("Finished Downloading.")

    if commandType == "DELETE":
       
        fileToDelete = command["content"]
        wsPrint("Deleting " + fileToDelete)

        os.remove("DOWNLOADS/"+fileToDelete)

    if commandType == "QUERYDOWNLOADS":
        
        print(os.listdir("DOWNLOADS"))
        fileList = os.listdir("DOWNLOADS")
        ws.send(json.dumps({
            "deviceName" : deviceName,
            "messageType" : "DOWNLOADED_FILES",
            "content": fileList
                 }))
        
    if commandType == "PURGE":
        #wsPrint("Purging DOWNLOADS...")
        print("purging")
        for file in os.listdir("DOWNLOADS"):
            os.remove(f"DOWNLOADS/{file}")
        print("removed")
        #wsPrint("Finished Purge."}

# Create a websocket instance and set the event functions
ws = websocket.WebSocketApp(url, on_open=on_open, on_message=on_message,on_error=on_error, header = headers)

# Start the websocket connection
ws.run_forever()