var express = require('express');
var designationRouter = express.Router();
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');

designationRouter.post('/add', async (request, response) => {
  let designationExist = async () => {
    let rows = await (await Database.DB.query('SELECT * FROM designation')).rows;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].designation === request.body.designation) return true;
    }
    return false;
  }

  try {
    let status = await database(Database.DB, request, response).INSERT('designation', await designationExist());

    let rows = await (await Database.DB.query('SELECT * FROM designation')).rows;

    if (status === 200) {
      response.status(200).send(new Response(rows, 200)).end();
    } else {
      response.status(200).send(new Response('Branch Already Existed', 302)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

designationRouter.get('/all', async function (request, response) {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('designation');
    response.status(200).send(new Response(await rows, 200)).end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});

designationRouter.get('/delete/:id', async (request, response) => {
  try {
    let rowCount = await database(Database.DB, request, response).DELETE('designation', `id`);
    let rows = await (await Database.DB.query('SELECT * FROM designation')).rows;

    if (rowCount) {
      response.status(200).send(new Response(rows, 200)).end();
    } else {
      response.status(404).send('Not Found').end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

module.exports = { designationRouter };