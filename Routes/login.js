const login = require('express').Router();
require('dotenv').config();
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');
const jwt = require('jsonwebtoken');

login.post('/', async (request, response) => {
  console.log(request.body.employee_id, request.body.password);
  try {
    let data = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.employee_id} and password='${request.body.password}'`)).rows;
    if (data.length > 0) {
      // if (data.length === 0) {
      //   response.status(200).send(new Response('Not Found', 404)).end();
      // } else if (request.body.password !== data[0].password) {
      //   response.status(200).send(new Response('wrong password', 401)).end();
      // } else {
      //   const employeeId = { employee_id: data[0].employee_id };
      //   const token = jwt.sign(employeeId, process.env.SECRET_TOKEN);
      //   response.status(200).json({ token: token }).end();
      // }
      const employeeId = { employee_id: data[0].employee_id };
      const token = jwt.sign(employeeId, process.env.SECRET_TOKEN);
      response.status(200).send({ message: 'success', token: token }).end();
    } else {
      response.status(200).send({ message: 'invalid loginid' }).end();
    }
  } catch (e) {
    new Error(e);
    response.status(500).send(e.message).end();
  }
});

module.exports = { login };
