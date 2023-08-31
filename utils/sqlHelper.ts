import { config } from "dotenv";
const mysql = require("mysql");

config();
//DB connection
export function createDbConnection(db: string = "client") {
  let dbUsername;
  let dbPassword;
  let dbHost;

  dbUsername = process.env.USER;
  dbPassword = process.env.PASSWORD;
  dbHost = process.env.DB;

  const dbConnection = mysql.createConnection({
    user: dbUsername,
    password: dbPassword,
    host: dbHost,
    database: db,
  });
  return dbConnection;
}

export async function queryDb(query): Promise<Object> {
  // creates a new mysql connection using credentials from cypress.json env's
  // start connection to db
  const dbConnection = createDbConnection();
  // exec query + disconnect to db as a Promise
  return new Promise((resolve, reject) => {
    dbConnection.query(query, (error, results) => {
      if (error) reject(error);
      else {
        dbConnection.end();
        return resolve(results);
      }
    });
  });
}
