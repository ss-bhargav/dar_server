const jwt = require('jsonwebtoken');
const { database, Response } = require('../Helper/helper');
// const { Response } = require('express');
require('dotenv').config();

function employeeAuthorization(request, response, next) {
    const token = request.headers.authorization;
    if(!token) return response.status(400).send("Access Denied");
    
    try {
        const verified = jwt.verify(token, process.env.SECRET_TOKEN);
        if(verified && request.url === '/select/employeeDetails' || request.url === '/graphs' || request.url === '/role'){
            request.body = verified;
            next();
        } else {
            next();
        } 
    } catch (error) {
        response.status(403).send("Invalid Credentials").end();
    }
}


function Autherization(request, response, next) {
    const token = request.headers.authorization;
    if(!token) return response.status(400).send("Access Denied");
    try {
        const verified = jwt.verify(token, process.env.SECRET_TOKEN);
        if(verified){
            next();
        } 
    } catch (error) {
        response.status(403).send("Invalid credentials");
    }
}

module.exports = { employeeAuthorization, Autherization };