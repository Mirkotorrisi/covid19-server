import express, { Request, Response } from "express";
import { handleErrors, userNameValidation } from "../middlewares/validator";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import client from "../middlewares/redisConfig";
import config from "config";
import { getUser } from "../middlewares/dbQueries";

const router = express.Router();

const generateAuthToken = (username: string) => {
  return jwt.sign(username, config.get("jwtPrivateKey"));
};
router.post(
  "/login",
  userNameValidation(),
  handleErrors,
  async ({ body: { username, password } }: Request, res: Response) => {
    try {
      const userFetch = await getUser(username);
      if (userFetch.length === 0)
        res.status(400).send("invalid username or password");
      else {
        const validatePass = await bcrypt.compare(
          password,
          userFetch[0].password
        );
        if (validatePass) {
          const token = generateAuthToken(username);
          client.set(username, token, "EX", 60 * 10, (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Internal server error, sorry.");
            }
            res
              .header("Access-Control-Expose-Headers", "x-auth-token")
              .header("x-auth-token", token)
              .json(username);
          });
        } else res.status(400).send("invalid username or password");
      }
    } catch (error) {
      return res.status(500).send("Internal server error, sorry.");
    }
  }
);
export default router;
