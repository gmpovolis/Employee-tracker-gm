const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: "root",
    password: "",
    database: "employees"
});

connection.connect(function(err){
    if (err) throw err;
    main();
});

function main(){
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View all employees",
            "View all employees by department",
            "View all employees by manager",
            "Add employee",
            "Remove employee",
            "Update employee role",
            "Update employee manager",
            "View all roles",
            "Add role",
            "Remove role",
            "View all departments",
            "Add department",
            "Remove department",
            "Quit"
        ]
    })
    .then(function(answer){
        switch (answer.action){
            case "View all employees":
                viewAll();
                break;
            case "View all employees by department":
                getDep();
                break;
            case "View all employees by manager":
                getMan();
                break;
            case "Add employee":
                getRole();
                break;
            case "Remove employee":
                break;
            case "Update employee role":
                getEmployee();
                break;
            case "Update employee manager":
                break;
            case "View all roles":
                viewRole();
                break;
            case "Add role":
                getDepartment();
                break;
            case "Remove role":
                break;
            case "View all departments":
                viewDepartment();
                break;
            case "Add department":
                addDepartment();
                break;
            case "Remove department":
                break;
            case "Quit":
                connection.end();
                break;
        }
    })
};

function viewAll(){
    var query = "SELECT * FROM employee";
    connection.query(query, function(err, res){
        if (err) throw err;
        console.table("\n",res)
        // for(var i = 0; i<res.length;i++){
        //     table(res[i].first_name+" "+res[i].last_name);
        // }
    })
    console.log("\n");
    main();
};

function getDep(){
    var query = "SELECT name FROM department";
    connection.query(query, function(err, res){
        if (err) throw err;
        var departments = [];    
        for(var i=0;i<res.length;i++){
            departments.push(res[i].name);
        }
        viewDep(departments);
    });
}

function viewDep(departments){
    const arr = departments;
    inquirer.prompt({
        name: "department",
        type: "list",
        message: "Choose the department",
        choices: arr
    }).then(function(answer){
        var query = "SELECT first_name, last_name, department_id, name FROM employee inner join role ON role.id = employee.id left JOIN department ON role.department_id = department.id WHERE department.name = ?";
        connection.query(query, answer.department, function(err, res){
            if (err) throw err;
            console.table("\n",res);
        })
        console.log("\n");
        main();
    })
};

function getMan(){
    var query = "SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL";
    connection.query(query, function(err, res){
        if (err) throw err;
        var managers = [];
        var employeeId = []; 
        for(var i=0;i<res.length;i++){
            managers.push(res[i].first_name+" "+res[i].last_name);
            employeeId.push(res[i].id);
        }
        viewMan(managers, employeeId);
    });
}

function viewMan(managers, employeeId){
    const arr = managers;
    inquirer.prompt({
        name: "manager",
        type: "list",
        message: "Choose the manager",
        choices: arr
    }).then(function(answer){
        var query = "SELECT first_name, last_name FROM employee WHERE manager_id = ?";
        var index = managers.indexOf(answer.manager)
        connection.query(query, employeeId[index], function(err, res){
            if (err) throw err;
            console.table("\n",res);
        })
        console.log("\n");
        main();
    })
};

async function add(titles, ids, managers, employeeId){
    await inquirer.prompt(
    {
        name: "first",
        type: "input",
        message: "What is the employee's first name?"
    },
    {
        name: "last",
        type: "input",
        message: "What is the employee's last name?"
    },
    {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: titles
    },
    {
        name: "manager",
        type: "list",
        message: "Who is the employee's manager",
        choices: "none", managers
    }).then(function(answer){
        var idIndex = titles.indexOf(answer.role);
        if(answer.manager){
            var manIndex=managers.indexOf(answer.manager)
        } else{employeeId[manIndex]= null };
        var add = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES('"+answer.first_name+"', '"+answer.last_name+"', "+ids[idIndex]+","+employeeId[manIndex]+")"
        connection.query(add, function(err){
            if (err) throw err;
            console.log("Adding employee to database")
        });
        console.log("\n");
        main();
    })
    
}

function getRole(){
    var query = "SELECT title, id FROM role"
    connection.query(query, function(err, res){
        if(err) throw err;
        var titles=[];
        var ids =[];
        for(var i =0; i<res.length; i++){
            titles.push(res[i].title);
            ids.push(res[i].id);
        }
        getManagers(titles, ids);
    })
}

function getManagers(titles, ids){
    var query = "SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL";
    var managers = [];
    var employeeId = [];
    connection.query(query, function(err, res){
        for(var i =0; i<res.length; i++){
            managers.push(res[i].first_name+" "+res[i].last_name)
            employeeId.push(res[i].id)
        }
        add(titles, ids, managers, employeeId);
    })
};

function addRole(departments, ID){
    inquirer.prompt(
        {
            name: "title",
            type: "input",
            message: "What is the title of the role?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary of this role?"
        },
        {
            name: "department_id",
            type: "list",
            message: "Choose the department",
            choices: departments
        }).then(function(answer){
            var index = ID.indexOf(answer.department_id)
            var addRole = "INSERT INTO role (title, salary, department_id) Values('"+answer.title+"', '"+answer.salary+"', "+ID[index]+")";
            connection.query(addRole, function(err){
                if(err) throw err;
                console.log("Adding role to database")
            })
            console.log("\n");
            main();
        })
}

function getDepartment(){
    var query = "SELECT name, id FROM department";
    var departments = [];
    var ID = [];
    connection.query(query, function(err, res){
        for(var i =0; i<res.length; i++){
            departments.push(res[i].name);
            ID.push(res[i].id);
        }
        addRole(departments, ID);
    })
};

function addDepartment(){
    inquirer.prompt({
        name: "department",
        type: "input",
        message: "Enter a department"
    }).then(function(answer){
        var query = "INSERT INTO department (name) VALUES('"+answer.department+"')";
        connection.query(query, function(err){
            if (err) throw err;
            console.log("Adding department to database");
        })
        console.log("\n");
        main();
    })
};

function viewRole(){
    var query = "SELECT * FROM role"
    connection.query(query, function(err, res){
        console.table("\n",res);
    })
    console.log("\n");
    main();
};

function viewDepartment(){
    var query = "SELECT * FROM department"
    connection.query(query, function(err, res){
        if (err) throw err;
        console.table("\n",res);
    })
    console.log("\n");
    main();
};

function update(employees, employeeId, titles, role_id){
    inquirer.prompt(
        {
            name: "employee",
            type: "list",
            message: "Pick the employee you want to update",
            choices: employees
        },
        {
            name: "role",
            type: "list",
            message: "Select the desired new role",
            choices: titles
        }).then(function(answer){
            var employeeIndex = employees.indexOf(answer.employee);
            var roleIndex = titles.indexOf(answer.role);
            var query = "UPDATE employee SET role_id = "+role.id[roleIndex]+"WHERE id = "+employeeId[employeeIndex]+"";
            connection.query(query, function(err){
                if(err) throw err;
                console.log("Updating employee's role");
            })
        })
}

function getEmployee(){
    var query = "SELECT * FROM employee FULL JOIN role ON role_id = role.id";
    connection.query(query, function(err, res){
        var employees = [];
        var employeeIds = [];
        var titles = [];
        var role_id = [];
        for (var i=0; i<res.length; i++){
            employees.push(res[i].first_name+" "+res[i].last_name);
            employeeIds.push(res[i].id);
            titles.push(res[i].title);
            role_id.push(res[i].role_id);
        }
        update(employees, employeeIds, titles, role_id);
    })
};