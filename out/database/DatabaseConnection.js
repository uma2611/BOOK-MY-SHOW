"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var DatabaseConnection = /** @class */ (function () {
    function DatabaseConnection() {
        this.client = new pg_1.Pool({
            port: 5432,
            /*host:"localhost",
            user:"postgres",
            password:"omkar@123",
            database:"Project",*/
            host: "testpg.postgres.database.azure.com",
            user: "testadmin1@testpg",
            password: "Test@123",
            database: "test-db",
        });
    }
    DatabaseConnection.prototype.getClient = function () {
        return this.client;
    };
    return DatabaseConnection;
}());
exports.default = DatabaseConnection;
