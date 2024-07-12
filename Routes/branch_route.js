var express = require('express');
var branchRouter = express.Router();
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');

branchRouter.post('/add', async (request, response) => {
  let branchExist = async () => {
    let rows = await (await Database.DB.query('SELECT * FROM branch')).rows;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].location === request.body.location && rows[i].branch === request.body.branch) return true;
    }
    return false;
  }

  try {
    let status = await database(Database.DB, request, response).INSERT('branch', await branchExist());

    if (status === 200) {
      let rows = await (await Database.DB.query('SELECT * FROM branch')).rows;
      response.status(200).send(new Response(rows, 200)).end();
    } else {
      response.status(200).send(new Response('Branch Already Existed', 302)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

branchRouter.get('/all', async function (request, response) {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('branch');
    response.status(200).send(new Response(await rows, 200)).end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});

branchRouter.get('/delete/:id', async (request, response) => {
  try {
    let rowCount = await database(Database.DB, request, response).DELETE('branch', `id`);
    let rows = await (await Database.DB.query('SELECT * FROM branch')).rows;

    if (rowCount) {
      response.status(200).send(new Response(rows, 200)).end();
    } else {
      response.status(200).send(new Response('Not Found', 404)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

module.exports = { branchRouter };