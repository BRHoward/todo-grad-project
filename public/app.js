(function(){

	var app = angular.module("todoList",[]);

	var todos = ["First todo", "another todo", "third todo"];

	app.controller("todoController", function() {
		this.todoList = todos;
	});

})();