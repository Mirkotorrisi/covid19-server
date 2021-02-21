import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import patients from "./routes/patients";
import swabs from "./routes/swabs";
import users from "./routes/users";
import config from "config";

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use("/patients", patients);
app.use("/swabs", swabs);
app.use("/users", users);

["db_password", "db_username", "jwtPrivateKey", "redis_url"].forEach((i) => {
  if (!config.get(i)) {
    console.error(`FATAL ERROR: ${i} NOT DEFINED!`);
    process.exit(1);
  }
});

export default app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening at http://localhost:3000`);
});
