var express = require('express');
var customerRouter = express.Router();
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');

customerRouter.post('/add', async (request, response) => {
  let customerExist = async () => {
    let rows = await (await Database.DB.query('SELECT * FROM customer')).rows;
    for (var i = 0; i < rows.length; i++) {
      // if (rows[i].pan === request.body.pan || rows[i].aadhaar === request.body.aadhaar || rows[i].mobile === request.body.mobile) return true;
      if (rows[i].mobile === request.body.mobile) return true;
    }
    return false;
  }

  try {
    let status = await database(Database.DB, request, response).INSERT('customer', await customerExist());

    if (status === 200) {
      response.status(200).send(new Response('Success', 200)).end();
    } else {
      response.status(200).send(new Response('Customer Already Existed', 302)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

customerRouter.get('/select', async function (request, response) {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('customer');
    response.status(200).send(new Response(await rows, 200)).end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});


customerRouter.get('/delete/:id', async (request, response) => {
  try {
    let rowCount = await database(Database.DB, request, response).SELECT('customer', 'id');

    if (rowCount) {
      response.status(200).send(new Response('Deleted Successfully', 200)).end();
    } else {
      response.status(200).send(new Response('Not Found', 404)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

customerRouter.post('/update', async (request, response) => {
  try {
    let rowCount = await database(Database.DB, request, response).UPDATE('customer', `mobile = '${request.body.mobile}'`);

    if (rowCount) {
      response.status(200).send(new Response("Update Success", 200)).end();
    } else {
      response.status(200).send(new Response('Not Found', 404)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

customerRouter.post('/search', async (request, response) => {
  try {
    let rows = await (await Database.DB.query(`SELECT * FROM customer`)).rows;

    for (var i = 0; i < rows.length; i++) {
      if (Number(request.body.query) === Number(rows[i].mobile) || Number(request.body.query) === Number(rows[i].aadhaar)) {
        response.status(200).send(new Response(rows[i], 200)).end();
        return;
      }
    }
    response.status(200).send(new Response("Customer not Found", 404)).end();
  } catch (e) {
    response.status(400).send(e.message);
  }
});

customerRouter.post('/transactions', async (request, response) => {
  try {
    var rows = await (await Database.DB.query(`SELECT * FROM customer`)).rows;

    let fetchAllTransactions = async (query) => {
      let tables = ['fixeddeposit_insurance_transaction', 'life_insurance_transaction', 'mutual_funds_transactions', 'general_insurance_transaction'];
      let transactions = [];
      var j = 0;

      do {
        for (var index = 0; index < rows.length; index++) {
          if (Number(query) === Number(rows[index].mobile)) {
            transactions.push(rows[index]);
          }
        }
        j++;
      } while (j < tables.length);

      return transactions;
    }

    for (var i = 0; i < rows.length; i++) {
      if (Number(request.body.query) === Number(rows[i].mobile)) {
        response.status(200).send(new Response({ ...rows[i], transactions: await fetchAllTransactions(request.body.query) }, 200)).end();
        return;
      }
    }

    response.status(200).send(new Response("Customer not Found", 404)).end();
  } catch (e) {
    response.status(400).send(e.message);
  }
});

module.exports = { customerRouter };
