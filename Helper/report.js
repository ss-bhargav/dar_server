const DataBase = require('./database');
const Database = require('./database');

class Report {
  constructor (request, response, table) {
    this.req = request;
    this.res = response;
    this.table = table; 
  }

  async fetchRM() {
    let rows = await (await Database.DB.query('SELECT employee_id, role, location, branch, region, firstname, lastname FROM add_employee')).rows;

    let array = rows.filter(item => {
      return item.role === "Relationship Manager" || item.role === "Sr.Relationship Manager";
    });

    this.res.send(array);
  }

  async filterCust() {
    let customerRows = await (await Database.DB.query(`SELECT mobile, aadhaar, firstname, lastname, branch, location FROM customer`)).rows;
    let arr = [];

    for (var i = 0; i < customerRows.length; i++) {
      if (customerRows[i].location === this.req.body.location || customerRows[i].branch === this.req.body.branch) {
        arr.push({
          mobile: customerRows[i].mobile,
          aadhaar: customerRows[i].aadhaar,
          firstname: customerRows[i].firstname,
          lastname: customerRows[i].lastname,
          branch: customerRows[i].branch
        });
      }
    }

    return arr;
  }

  async fetchTransactions() {
    let startDate = this.req.body.start_date;
    let endDate = this.req.body.end_date;
    let transactions = [];

    // Fetches all Transactions between start date and end date in given Transactions Table
    let rows = await (await Database.DB.query(`SELECT * FROM ${this.table} WHERE entry_date >= '${startDate}' AND entry_date <= '${endDate}' `)).rows;
    let x = await this.filterCust();
    let len = await (x).length

    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < len; j++) {
        if (rows[i].mobile === x[j].mobile || rows[i].aadhaar === x[j].aadhaar) {
          transactions.push({ ...x[j], ...rows[i] });
        }
      }
    }

    this.res.send(transactions);

  }

  async Customer() {
    let startDate = this.req.body.start_date;
    let endDate = this.req.body.end_date;
    let query = this.req.body.query;
    let transactions = [];

    // Fetches all Transactions between start date and end date in given Transactions Table
    let rows = await (await Database.DB.query(`SELECT * FROM ${this.table} WHERE entry_date >= '${startDate}' AND entry_date <= '${endDate}' `)).rows;

    // Fetches all Customer Details from 'customer' table
    let customerRows = await (await Database.DB.query(`SELECT mobile, aadhaar, firstname, lastname, branch, location FROM customer`)).rows;

    const filteredTransactions = () => {
      let array = rows.filter(transaction => {
        return transaction.mobile === query || transaction.aadhaar === query;
      });

      return array;
    }

    const filterCustomer = () => {
      let array = customerRows.filter(customer => {
        return customer.mobile === query || customer.aadhaar === query;
      });

      return array[0];
    }

    filteredTransactions().forEach(transaction => {
      transactions.push({ ...filterCustomer(), ...transaction });
    })

    this.res.send(transactions);
  }


  async ReportCustomer() {
        let startDate = this.req.body.start_date;
        let endDate = this.req.body.end_date;
        let id = this.req.body.id;
        let tableName = this.table;
        let filteredData = [];

        let rows = await ( await Database.DB.query("select * from $1 where entry_date >= $2 and entry_date <= $3",[tableName, startDate, endDate])).rows;

        await rows.filter( data => {
            if( data.id === id ){
              filteredData.push(data);
            }
        })

        this.res.send(filteredData);
 }

 async ExistingCustomer(){
      let mobile = this.req.body.mobile;
      let tableName = this.table;
      let rows = await ( await DataBase.DB.query(`select * from ${tableName} where mobile = ${mobile}`)).rows;

      this.res.send(rows);
 }

}

module.exports = { Report }
