import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import * as mongoose from "mongoose";


let app: INestApplication;
let DB: any;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  DB = await mongoose.connect(process.env.DB_URI_LOCAL);
  await DB.connection.db.dropDatabase();
});

afterAll(async () => {
  await DB.connection.db.dropDatabase();
  await mongoose.disconnect();
});


describe("AuthController (e2e)", () => {
  const user = {
    name: "Tom",
    email: "tom@gmail.com",
    password: "12345678"
  };


  it("(POST) - register a new user", () => {
    return request(app.getHttpServer())
      .post("/auth/signup")
      .send(user)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
      });
  });

  it("(POST) - login user", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(200)
      .then((res) => {
        expect(res.body.token).toBeDefined();
      });
  });

  it("(POST) - login user - should throw invalid email error", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "invalid@gmail.com", password: user.password })
      .expect(401);
  });

  it("(POST) - login user - should throw invalid password error", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password: "invalid.password" })
      .expect(401);
  });

});
