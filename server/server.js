var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

module.exports = function(port, middleware) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function(req, res) {
        var todo = req.body;
        todo.id = latestId.toString();
        todo.isComplete = false;
        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    //Update
    app.put("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        var newTodo = req.body;

        if (todo) {
            updateTodo(id, newTodo);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    function updateTodo(id, newTodo) {
        var todoIndex = -1;

        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todoIndex = i;
                break;
            }
        }
        newTodo.id = id;
        todos[todoIndex] = newTodo;
    }
    return app.listen(port);
};
