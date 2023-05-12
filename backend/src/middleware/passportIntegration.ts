import * as core from 'express-serve-static-core';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Config from '../classes/Config';

var config: Config = require("../config.json");


export function initPassport(app: core.Express){
    passport.use(new LocalStrategy(function(username, password, cb){
        console.log(config.password === password && username === config.username)
        if(password === config.password && username === config.username){
            return cb(null, {"role": "father"});
        } else{
            return cb(null, false, {message: "Incorrect credentials"});
        }
    }));


    passport.serializeUser(function(user, cb) {
        process.nextTick(function() {
          cb(null, {"role": "father"});
        });
      });
      
      passport.deserializeUser(function(user, cb) {
        process.nextTick(function() {
          return cb(null, {"role": "father"});
        });
      });
}