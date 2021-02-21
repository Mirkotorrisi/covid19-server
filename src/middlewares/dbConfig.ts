import mysql from "promise-mysql";
import config from "config";
const db = async () => {
  const pool = await mysql.createPool({
    timezone: "UTC",
    dateStrings: true,
    connectionLimit: 10,
    // host: "sql11.freemysqlhosting.net",
    host: "localhost",
    port: 3306,
    // user: config.get("db_username"),
    user: "root",
    // password: config.get("db_password"),
    password: "",
    // database: config.get("db_username"),
    database: "covid19",
  })
  console.log("db connected")
  return await pool.getConnection();
};

export default db;
