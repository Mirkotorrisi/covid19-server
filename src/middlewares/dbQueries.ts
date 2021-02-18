import db from "./dbConfig";

export const getAllSwabsByPeriod = async (
  startDate: string,
  endDate: string
) => {
  const conn = await db();
  return conn
    .query(
      `SELECT * FROM swabs INNER JOIN patients ON patients.patient_id=swabs.patient_id WHERE date > DATE '${startDate}' AND date < DATE '${endDate}'`
    )
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};
export const getAllSwabsByPatient = async (patient_id: string) => {
  const conn = await db();
  return conn
    .query(`SELECT * FROM swabs WHERE patient_id = ${patient_id}`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};
export const getSwabById = async (swab_id: string) => {
  const conn = await db();
  return conn
    .query(`SELECT * FROM swabs WHERE swab_id = ${swab_id}`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const getSwabForPatient = async (id: string) => {
  const conn = await db();
  return conn
    .query(`SELECT * FROM swabs WHERE patient_id = ${id}`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const showPatientAndSwabs = async (id: number) => {
  const conn = await db();
  return conn
    .query(
      `SELECT * FROM patients INNER JOIN swabs ON patients.patient_id=swabs.patient_id WHERE swabs.patient_id='${id}'`
    )
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const addSwab = async (
  team_id: number,
  date: string,
  type: string,
  patient_id: number,
  done: boolean,
  positive_res: boolean
) => {
  const conn = await db();
  return conn
    .query(
      `INSERT INTO swabs (team_id, date, type,patient_id,done,positive_res) VALUES ('${team_id}','${date}','${type}','${patient_id}','${done}','${positive_res}')`
    )
    .catch((err: string | undefined) => {
      throw new Error(err);
    });
};

export const updateSwab = async (
  swab_id: number,
  team_id: number,
  date: string,
  type: string,
  patient_id: number,
  done: boolean,
  positive_res: boolean
) => {
  const conn = await db();
  return conn
    .query(
      `UPDATE swabs SET team_id='${team_id}', date='${date}', type= '${type}', patient_id='${patient_id}', done='${done}',positive_res='${positive_res}'WHERE swab_id='${swab_id}'`
    )
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const deleteSwab = async (id: string) => {
  const conn = await db();
  return conn
    .query(`DELETE FROM swabs WHERE swab_id= ${id} `)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const getPatient = async (id: string) => {
  const conn = await db();
  return conn
    .query(`SELECT * FROM patients WHERE patient_id = ${id}`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};
export const newPatient = async (
  name: string,
  email: string,
  dob: string,
  fiscal_code: string,
  address: string,
  phone: number,
  hasCovid: boolean
) => {
  const conn = await db();
  return conn
    .query(
      `INSERT INTO patients (name,email, dob, fiscal_code,address,phone,hasCovid) VALUES ('${name}','${email}','${dob}','${fiscal_code}','${address}','${phone}','${hasCovid}')`
    )
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const getAllPatients = async () => {
  const conn = await db();
  return conn
    .query(`SELECT * FROM patients`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const updatePatient = async (
  id: string,
  email: string,
  address: string,
  phone: number,
  hasCovid: boolean
) => {
  const conn = await db();
  return conn
    .query(
      `UPDATE patients SET email='${email}', address='${address}', phone= '${phone}', hasCovid='${hasCovid}' WHERE patient_id='${id}'`
    )
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};

export const deletePatient = async (id: string) => {
  const conn = await db();
  return conn
    .query(`DELETE FROM patients WHERE patient_id= ${id} `)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};
export const getUser = async (username: string) => {
  const conn = await db();
  return conn
    .query(`SELECT password FROM users WHERE username= '${username}'`)
    .catch((err: string | undefined) => {
      console.log(err);
      throw new Error(err);
    });
};
