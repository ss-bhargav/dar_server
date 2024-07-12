const express = require('express');
var reportsRouter = express.Router();
const Database = require('../Helper/database');
const {
    database,
    Response
} = require('../Helper/helper');
const {
    Report
} = require('../Helper/report');

reportsRouter.post("/appointments", async (request, response) => {

    const customers = [];
    const AppointmentsArray = [];

    const employeeBranch = async () => {
        let rows = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.id}`)).rows;
        return rows[0];
    }

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    // let customersArray = await( await (await Database.DB.query("select * from customer where status = 'Appointment'")).rows)

    const x = await employeeBranch();
    for (var i = 0; i < customersArray.length; i++) {
        if (customersArray[i].employee_id === x.employee_id) {
            customers.push({
                ...x,
                ...customersArray[i],
            });
        }
    }

    for (var i = 0; i < customers.length; i++) {
        if (customers[i].status === 'Appointment') {
            AppointmentsArray.push(customers[i]);
        }
    }

    response.send(AppointmentsArray);

});

reportsRouter.post("/callbacks", async (request, response) => {

    const customers = [];
    const CallbacksArray = [];

    const employeeBranch = async () => {
        let rows = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.id}`)).rows;
        return rows[0];
    }

    let customersArray = await (await Database.DB.query(`select * from customer where callback_date > '${request.body.start_date}' AND callback_date < '${request.body.end_date}'`)).rows;
    // let customersArray = await( await (await Database.DB.query("select * from customer where status = 'Appointment'")).rows)

    const x = await employeeBranch();
    for (var i = 0; i < customersArray.length; i++) {
        if (customersArray[i].employee_id === x.employee_id) {
            customers.push({
                ...x,
                ...customersArray[i],
            });
        }
    }

    for (var i = 0; i < customers.length; i++) {
        if (customers[i].status === 'Callback') {
            CallbacksArray.push(customers[i]);
        }
    }

    response.send(CallbacksArray);

});

reportsRouter.post("/rejects", async (request, response) => {

    const customers = [];
    const RejectsArray = [];

    const employeeBranch = async () => {
        let rows = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.id}`)).rows;
        return rows[0];
    }

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    // let customersArray = await( await (await Database.DB.query("select * from customer where status = 'Appointment'")).rows)

    const x = await employeeBranch();
    for (var i = 0; i < customersArray.length; i++) {
        if (customersArray[i].employee_id === x.employee_id) {
            customers.push({
                ...x,
                ...customersArray[i],
            });
        }
    }

    for (var i = 0; i < customers.length; i++) {
        if (customers[i].status === 'Reject') {
            RejectsArray.push(customers[i]);
        }
    }

    response.send(RejectsArray);

});

reportsRouter.post("/closers", async (request, response) => {

    const customers = [];
    const RejectsArray = [];

    const employeeBranch = async () => {
        let rows = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.id}`)).rows;
        return rows[0];
    }

    let customersArray = await (await Database.DB.query(`select * from customer where appointment_date > '${request.body.start_date}' AND appointment_date < '${request.body.end_date}'`)).rows;
    // let customersArray = await( await (await Database.DB.query("select * from customer where status = 'Appointment'")).rows)

    const x = await employeeBranch();
    for (var i = 0; i < customersArray.length; i++) {
        if (customersArray[i].employee_id === x.employee_id) {
            customers.push({
                ...x,
                ...customersArray[i],
            });
        }
    }

    for (var i = 0; i < customers.length; i++) {
        if (customers[i].status === 'Closer') {
            RejectsArray.push(customers[i]);
        }
    }

    response.send(RejectsArray);

});

reportsRouter.get("/graphs/:id", async (request, response) => {
    let CustomerData = [];
    let today = new Date().toLocaleDateString();
    let Appointments = [], Callbacks = [], Closers = [], Rejects = [];
    let Telecallers = [], TelecallersArray = [];
    let TeamLeads = [], TeamLeadsArray = [];
    let RelationshipManager = [], TotalEmployeesArray = [];
    let CustomersArray = [];
    let EmployeeData = [];


    let responseData = {
        appointments: Appointments,
        callbacks: Callbacks,
        closers: Closers,
        rejects: Rejects
    };
    let employeeData = await (await Database.DB.query(`select * from employees`)).rows
    let data = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.params.id}'`);

    const returnData = (CustomerData) => {
        for (let customer of CustomerData) {
            for (let employee of employeeData) {
                if (employee.employee_id == customer.employee_id) {
                    switch (customer.status) {
                        case 'Appointment':
                            Appointments.push({
                                ...employee,
                                ...customer
                            });
                            break;
                        case 'Callback':
                            Callbacks.push({
                                ...employee,
                                ...customer
                            });
                            break;
                        case 'Closer':
                            Closers.push({
                                ...employee,
                                ...customer
                            });
                            break;
                        case 'Reject':
                            Rejects.push({
                                ...employee,
                                ...customer
                            });
                            break;

                        default:
                            break;
                    }
                }
            }
        }
    }

    switch (data[0].role) {
        
        case 'CEO':
        case 'NSM':
        case 'RSM':
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;
            returnData(CustomerData)
        break;

        case 'Zonal Manager':
            let ZonalCustomers = [];
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;

            CustomerData.map((customer) => {
                if (customer.location === data[0].location) {
                    ZonalCustomers.push(customer);
                }
            })

            returnData(ZonalCustomers)
        break; 
            
            
        case 'Branch Manager':
        case 'Assistant Manager':
            let branchCustomers = [];
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;

            CustomerData.map((customer) => {
                if (customer.branch === data[0].branch) {
                    branchCustomers.push(customer);
                }
            })

            returnData(branchCustomers)
        break;

        case 'Sr. Relationship Manager':
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;
            RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager' and higher_position = '${data[0].employee_id}'`)).rows
            EmployeeData = [...RelationshipManager, ...data];

            for(const customer of CustomerData){
                for(const employee of EmployeeData){
                    if(customer.employee_id === employee.employee_id){
                        CustomersArray.push(customer);
                    }
                }
            }

            returnData(CustomersArray)
        break;

        case 'Telesales Manager':
            let SeniorTeamLeads = await (await Database.DB.query(`select * from employees where role='Senior Team Leader' and higher_position = '${data[0].employee_id}'`)).rows;
            TeamLeads = await (await Database.DB.query(`select * from employees where role='Team Lead'`)).rows;
            Telecallers = await (await Database.DB.query(`select * from employees where role='Telecaller'`)).rows;
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;
            
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

            returnData(CustomersArray)
        break;

        case 'Senior Team Lead':
            TeamLeads = await (await Database.DB.query(`select * from employees where role = 'Team Lead' and higher_position = '${request.params.id}'`)).rows
            Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller'`)).rows;
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;
            
    
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
            
            returnData(CustomersArray)
        break;

        case "Team Lead":
            Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller' and higher_position = ${data[0].employee_id}`)).rows;    
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;         
            TotalEmployeesArray = [...Telecallers, ...data];
            for (const customer of CustomerData) {
                for (const employee of TotalEmployeesArray) {
                    if (customer.employee_id === employee.employee_id) {
                        CustomersArray.push(customer);
                    }
                }
            }
    
            returnData(CustomersArray)
        break;

        case 'Telecaller':
        case 'Relationship Manager':
            CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;

            CustomerData.map((customer) => {
                if(customer.employee_id === data[0].employee_id){
                    CustomersArray.push(customer);
                }
            })
            
            returnData(CustomersArray);
        break;

        default:
        break;
    }

    response.send(responseData)
});



module.exports = {
    reportsRouter
}