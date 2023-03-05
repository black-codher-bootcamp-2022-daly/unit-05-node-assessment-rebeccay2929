require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { json } = require("express");
const todoFilePath = process.env.BASE_JSON_PATH;

let todos = require(__dirname + todoFilePath);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  
  res.sendFile("./public/index.html", { root: __dirname });
  
  // res.status(200 ).end();
});

// GET todo's 

app.get('/todos', (_, res) => {
  
  res.header("Content-Type","application/json");
  res.sendFile(todoFilePath, { root: __dirname });
  
  // res.status(501).end();
});

//Add GET request with path '/todos/overdue'

app.get("/todos/overdue", (_, res) => {
let today = new Date();
const overdue =todos.filter(
  (todo) => Date.parse(todo.due) < today && todo.completed === false

);
res.write(JSON.stringify(overdue));
res.send();
});

//Add GET request with path '/todos/completed'

app.get("/todo/completed", (req, res) => {
 res.header("Content-Type", "appplication/json");
 const todo = todos.filter((todo) => {
  if (todo.completed) {
    return true;
  }
 });
 res.json(todo);
 res.write(JSON.stringify(todo));
 res.status(200).end();
});

// GET :id 
app.get("/todos/:id", (req, res) => {
  const foundTodo = todos.find((todo) => {
    return todo.id == req.params.id;
  })
  console.log(foundTodo, todos[0])
  if(!foundTodo) {
    return res.status(400).send("bad requests");
  }
  res.status(200).send(foundTodo) 
})

//Add POST request with path '/todos'
app.post("/todo", (req, res) => {
  let fs = require("fs");
  console.log(req.body);
  todos.push(req.body)
  if (!todos) return res.sendStatus(400);
  console.log('todos', todos)
  fs.writeFile(todoFilePath, JSON.stringify(todos), (err) => {
    console.log ('wiriting file', err)
    if (err) {
      console.error(err)
      return;
    }
  })
  res.status(200).json(todos);
})

//Add PATCH request with path '/todos/:id

app.patch("/todos/:id", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      if (req.body.name !== undefined && req.body.due !== undefined) {
        todo.name = req.body.name;
        todo.due = req.body.due;
        fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
        res.status(200).send("Success");
      }
     
      if (req.body.due === undefined && req.body.name === undefined) {
        res.status(400).send("Invalid request");
      }
    }
  });
  res.status(400).send("Invalid ID");
});

//Add POST request with path '/todos/:id/complete

app.post("/todos/:id/complete", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      todo.completed = true;
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Success");
    }
  });
  res.status(400).send("Invalid ID");
});


//Add POST request with path '/todos/:id/undo

app.post("/todos/:id/undo", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      todo.completed = false;
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Success");
    }
  });
  res.status(400).send("Invalid ID");
});

//Add DELETE request with path '/todos/:id

app.delete("/todos/:id", (req, res) => {
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === req.params.id) {
      todos.splice(i, 1);
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Todo deleted");
    }
  }
  res.status(400).send("ID Not Found");
});
module.exports = app;
