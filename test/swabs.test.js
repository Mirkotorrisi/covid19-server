const request = require("supertest");
const config = require("config");
let server;
const moment = require("moment");

describe("POST /swabs ", () => {
  beforeEach(() => (server = require("../build/index").default));
  afterEach(() => {
    server.close();
  });
  it("should post a swab on db if it doesn't exist", async () => {
    const swab = {
      team_id: 1,
      date: "2021-03-17 15:50",
      type: "rap",
      patient_id: 5,
      done: false,
      positive_res: false,
    };
    const res = await request(server).post("/swabs").send(swab);
    expect(res.status).toBe(200);
    expect(res.body.id).toBeGreaterThan(0);
  });
  it("should return error if a duplicate swab is inserted", async () => {
    const swab = {
      team_id: 1,
      date: "2021-02-17 15:50",
      type: "rap",
      patient_id: 2,
      done: false,
      positive_res: false,
    };
    const res = await request(server).post("/swabs").send(swab);
    expect(res.status).toBe(400);
    expect(res.text).toMatch(
      "Swab's patient and execution date already registered"
    );
  });
  it("should return error if a invalid swab is inserted", async () => {
    const swab = {
      team_id: "invalid",
      date: "not-valid-date",
      type: "invalid type",
      patient_id: "another invalid value",
      done: "no",
      positive_res: "maybe",
    };
    const res = await request(server).post("/swabs").send(swab);
    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({
      errors: [
        { patient_id: "provide a valid patient Id" },
        { team_id: "provide a valid team Id" },
        { date: "provide a valid date of execution" },
        { type: "provide a valid swab type" },
        { done: "provide an execution status" },
        { positive_res: "provide a valid result for swab (false, true)" },
      ],
    });
  });
});
describe("GET /swabs", () => {
  beforeEach(() => (server = require("../build/index").default));
  afterEach(() => {
    server.close();
  });
  it("should return selected swab given ID", async () => {
    const swab = {
      team_id: 3,
      date: "2021-02-17 16:40",
      type: "rap",
      patient_id: 4,
      done: 0,
      positive_res: 0,
    };
    const {
      body: { id },
    } = await request(server).post("/swabs").send(swab);
    const res = await request(server).get(`/swabs/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...swab, swab_id: id });
  });
  it("should return all swabs of the week", async () => {
    const res = await request(server).get(`/swabs`);
    expect(res.status).toBe(200);
    expect(moment(res.body[0].date).isAfter(moment())).toBeTruthy();
    expect(
      moment(res.body[res.body.length - 1].date).isBefore(
        moment().add(8, "days")
      )
    ).toBeTruthy();
  });
  it("should return all swabs of a specific patient", async () => {
    let patientID = 2;
    const res = await request(server).get(`/swabs?patientId=${patientID}`);
    expect(res.status).toBe(200);
    res.body.forEach((item) => expect(item.patient_id).toBe(patientID));
  });
});
describe("PUT /swabs", () => {
  beforeEach(() => (server = require("../build/index").default));
  afterEach(() => {
    server.close();
  });
  it("should return modified swab given ID", async () => {
    const newSwab = {
      team_id: 3,
      date: "2021-02-18 16:40",
      type: "mol",
      patient_id: 3,
      done: 0,
      positive_res: 0,
    };
    await request(server).put(`/swabs/1`).send(newSwab);
    const res = await request(server).get("/swabs/1");
    expect(res.body).toMatchObject({ ...newSwab, swab_id: 1 });
  });
});
describe("DEL /swabs", () => {
  beforeEach(() => (server = require("../build/index").default));
  afterEach(() => {
    server.close();
  });
  it("should return 404 after deleting a swab given ID", async () => {
    const newSwab = {
      team_id: 4,
      date: "2021-02-18 16:40",
      type: "mol",
      patient_id: 4,
      done: 0,
      positive_res: 0,
    };
    const {
      body: { id },
    } = await request(server).post(`/swabs/`).send(newSwab);
    await request(server).delete(`/swabs/${id}`);
    const res = await request(server).get(`/swabs/${id}`);
    expect(res.status).toBe(404);
    expect(res.text).toMatch("Swab not found");
  });
});
