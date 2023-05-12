import Response from "../classes/Response";

export function checkIfValueInJson(jsonObj: any, value: string, res: any) : boolean{
    if(!(value in jsonObj) || jsonObj[value] === ""){
        res.status(400);
        var response: Response = {};
        response["message"] = `Malformed Request. No ${value} in req body`;
        res.send(response);
        return false;
    } else{
        return true;
    }
}

export function loggedIn(req: any, res: any, next: any) {
    console.log(req.user)
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

