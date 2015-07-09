var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var completeCounter = document.getElementById("count-label");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteTodo(callback, id) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function updateTodo(title, isComplete, id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete : isComplete
    }));
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        var completeTasks = 0;
        todos.forEach(function(todo) {
            if (todo.isComplete === true) {
                completeTasks++;
            }
        });
        if (completeTasks > 0) {
            var deleteComplete = document.createElement("input");
            deleteComplete.type = "button";
            deleteComplete.value = "Delete Completed Tasks";
            deleteComplete.className = "delCompBtn";
            todoList.appendChild(deleteComplete);

        }
        completeCounter.textContent = "" + completeTasks + " / " + todos.length + " tasks complete";
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            if (todo.isComplete === true) {
                listItem.className = "itemComplete";
            } else {
                listItem.className = "itemUncomplete";
            }
            var delButton = document.createElement("input");
            delButton.type = "button";
            delButton.value = "Delete";
            delButton.className = "delBtn";
            delButton.addEventListener("click", function() {
                deleteTodo(reloadTodoList, todo.id);
            });
            var updateButton = document.createElement("input");
            updateButton.type = "button";
            updateButton.value = "Update";
            updateButton.className = "updBtn";
            updateButton.addEventListener("click", function() {
                updateButton.parentNode.removeChild(updateButton);
                var updateField = document.createElement("input");
                updateField.type = "text";
                updateField.placeholder = todo.title;
                updateField.className = "updField";
                var submitButton = document.createElement("input");
                submitButton.type = "button";
                submitButton.value = "Submit";
                submitButton.className = "sbmtBtn";
                listItem.appendChild(updateField);
                listItem.appendChild(submitButton);
                submitButton.addEventListener("click", function() {
                    updateTodo(updateField.value, todo.isComplete, todo.id, reloadTodoList);
                });
            });
            var compButton = document.createElement("input");
            compButton.type = "button";
            compButton.value = "Completed";
            compButton.className = "compBtn";
            compButton.addEventListener("click", function() {
                if (todo.isComplete) {
                    updateTodo(todo.title, false, todo.id, reloadTodoList);
                } else {
                    updateTodo(todo.title, true, todo.id, reloadTodoList);
                }
            });

            listItem.textContent = todo.title;
            listItem.appendChild(delButton);
            listItem.appendChild(updateButton);
            listItem.appendChild(compButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
