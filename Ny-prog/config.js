import * as dotenv from 'dotenv';
const res = dotenv.config();
console.log(res)

const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;
console.log()

export default {
    server,
    port,
    database,
    user,
    password,
    options: {
        encrypt: true
    }
};

//hej