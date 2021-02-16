import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import client from "../middlewares/redisConfig";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("No auth token provided");

  try {
    const username = String(jwt.verify(token, config.get("jwtPrivateKey")));

    client.get(username, (err, result) => {
      if (err) return res.status(500).send("Internal server error, sorry.");
      if (result && token === result) {
        client.set(username, token, "EX", 60 * 10, (err, res) => {
          next();
        });
      } else
        return res
          .status(401)
          .send("Session expired. Log in again to continue");
    });
  } catch (ex) {
    res.status(401).send("Invalid Token, log in to continue");
  }
};
