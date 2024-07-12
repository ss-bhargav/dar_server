const { request, response } = require("express");
var express = require("express");
var existingCustomer = express.Router();
const { Report } = require('../Helper/report');
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');



existingCustomer.post('/customerdetails', async (request, response) => {
    await new Report(request, response, 'customer').ExistingCustomer();
}); 

existingCustomer.post('/allcustomers', async (request, response) => {
    let today = new Date().toLocaleDateString();

    let Telecallers = [], TelecallersArray = [];
    let TeamLeads = [], TeamLeadsArray = [];
    let RelationshipManager = [], RelationshipManagerArray = [];
    let SeniorRelationshipManager = [], SeniorRelationshipManagerArray = [];
    let TotalEmployeesArray = [];
    let CustomersArray = [];
    let EmployeeData = [];


    let data = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.body.employee_id}'`);  
    let appointmentCustomerData = await (await Database.DB.query(`select * from customer where  appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    let callbackCustomerData = await (await Database.DB.query(`select * from customer where  callback_date > '${request.body.start_date}' AND callback_date < '${request.body.end_date}'`)).rows;
    let CustomerData = [...appointmentCustomerData, ...callbackCustomerData];
    
    switch (data[0].role) {
        
        case 'CEO':
        case 'NSM':
        case 'RSM':
            // returnData(CustomerData);
            response.send(CustomerData);
        break;

        case 'Zonal Manager':
            let ZonalCustomers = [];

            CustomerData.map((customer) => {
                if (customer.location === data[0].location) {
                    ZonalCustomers.push(customer);
                }
            })

            // returnData(ZonalCustomers)
            response.send(ZonalCustomers);
        break; 
            
            
        case 'Branch Manager':
            let branchCustomers = [];

            CustomerData.map((customer) => {
                if (customer.branch === data[0].branch) {
                    branchCustomers.push(customer);
                }
            })

            // returnData(branchCustomers)
            response.send(branchCustomers);
        break;
        

        case "Product Manager":
            SeniorRelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Senior Relationship Manager and higher_position = '${data[0].employee_id}''`)).rows
            RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager'`)).rows

            for(let i = 0; i < SeniorRelationshipManager.length; i++) {
                for(let j = 0; j < RelationshipManager.length; j++) {
                    if(SeniorRelationshipManager[i].employee_id === RelationshipManager[j].higher_position){
                        RelationshipManagerArray.push(RelationshipManager[j]);
                    }
                }
            }

            EmployeeData = [...SeniorRelationshipManager, ...RelationshipManager, ...data];

            for(const customer of CustomerData){
                for(const employee of EmployeeData){
                    if(customer.employee_id === employee.employee_id){
                        CustomersArray.push(customer);
                    }
                }
            }

            // returnData(CustomersArray)
            response.send(CustomersArray);
        break;

        case 'Sr. Relationship Manager':
            RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager' and higher_position = '${data[0].employee_id}'`)).rows
            EmployeeData = [...RelationshipManager, ...data];

            for(const customer of CustomerData){
                for(const employee of EmployeeData){
                    if(customer.employee_id === employee.employee_id){
                        CustomersArray.push(customer);
                    }
                }
            }

            // returnData(CustomersArray)
            response.send(CustomersArray);
        break;

        case 'Telesales Manager':
            let SeniorTeamLeads = await (await Database.DB.query(`select * from employees where role='Senior Team Leader' and higher_position = '${data[0].employee_id}'`)).rows;
            TeamLeads = await (await Database.DB.query(`select * from employees where role = 'PTL' OR role = 'BTL' OR role = 'HTL' OR role = 'ITL'`)).rows;
            Telecallers = await (await Database.DB.query(`select * from employees where role='Telecaller'`)).rows;
            
            for (const teamLead of TeamLeads) {
                for (const seniorTeamLead of SeniorTeamLeads) {
                    if (teamLead.higher_position === seniorTeamLead.employee_id) {
                        TeamLeadsArray.push(teamLead);
                    }
                }
            }

            for (const telecaller of Telecallers) {
                for (const teamLead of TeamLeadsArray) {
                    if (telecaller.higher_position === teamLead.employee_id) {
                        TelecallersArray.push(telecaller);
                    }
                }
            }

            TotalEmployeesArray = [...SeniorTeamLeads, ...TeamLeadsArray, ...TelecallersArray, ...data];

            for (const customer of CustomerData) {
                for (const employee of TotalEmployeesArray) {
                    if (customer.employee_id === employee.employee_id) {
                        CustomersArray.push(customer);
                    }
                }
            }

            // returnData(CustomersArray)
            response.send(CustomersArray);
        break;

        case 'Senior Team Lead':
            TeamLeads = await (await Database.DB.query(`select * from employees where role = 'PTL' OR role = 'BTL' OR role = 'HTL' OR role = 'ITL' AND higher_position = '${request.params.id}'`)).rows
            Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller'`)).rows;
            
    
            for(const telecaller of Telecallers){
                for(const TeamLead of TeamLeads){
                    if(telecaller.higher_position === TeamLead.employee_id){
                        TelecallersArray.push(telecaller);
                    }
                }            
            }

            TotalEmployeesArray = [ ...TeamLeads, ...TelecallersArray, ...data];
            
            for (const customer of CustomerData) {
                for (const employee of TotalEmployeesArray) {
                    if (customer.employee_id === employee.employee_id) {
                        CustomersArray.push(customer);
                    }
                }
            }
            
            // returnData(CustomersArray)
            response.send(CustomersArray);
        break;

        case "PTL":
        case "BTL":
        case "HTL":
        case "ITL":
            Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller' and higher_position = ${data[0].employee_id}`)).rows;    
            TotalEmployeesArray = [...Telecallers, ...data];
            for (const customer of CustomerData) {
                for (const employee of TotalEmployeesArray) {
                    if (customer.employee_id === employee.employee_id) {
                        CustomersArray.push(customer);
                    }
                }
            }
    
            // returnData(CustomersArray)
            response.send(CustomersArray);
        break;

        case 'Telecaller':
        case 'Relationship Manager':
            CustomerData.map((customer) => {
                if(customer.employee_id === data[0].employee_id){
                    CustomersArray.push(customer);
                }
            })
            
            // returnData(CustomersArray);
            response.send(CustomersArray);
        break;

        default:
        break;
    }
});

module.exports = {existingCustomer};