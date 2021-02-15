import mysql from "promise-mysql";
import config from "config";
const db = async () => {
  const pool = await mysql.createPool({
    timezone: "UTC",
    dateStrings: true,
    connectionLimit: 10,
    host: "localhost", //"sql11.freemysqlhosting.net",
    port: 3306,
    user: "root", //config.get("db_username"),
    password: "", //config.get("db_password"),
    database: "covid19", //config.get("db_username"),
  });

  return await pool.getConnection();
};

export default db;
