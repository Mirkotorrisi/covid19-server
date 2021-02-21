const request = require("supertest");
const config = require("config");
let server;
const moment = require("moment");
let token;
let header;
describe("POST /patients ", () => {
  beforeEach(() => server = require("../build/index").default);
  afterEach(() => {
    server.close();
  });
  it("should post a patient on db if he doesn't exist", async () => {
    const login = await request(server).post('/users/login').send({username:'uscaGravina', password:'danilo'})
    token = login.headers['x-auth-token']
    header = {"Access-Control-Expose-Headers": "x-auth-token",'x-auth-token':token}
    const patient = {
      name: "mirko",
      email: "mirko@torrisi.com",
      dob: "1992-11-17",
      fiscal_code: "TRTMRK92S17C351G",
      address: "Via fiume 36",
      phone: 3282581363,
      hasCovid: false,
    };

    const res = await request(server).post("/patients").send(patient).set(header);
    expect(res.status).toBe(200);
    expect(res.body.id).toBeGreaterThan(0);
  });
  it("should return error if a duplicate fiscal code is inserted", async () => {
    const patient = {
      name: "mirko",
      email: "mirko@torrisi.com",
      dob: "1992-11-17",
      fiscal_code: "FIRMRK92S17C351G",
      address: "Via fiume 36",
      phone: 3282581363,
      hasCovid: false,
    };
    await request(server).post("/patients").send(patient).set(header);
    const res = await request(server).post("/patients").send(patient).set(header);
    expect(res.status).toBe(400);
    expect(res.text).toMatch("Patient already registered");
  });
  it("should return error if a invalid values are inserted", async () => {
    const patient = {
      name: "mirko99",
      email: "invalid",
      dob: "invaliiiiid",
      fiscal_code: "defenitely invalid",
      address: "",
      phone: "no",
      hasCovid: "no",
    };
    const res = await request(server).post("/patients").send(patient).set(header);
    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({
      errors: [
        { name: "provide a valid patient name" },
        { email: "provide a valid patient email" },
        { dob: "provide a valid patient date of birth" },
        { fiscal_code: "provide a valid italian fiscal code" },
        { address: "provide a valid address" },
        { phone: "provide a valid phone number" },
        { hasCovid: "provide a valid covid19 posivity check (true, false)" },
      ],
    });
  });
});
describe("GET /patients", () => {
  beforeEach(() => server = require("../build/index").default);
  afterEach(() => {
    server.close();
  });
  it("should return all patients", async () => {
    const res = await request(server).get("/patients").set(header);
    expect(res.status).toBe(200);
    expect(res.body[0].patient_id).toBeGreaterThan(0);
  });
  it("should return all swabs of a patient plus his data", async () => {
    const patientID = 191;
    const res = await request(server).get(`/patients/${patientID}`).set(header);
    expect(res.status).toBe(200);
    expect(res.body.patient_id).toBe(patientID);
    res.body.swabs.forEach((swab) => expect(swab.patient_id).toBe(patientID));
  });
});
describe("PUT /patients", () => {
  beforeEach(() => server = require("../build/index").default);
  afterEach(() => {
    server.close();
  });
  it("should return modified patient given ID", async () => {
    const newPatient = {
      email: "new@new.com",
      address: "Via nuova 36",
      phone: "3253261365",
      hasCovid: 1,
    };
    const patientID = 191;
    await request(server).put(`/patients/${patientID}`).send(newPatient).set(header);
    const res = await request(server).get(`/patients/${patientID}`);
    expect(res.body).toMatchObject({ ...newPatient, patient_id: patientID });
  });
});
describe("DEL /patients", () => {
  beforeEach(() => server = require("../build/index").default);
  afterEach(() => {
    server.close();
  });
  it("should return 404 after deleting a patient given ID", async () => {
    const newPatient = {
      name: "mirkoNew",
      email: "new@new.com",
      dob: "1992-11-17",
      fiscal_code: "DELETE92S17N351N",
      address: "Via nuova 36",
      phone: 3253261365,
      hasCovid: 1,
    };
    const {
      body: { id },
    } = await request(server).post(`/patients/`).send(newPatient).set(header);
    await request(server).delete(`/patients/${id}`).set(header);
    const res = await request(server).get(`/patients/${id}`).set(header);
    expect(res.status).toBe(404);
    expect(res.text).toMatch("Patient not found");
  });
});
