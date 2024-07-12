const express = require("express");
const App = express();
const path = require('path');
const Database = require('./Helper/database');
const cors = require('cors');
const { router } = require('./Routes/employee_routes');
const { branchRouter } = require('./Routes/branch_route');
const { designationRouter } = require('./Routes/designation_route');
const { customerRouter } = require('./Routes/customer_route');
const { existingCustomer } = require('./Routes/existing_customer');
const { reportsRouter } = require('./Routes/reports_router');
const { branchReports } = require('./Routes/branch_reports');
const { login } = require('./Routes/login');
const { employeeAuthorization, Autherization } = require('./Routes/Auth');

const client = Database.DB;

Database.Connect();

App.use(express.json());
App.use(cors());
App.use('/api/login', login);
App.use('/api/customer', Autherization, customerRouter)
App.use('/api/employee', employeeAuthorization, router);
App.use('/api/branch', Autherization, branchRouter);
App.use('/api/designation', Autherization, designationRouter);
App.use('/api/reports', Autherization, reportsRouter);
App.use('/api/branchreports', Autherization, branchReports)
App.use('/api/existingcustomer', Autherization, existingCustomer);



 


// App.use(express.static('public'));
App.use(express.static(path.join(__dirname, 'public')));

App.listen(process.env.PORT || 1997, function () {
  console.log(`Application listening on ${process.env.PORT || 1997}`);
});
// App.listen(process.env.PORT || 1996);

App.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = client;