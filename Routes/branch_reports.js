const { response } = require("express");

const express = require("express");

var branchReports = express.Router();
const Database = require('../Helper/database');


branchReports.post('/appointments' ,async (request, response)=>{

    const customers = [];

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    let employeesArray  = await (await Database.DB.query(`select * from employees`)).rows

    for(const customer of customersArray){
        if(customer.location === request.body.location && customer.branch === request.body.branch && customer.status === 'Appointment'){
            for(const employee of employeesArray){
                if(customer.employee_id === employee.employee_id){
                    customers.push({...employee, ...customer })
                }
            }
        }
    }

    response.send(customers)
});

branchReports.post('/callbacks' ,async (request, response)=>{

    const customers = [];

    let customersArray = await (await Database.DB.query(`select * from customer where callback_date > '${request.body.start_date}' AND callback_date < '${request.body.end_date}'`)).rows;
    let employeesArray  = await (await Database.DB.query(`select * from employees`)).rows

    for(const customer of customersArray){
        if(customer.location === request.body.location && customer.branch === request.body.branch && customer.status === 'Callback'){
            for(const employee of employeesArray){
                if(customer.employee_id === employee.employee_id){
                    customers.push({...employee, ...customer })
                }
            }
        }
    }

    response.send(customers)
});


branchReports.post('/closers' ,async (request, response)=>{

    const customers = [];

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    let employeesArray  = await (await Database.DB.query(`select * from employees`)).rows

    for(const customer of customersArray){
        if(customer.location === request.body.location && customer.branch === request.body.branch && customer.status === 'Closer'){
            for(const employee of employeesArray){
                if(customer.employee_id === employee.employee_id){
                    customers.push({...employee, ...customer })
                }
            }
        }
    }

    response.send(customers)
});

branchReports.post('/rejects' ,async (request, response)=>{

    const customers = [];

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    let employeesArray  = await (await Database.DB.query(`select * from employees`)).rows

    for(const customer of customersArray){
        if(customer.location === request.body.location && customer.branch === request.body.branch && customer.status === 'Reject'){
            for(const employee of employeesArray){
                if(customer.employee_id === employee.employee_id){
                    customers.push({...employee, ...customer })
                }
            }
        }
    }
    response.send(customers)
});









module.exports = {branchReports}