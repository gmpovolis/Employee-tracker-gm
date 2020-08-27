const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: "root",
    password: "blu3snak3",
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
                break;
            case "Remove employee":
                break;
            case "Update employee role":
                break;
            case "Update employee manager":
                break;
            case "View all roles":
                break;
            case "Add role":
                break;
            case "Remove role":
                break;
            case "View all departments":
                break;
            case "Add department":
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
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function(err, res){
        if (err) throw err;
        for(var i = 0; i<res.length;i++){
            console.table(res[i].first_name+" "+res[i].last_name);
        }
    })
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
        console.log("the parts:", departments);
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
            for(var i = 0; i<res.length;i++){
                console.table(res[i].first_name+" "+res[i].last_name);
            }
        })
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
            for(var i = 0; i<res.length; i++){
                console.table(res[i].first_name+" "+res[i].last_name);
            }
        })
        main();
    })
};

