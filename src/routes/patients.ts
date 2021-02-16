import {
  getPatient,
  newPatient,
  getAllPatients,
  deletePatient,
  updatePatient,
  showPatientAndSwabs,
} from "./../middlewares/dbQueries";
import express, { Request, Response, NextFunction } from "express";
import Patient from "../interfaces";
import {
  handleErrors,
  idValidation,
  patientValidation,
} from "../middlewares/validator";
import auth from "../middlewares/auth";

const router = express.Router();

router.use(auth);
router.get("/", async (req: Request, res: Response) => {
  const patients = await getAllPatients();
  res.json(patients);
});

router.get(
  "/:id",
  idValidation(),
  async ({ params: { id } }: Request, res: Response) => {
    const patientAndSwabs = await showPatientAndSwabs(Number(id));
    const patient = !patientAndSwabs[0]
      ? await getPatient(id)
      : patientAndSwabs;
    if (!patient[0]) return res.status(404).send("Patient not found");
    let finalResult: Patient = patient.reduce(
      (
        acc: Patient,
        {
          patient_id,
          name,
          fiscal_code,
          dob,
          address,
          email,
          phone,
          hasCovid,
          swab_id,
          team_id,
          date,
          type,
          done,
          positive_res,
        }: any
      ) => {
        return {
          patient_id,
          name,
          fiscal_code,
          dob,
          address,
          email,
          phone,
          hasCovid,
          swabs: [
            { swab_id, team_id, date, type, done, positive_res, patient_id },
            ...acc.swabs,
          ],
        };
      },
      { swabs: [] }
    );
    res.json(finalResult);
  }
);

router.post(
  "/",
  patientValidation(),
  handleErrors,
  async (
    {
      body: { name, email, dob, fiscal_code, address, phone, hasCovid },
    }: Request,
    res: Response
  ) => {
    try {
      const { insertId } = await newPatient(
        name,
        email,
        dob,
        fiscal_code.toUpperCase(),
        address,
        phone,
        hasCovid
      );
      return res.json({ id: insertId });
    } catch ({ message }) {
      if (message.includes("ER_DUP_ENTRY"))
        return res.status(400).send("Patient already registered");
      else return res.status(500).send(message);
    }
  }
);

router.put(
  "/:id",
  idValidation(),
  handleErrors,
  async (
    { params: { id }, body: { email, address, phone, hasCovid } }: Request,
    res: Response
  ) => {
    const result = await updatePatient(id, email, address, phone, hasCovid);
    res.json(result);
  }
);

router.delete(
  "/:id",
  idValidation(),
  async ({ params: { id } }: Request, res: Response) => {
    await deletePatient(id);
    res.json({ status: "success" });
  }
);

export default router;
