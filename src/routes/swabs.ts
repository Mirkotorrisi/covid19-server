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

const router = express.Router();
const parseDates = (startDate: any, endDate: any) => {
  const momentFormat = "YYYY-MM-DD";
  return moment(endDate).isAfter(moment(startDate))
    ? {
        startParsed: moment(startDate, momentFormat),
        endParsed: moment(endDate, momentFormat),
      }
    : {
        startParsed: moment().format(momentFormat),
        endParsed: moment().add(1, "week").format(momentFormat),
      };
};

router.get("/", async ({ query: { startDate, endDate, patientId } }, res) => {
  const { startParsed, endParsed } = parseDates(startDate, endDate);
  const swabs = patientId
    ? await getSwabForPatient(String(patientId))
    : await getAllSwabsByPeriod(String(startParsed), String(endParsed));
  swabs[0]
    ? res.json(swabs)
    : res
        .status(404)
        .send("No swabs found, try different period or patient id");
});
router.get(
  "/:id",
  idValidation(),
  handleErrors,
  async ({ params: { id } }: any, res: any) => {
    const swab = id && (await getSwabById(id));
    swab[0]
      ? res.json({
          ...swab[0],
          date: moment(swab[0].date).format("YYYY-MM-DD HH:mm"),
        })
      : res.status(404).send("Swab not found");
  }
);
router.delete(
  "/:id",
  idValidation(),
  handleErrors,
  async ({ params: { id } }: any, res: any) => {
    await deleteSwab(id);
    res.json({ message: "Deleted" });
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
  }
);

export default router;
