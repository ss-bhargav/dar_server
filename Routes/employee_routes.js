// @ts-check
var router = require('express').Router();
const { database, Response } = require('../Helper/helper');
const Database = require('../Helper/database');

router.post('/add', async (request, response) => {
  let employeeExist = async () => {
    let rows = await (await Database.DB.query('SELECT employee_id FROM employees')).rows;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].employee_id === request.body.employee_id) return true;
    }
    return false;
  };

  try {
    let status = await database(Database.DB, request, response).INSERT('employees', await employeeExist());

    if (status === 200) {
      response.status(200).send(new Response('Success', 200)).end();
    } else {
      response.status(200).send(new Response('Employee Already Existed', 302)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

router.get('/select', async function (request, response) {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('employees');
    response
      .status(200)
      .send(new Response(await rows, 200))
      .end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});

// router.get('/select/:id', async (request, response) => {
//   var rows;
//   try {
//     rows = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.params.id}'`);
//     response.status(200).send(new Response(await rows, 200)).end();
//   } catch (e) {
//     response.status(400).send(e).end();
//   }
// });

router.get('/select/employeeDetails', async (request, response) => {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.body.employee_id}'`);
    response
      .status(200)
      .send(new Response(await rows, 200))
      .end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});

router.get('/select/employeeDetail/:id', async (request, response) => {
  var rows;
  try {
    rows = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.params.id}'`);
    response
      .status(200)
      .send(new Response(await rows, 200))
      .end();
  } catch (e) {
    response.status(400).send(e).end();
  }
});

router.get('/delete/:id', async (request, response) => {
  try {
    let rowCount = await database(Database.DB, request, response).DELETE('employees', 'employee_id');

    if (rowCount) {
      response.status(200).send(new Response('Deleted Successfully', 200)).end();
    } else {
      response.status(200).send(new Response('Not Found', 404)).end();
    }
  } catch (e) {
    response.status(400).send(e).end();
  }
});

router.post('/update', async (request, response) => {
  // try {
  let rowCount = await database(Database.DB, request, response).UPDATE('employees', `employee_id = ${request.body.employee_id}`);
  if (rowCount) {
    response.status(200).send(new Response(rowCount[0], 200)).end();
  } else {
    response.status(200).send(new Response('Not Found', 404)).end();
  }
  // } catch (e) {
  //   response.status(400).send(e).end();
  // }
});

router.get('/role', async (request, response) => {
  let EmployeeData = [];
  let TeamLeads = [],
    TeamLeadsArray = [];
  let SeniorTeamLeads = [],
    SeniorTeamLeadsArray = [];
  let SeniorRelationshipManager = [];
  let Telecallers = [],
    TelecallersArray = [];
  let RelationshipManager = [],
    RelationshipManagerArray = [];

  let data = await database(Database.DB, request, response).SELECT('employees', `employee_id = '${request.body.employee_id}'`);

  switch (data[0].role) {
    case 'CEO':
    case 'NSM':
    case 'RSM':
      EmployeeData = await (await Database.DB.query('select * from employees')).rows;
      break;

    case 'Zonal Manager':
      EmployeeData = await (await Database.DB.query(`select * from employees where location = '${data[0].location}' and role != 'CEO' and role != 'RSM' and role != 'NSM' `)).rows;
      break;

    case 'Branch Manager':
      EmployeeData = await (await Database.DB.query(`select * from employees where branch = '${data[0].branch}' and role != 'Zonal Manager' and role != 'CEO' and role != 'RSM' and role != 'NSM'`)).rows;
      break;

    case 'Product Manager':
      SeniorRelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Senior Relationship Manager AND higher_position = '${data[0].employee_id}''`)).rows;
      RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager'`)).rows;

      for (let i = 0; i < SeniorRelationshipManager.length; i++) {
        for (let j = 0; j < RelationshipManager.length; j++) {
          if (SeniorRelationshipManager[i].employee_id === RelationshipManager[j].higher_position) {
            RelationshipManagerArray.push(RelationshipManager[j]);
          }
        }
      }

      EmployeeData = [...SeniorRelationshipManager, ...RelationshipManager, ...data];
      break;

    case 'Sr. Relationship Manager':
      RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager' AND higher_position = '${data[0].employee_id}'`)).rows;
      EmployeeData = [...RelationshipManager, ...data];
      break;

    case 'Relationship Manager':
      EmployeeData = data;
      break;

    case 'Telesales Manager':
      SeniorTeamLeads = await (await Database.DB.query(`select * from employees where role='Senior Team Lead' and higher_position = '${data[0].employee_id}'`)).rows;
      TeamLeads = await (await Database.DB.query(`select * from employees where role = 'PTL' OR role = 'BTL' OR role = 'HTL' OR  role = 'ITL'`)).rows;
      Telecallers = await (await Database.DB.query(`select * from employees where role='Telecaller'`)).rows;

      for (const TeamLead of TeamLeads) {
        for (const SeniorTeamLead of SeniorTeamLeads) {
          if (TeamLead.higher_position === SeniorTeamLead.employee_id) {
            TeamLeadsArray.push(TeamLead);
          }
        }
      }

      for (const Telecaller of Telecallers) {
        for (const TeamLead of TeamLeadsArray) {
          if (Telecaller.higher_position === TeamLead.employee_id) {
            TelecallersArray.push(Telecaller);
          }
        }
      }

      EmployeeData = [...TelecallersArray, ...TeamLeadsArray, ...SeniorTeamLeads, ...data];
      break;

    case 'Senior Team Lead':
      TeamLeads = await (await Database.DB.query(`select * from employees where role = 'PTL' OR role = 'BTL' OR role = 'HTL' OR  role = 'ITL' AND higher_position = '${request.body.employee_id}'`)).rows;
      Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller'`)).rows;

      for (const telecaller of Telecallers) {
        for (const TeamLead of TeamLeads) {
          if (telecaller.higher_position === TeamLead.employee_id) {
            TelecallersArray.push(telecaller);
          }
        }
      }

      EmployeeData = [...TeamLeads, ...TelecallersArray, ...data];
      break;

    case 'PTL':
    case 'BTL':
    case 'HTL':
    case 'ITL':
      Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller' AND higher_position = '${request.body.employee_id}'`)).rows;
      EmployeeData = [...data, ...Telecallers];
      break;

    case 'Telecaller':
      EmployeeData = data;
      break;

    default:
      break;
  }

  response.send(EmployeeData);
});

router.get('/graphs', async (request, response) => {
  let dateFormat = (date) => {
    let [month, day, year] = date.split('/'); // 07-14-2021  ///// yyyy-mm-dd

    if (Number(month) > 12) {
      return `${year}-${day}-${month}`;
    }

    return `${year}-${month}-${day}`;
  };
  let today = dateFormat(new Date().toLocaleDateString());

  let Appointments = [],
    Callbacks = [],
    Closers = [],
    Rejects = [];

  let Telecallers = [],
    TelecallersArray = [];
  let TeamLeads = [],
    TeamLeadsArray = [];
  let RelationshipManager = [],
    RelationshipManagerArray = [];
  let SeniorRelationshipManager = [];
  let TotalEmployeesArray = [];
  let CustomersArray = [];
  let EmployeeData = [];

  let responseData = {
    appointments: Appointments,
    callbacks: Callbacks,
    closers: Closers,
    rejects: Rejects,
  };

  let employeeData = await (await Database.DB.query(`select * from employees`)).rows;
  let data = await (await Database.DB.query(`select * from employees where employee_id = ${request.body.employee_id}`)).rows;
  let CustomerData = await (await Database.DB.query(`select * from customer where appointment_date = '${today}' or callback_date = '${today}'`)).rows;

  const employeesArray = (EmpArray) => {
    const TotalEmployeesArrayFilter = EmpArray.map((employee) => {
      if (employee === EmpArray[EmpArray.length - 1]) return ` employee_id = ${employee.employee_id} `;
      return `employee_id = ${employee.employee_id}` + ' or ';
    });

    return TotalEmployeesArrayFilter.join('');
  };

  const returnData = (CustomerData) => {
    for (let customer of CustomerData) {
      for (let employee of employeeData) {
        if (employee.employee_id === customer.employee_id) {
          if (customer.status === 'Appointment' && new Date(customer.appointment_date).toLocaleDateString() === new Date().toLocaleDateString()) {
            Appointments.push({ ...employee, ...customer });
          }
          if (customer.status === 'Callback' && new Date(customer.callback_date).toLocaleDateString() === new Date().toLocaleDateString()) {
            Callbacks.push({ ...employee, ...customer });
          }
          if (customer.status === 'Closer') {
            Closers.push({ ...employee, ...customer });
          }
        }
      }
    }
  };

  switch (data[0].role) {
    case 'CEO':
    case 'NSM':
    case 'RSM':
      returnData(CustomerData);
      break;

    case 'Zonal Manager':
      let ZonalCustomers = [];

      CustomerData.map((customer) => {
        if (customer.location === data[0].location) {
          ZonalCustomers.push(customer);
        }
      });

      returnData(ZonalCustomers);
      break;

    case 'Branch Manager':
      let branchCustomers = [];

      CustomerData.map((customer) => {
        if (customer.branch === data[0].branch) {
          branchCustomers.push(customer);
        }
      });

      returnData(branchCustomers);
      break;

    case 'Product Manager':
      SeniorRelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Senior Relationship Manager and higher_position = '${data[0].employee_id}''`)).rows;
      RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager'`)).rows;

      for (let i = 0; i < SeniorRelationshipManager.length; i++) {
        for (let j = 0; j < RelationshipManager.length; j++) {
          if (SeniorRelationshipManager[i].employee_id === RelationshipManager[j].higher_position) {
            RelationshipManagerArray.push(RelationshipManager[j]);
          }
        }
      }

      EmployeeData = [...SeniorRelationshipManager, ...RelationshipManager, ...data];

      for (const customer of CustomerData) {
        for (const employee of EmployeeData) {
          if (customer.employee_id === employee.employee_id) {
            CustomersArray.push(customer);
          }
        }
      }

      returnData(CustomersArray);
      break;

    case 'Sr. Relationship Manager':
      RelationshipManager = await (await Database.DB.query(`select * from employees where role = 'Relationship Manager' and higher_position = '${data[0].employee_id}'`)).rows;
      EmployeeData = [...RelationshipManager, ...data];

      for (const customer of CustomerData) {
        for (const employee of EmployeeData) {
          if (customer.employee_id === employee.employee_id) {
            CustomersArray.push(customer);
          }
        }
      }

      returnData(CustomersArray);
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

      returnData(CustomersArray);
      break;

    case 'Senior Team Lead':
      TeamLeads = await (await Database.DB.query(`select * from employees where (role = 'PTL' OR role = 'BTL' OR role = 'HTL' OR role = 'ITL') AND higher_position = '${request.body.employee_id}'`)).rows;
      Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller'`)).rows;

      const higherPositionArray = (EmpArray) => {
        const TotalEmployeesArrayFilter = EmpArray.map((employee) => {
          if (employee === EmpArray[EmpArray.length - 1]) return ` higher_position = '${employee.employee_id}' `;
          return `higher_position = '${employee.employee_id}'` + ' or ';
        });

        return TotalEmployeesArrayFilter.join('');
      };
      const Telecallers222 = await (await Database.DB.query(`select * from employees where role = 'Telecaller' and (${higherPositionArray(TeamLeads)})`)).rows;
      for (const telecaller of Telecallers) {
        for (const TeamLead of TeamLeads) {
          if (telecaller.higher_position === TeamLead.employee_id) {
            TelecallersArray.push(telecaller);
          }
        }
      }

      TotalEmployeesArray = [...TeamLeads, ...TelecallersArray, ...data];

      let CustomerData22 = await (await Database.DB.query(`select * from customer where (appointment_date = '${today}' or callback_date = '${today}') and (${employeesArray(TotalEmployeesArray)}) `)).rows;
      returnData(CustomerData22);
      break;

    case 'PTL':
    case 'BTL':
    case 'HTL':
    case 'ITL':
      Telecallers = await (await Database.DB.query(`select * from employees where role = 'Telecaller' and higher_position = ${data[0].employee_id}`)).rows;
      TotalEmployeesArray = [...Telecallers, ...data];
      for (const customer of CustomerData) {
        for (const employee of TotalEmployeesArray) {
          if (customer.employee_id === employee.employee_id) {
            CustomersArray.push(customer);
          }
        }
      }

      returnData(CustomersArray);
      break;

    case 'Telecaller':
    case 'Relationship Manager':
      CustomerData.map((customer) => {
        if (customer.employee_id === data[0].employee_id) {
          CustomersArray.push(customer);
        }
      });

      returnData(CustomersArray);
      break;

    default:
      break;
  }

  // console.log(responseData);
  response.send(responseData);
});

module.exports = { router };
