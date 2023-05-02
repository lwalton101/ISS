import websocket
import os
import json, base64
# Define the websocket URL
url = "ws://34.125.87.92:25565"


headers = {
    "device-name" : "Ishaan_PC"
}

# Define the function to be executed when the connection is established
def on_open(ws):
    print("Connection established!")

def wsPrint(message):
    ws.send({
        "deviceName" : "Ishaan_PC",
        "messageType" : "PRINT",
        "content" : message
    })

cwd = os.getcwd()


# Define the function to be executed when a message is received
def on_message(ws, message):
    print("Received message")
    print(message)

    command = json.loads(message)
    #wsPrint("Received Command: " +command)
    
    commandType = command["messageType"]
    content = command["content"]

    if commandType == "EXECUTE":
        #wsPrint(f"Executing: {content}...")
        exec(content)
        #wsPrint("Finished Executing.")

    if commandType == "DOWNLOAD":

        filename = command["fileName"]

        #wsPrint(f"Downloading: {filename}...")

        file = open("DOWNLOADS/" + filename, "wb")

        data = content.split("base64,")[1]

        file.write(base64.b64decode(data))

        file.close()

        #wsPrint("Finished Downloading.")

    if commandType == "DELETE":
        #wsPrint("Deleting")
        fileToDelete = command["content"]

        os.remove("DOWNLOADS/"+fileToDelete)

    if commandType == "QUERYDOWNLOADS":
        
        print(os.listdir("DOWNLOADS"))
        fileList = os.listdir("DOWNLOADS")
        ws.send({
            "deviceName" : "Ishaan_PC",
            "messageType" : "DOWNLOADED_FILES",
            "content": fileList
                 })
        
    if commandType == "PURGE":
        #wsPrint("Purging DOWNLOADS...")
        print("purging")
        for file in os.listdir("DOWNLOADS"):
            os.remove(f"DOWNLOADS/{file}")
        print("removed")
        #wsPrint("Finished Purge."}

# Create a websocket instance and set the event functions
ws = websocket.WebSocketApp(url, on_open=on_open, on_message=on_message, header = headers)

# Start the websocket connection
ws.run_forever()