import {Pool} from "pg";


class DatabaseConnection{

    private client;
    constructor(){
        this.client = new Pool({
            port:5432,
            /*host:"localhost",
            user:"postgres",
            password:"omkar@123",
            database:"Project",*/
            host:"testpg.postgres.database.azure.com",
            user:"testadmin1@testpg",
            password:"Test@123",
            database:"test-db",
        });
        
    }

    getClient(){
        return this.client;
    }

}


export default DatabaseConnection;