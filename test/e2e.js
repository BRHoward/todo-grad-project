var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    var server;

    this.timeout(20000);

    testing.beforeEach(function() {
        server = helpers.setupServer();
    });
    testing.afterEach(function() {
        helpers.teardownServer(server);
    });
    testing.after(function() {
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite(server);
            helpers.getTitleText(server).then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "get", "/api/todo");
            helpers.navigateToSite(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getInputText(server).then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "post", "/api/todo");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another new todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("clears one todo item", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another todo item");
            helpers.deleteFirstTodo(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("clears the second todo item", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another todo item");
            helpers.deleteSecondTodo(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays error if the request fails", function() {
            helpers.setupErrorRoute(server, "delete", "/api/todo/0");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.deleteFirstTodo(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on update todo item", function() {
        testing.it("updates one item", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.updateTodo(server, 0);
            helpers.getTodoList(server).then(function(elements) {
                elements[0].getText().then(function(text) {
                    assert.equal(text, "New todo itemUPDATE");
                });
            });
        });
        // testing.it("updates second item", function() {
        //     helpers.navigateToSite(server);
        //     helpers.addTodo(server, "New todo item");
        //     helpers.addTodo(server, "another todo item");
        //     helpers.updateTodo(server, 1);
        //     helpers.getTodoList(server).then(function(elements) {
        //         elements[1].getText().then(function(text) {
        //             assert.equal(text, "New todo itemUPDATE");
        //         });
        //     });
        // });
        testing.it("displays error if the request fails", function() {
            helpers.setupErrorRoute(server, "put", "/api/todo/0");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.updateTodo(server, 0);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to update item. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on hitting complete button", function() {
        testing.it("changes the state of the item to complete", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.toggleFirstComplete(server);
            helpers.getTodoList(server).then(function(elements) {
                elements[0].getAttribute("class").then(function(classname) {
                    assert.equal(classname, "ng-binding itemComplete");
                });
            });
        });
        testing.it("deletes all complete todos from one", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.toggleFirstComplete(server);
            helpers.deleteCompletedTodos(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("deletes one complete todos from two", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "another todo item");
            helpers.toggleFirstComplete(server);
            helpers.deleteCompletedTodos(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
    testing.describe("on hitting filter buttons", function() {
        testing.it("mark all shows all", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.markAll(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("mark active hides complete", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another todo");
            helpers.toggleFirstComplete(server);
            helpers.markActive(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
        testing.it("mark complete hides active", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another todo");
            helpers.toggleSecondComplete(server);
            helpers.markComplete(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
});
