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

const router = express.Router();

/*
router.get("/:id", async ({ params: { id } }:Request, res:Response) => {
  const patient = await getPatient(Number(id));
  res.json(patient);
});
*/
router.get("/", async (req: Request, res: Response) => {
  const patients = await getAllPatients();
  res.json(patients);
});

router.get("/:id", async ({ params: { id } }: Request, res: Response) => {
  const patient = await showPatientAndSwabs(Number(id));
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
});

router.post(
  "/",
  async (
    {
      body: { name, email, dob, fiscal_code, address, phone, hasCovid },
    }: Request,
    res: Response
  ) => {
    const patients = JSON.parse(JSON.stringify(await getAllPatients()));
    const checkPatients = patients.some(
      (p: Patient) => p.fiscal_code === String(fiscal_code)
    );
    if (!checkPatients) {
      await newPatient(
        name,
        email,
        dob,
        fiscal_code.toUpperCase(),
        address,
        phone,
        hasCovid
      );
      return res.json({ status: "success" });
    }
    return res.json({ message: "Error" });
  }
);

router.put(
  "/:id",
  async (
    { params: { id }, body: { email, address, phone, hasCovid } }: Request,
    res: Response
  ) => {
    const patientToUpdate = await updatePatient(
      Number(id),
      email,
      address,
      phone,
      hasCovid
    );
    res.json({ status: "success" });
  }
);

router.delete("/:id", async ({ params: { id } }: Request, res: Response) => {
  const deleteAccount = await deletePatient(Number(id));
  res.json({ status: "success" });
});

export default router;
