/*global angular*/
(function() {

    var app = angular.module("todoList", []);

    app.controller("todoController", ["$http", "$scope", function($http, $scope) {

        $scope.todoList = [];

        $scope.newTodo = "";
        $scope.completeItems = 0;

        $scope.getTodos = function() {
            $http.get("/api/todo").success(function(data) {
                $scope.todoList = data;
                $scope.updateCompleteItems();
            }).error(function(data, status) {
                $scope.errorText = "Failed to get list. Server returned " + status + " - " + data;
            });
        };

        $scope.addTodo = function() {
            $http.post("/api/todo", {
                newText: $scope.newTodo
            }).success(function(data) {
                $scope.getTodos();
                $scope.newTodo = "";
            }).error(function(data, status) {
                $scope.errorText = "Failed to create item. Server returned " + status + " - " + data;
            });
        };

        $scope.deleteTodo = function(id) {
            $http.delete("/api/todo/" + id).success(function(data) {
                $scope.getTodos();
            }).error(function(data, status) {
                $scope.errorText = "Failed to delete item. Server returned " + status + " - " + data;
            });
        };

        $scope.updateTodo = function(todo) {
            $http.put("/api/todo/" + todo.id, todo).success(function(data) {
                $scope.getTodos();
            }).error(function(data, status) {
                $scope.errorText = "Failed to update item. Server returned " + status + " - " + data;
            });
        };

        $scope.updateCompleteItems = function() {
            $scope.completeItems = 0;
            $scope.todoList.forEach(function(todo) {
                if (todo.isComplete === true) {
                    $scope.completeItems++;
                }
            });
        };

        $scope.deleteCompleted = function() {
            $scope.todoList.forEach(function(todo) {
                if (todo.isComplete === true) {
                    $scope.deleteTodo(todo.id);
                }
            });
        };

        $scope.markAll = function() {
            $scope.todoList.forEach(function(todo) {
                todo.visible = true;
            });
        };

        $scope.markActive = function() {
            $scope.todoList.forEach(function(todo) {
                if (todo.isComplete === false) {
                    todo.visible = true;
                } else {
                    todo.visible = false;
                }
            });
        };

        $scope.markComplete = function() {
            $scope.todoList.forEach(function(todo) {
                if (todo.isComplete === true) {
                    todo.visible = true;
                } else {
                    todo.visible = false;
                }
            });
        };

        angular.element(document).ready(function() {
            $scope.getTodos();
        });

        var timerId = setInterval($scope.getTodos, 60000);

    }]);

})();
