import {
  getAllSwabsByPeriod,
  deleteSwab,
  getSwabById,
  updateSwab,
  addSwab,
  getSwabForPatient,
} from "./../middlewares/dbQueries";
import express from "express";
import moment from "moment";
import {
  handleErrors,
  newSwabValidation,
  idValidation,
} from "../middlewares/validator";
import auth from "../middlewares/auth";
import Swab from "../interfaces";

const router = express.Router();
const parseDates = (startDate: any, endDate: any) => {
  const momentFormat = "YYYY-MM-DD";
  return moment(endDate).isAfter(moment(startDate))
    ? {
        startParsed: moment(startDate).format(momentFormat),
        endParsed: moment(endDate).format(momentFormat),
      }
    : {
        startParsed: moment().format(momentFormat),
        endParsed: moment().add(1, "week").format(momentFormat),
      };
};
const parseSwabByDate = (swabs: Swab[]) => {
  let result: any = {};
  swabs.forEach(
    ({
      swab_id,
      team_id,
      date,
      type,
      done,
      positive_res,
      name,
      address,
      phone,
    }) => {
      result[date.substr(0, 10)] = result[date.substr(0, 10)]
        ? [
            ...result[date.substr(0, 10)],
            {
              swab_id,
              team_id,
              date,
              type,
              done,
              positive_res,
              name,
              address,
              phone,
            },
          ]
        : [
            {
              swab_id,
              team_id,
              date,
              type,
              done,
              positive_res,
              name,
              address,
              phone,
            },
          ];
    }
  );
  return result;
};
router.use(auth);
router.get("/", async ({ query: { startDate, endDate, patientId } }, res) => {
  try {
    const { startParsed, endParsed } = parseDates(startDate, endDate);
    const swabs = patientId
      ? await getSwabForPatient(String(patientId))
      : await getAllSwabsByPeriod(String(startParsed), String(endParsed));
    swabs[0]
      ? res.json(parseSwabByDate(swabs))
      : res
          .status(404)
          .send("No swabs found, try different period or patient id");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get(
  "/:id",
  idValidation(),
  handleErrors,
  async ({ params: { id } }: any, res: any) => {
    try {
      const swab = id && (await getSwabById(id));
      swab[0]
        ? res.json({
            ...swab[0],
            date: moment(swab[0].date).format("YYYY-MM-DD HH:mm"),
          })
        : res.status(404).send("Swab not found");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
);
router.delete(
  "/:id",
  idValidation(),
  handleErrors,
  async ({ params: { id } }: any, res: any) => {
    try {
      await deleteSwab(id);
      res.json({ message: "Deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
);

router.post(
  "/",
  newSwabValidation(),
  handleErrors,
  async (
    { body: { team_id, date, type, patient_id, done, positive_res } }: any,
    res: any
  ) => {
    try {
      const { insertId } = await addSwab(
        team_id,
        date,
        type,
        patient_id,
        done,
        positive_res
      );
      res.json({ status: "success", id: insertId });
    } catch ({ message }) {
      if (message.includes("ER_DUP_ENTRY"))
        return res
          .status(400)
          .send("Swab's patient and execution date already registered");
      else {
        return res.status(500).send(message);
      }
    }
  }
);

router.put(
  "/:id",
  idValidation(),
  newSwabValidation(),
  async (
    {
      params: { id },
      body: { team_id, date, type, patient_id, done, positive_res },
    }: any,
    res: any
  ) => {
    try {
      await updateSwab(
        Number(id),
        team_id,
        date,
        type,
        patient_id,
        done,
        positive_res
      );
      res.json({ status: "Swab modified" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
);

export default router;
