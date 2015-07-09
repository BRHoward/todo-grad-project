var express = require("express");
var server = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

module.exports.setupServer = function() {
    var router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    var serverInstance = server(testPort, router);
    var driver = new webdriver.Builder().forBrowser("chrome").build();
    return {router: router, server: serverInstance, driver: driver};
};

module.exports.teardownServer = function(server) {
    if (gatheringCoverage) {
        server.driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    server.server.close();
    server.driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function(server) {
    server.driver.get(baseUrl);
};

module.exports.getTitleText = function(server) {
    return server.driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function(server) {
    return server.driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function(server) {
    var errorElement = server.driver.findElement(webdriver.By.id("error"));
    server.driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function(server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return server.driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(server, text) {
    server.driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    server.driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.deleteFirstTodo = function(server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    server.driver.findElements(webdriver.By.css(".delBtn")).then(function(deleteButtons) {
        deleteButtons[0].click();
    });
};

module.exports.deleteSecondTodo = function(server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    server.driver.findElements(webdriver.By.css(".delBtn")).then(function(deleteButtons) {
        deleteButtons[1].click();
    });
};

module.exports.deleteCompletedTodos = function(server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    server.driver.findElement(webdriver.By.css(".delCompleted")).click();
};

module.exports.updateTodo = function(server, id) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    server.driver.findElements(webdriver.By.css(".updBtn")).then(function(updateButtons) {
        updateButtons[id].click();
    });
    server.driver.findElements(webdriver.By.css(".updField")).then(function(updateFields) {
        updateFields[0].sendKeys("Updated Todo");
    });
    server.driver.findElements(webdriver.By.css(".sbmtBtn")).then(function(sbmtButtons) {
        sbmtButtons[0].click();
    });
};

module.exports.toggleFirstComplete = function (server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    server.driver.findElements(webdriver.By.css(".compBtn")).then(function(compButtons) {
        compButtons[0].click();
    });
};

module.exports.setupErrorRoute = function(server, action, route) {
    if (action === "get") {
        server.router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        server.router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        server.router.delete(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "put") {
        server.router.put(route, function(req, res) {
            res.sendStatus(500);
        });
    }
};
