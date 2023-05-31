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


describe("Restaurant (e2e)", () => {
  const user = {
    name: "Tom",
    email: "tom@gmail.com",
    password: "12345678"
  };

  const newRestaurant = {
    category: "Fast Food",
    address: "200 Olympic Dr, Stafford, VS, 22554",
    phoneNo: 9788246116,
    email: "ghulam@gamil.com",
    description: "This is just a description",
    name: "Restaurant 4"
  };

  let jwtToken;
  let restaurantCreated;


  it("(POST) - register a new user", () => {
    return request(app.getHttpServer())
      .post("/auth/signup")
      .send(user)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        jwtToken = res.body.token;
      });
  });


  it("(POST) - creates a new restaurant", () => {
    return request(app.getHttpServer())
      .post("/restaurants")
      .set("Authorization", "Bearer " + jwtToken)
      .send(newRestaurant)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.name).toEqual(newRestaurant.name);
        restaurantCreated = res.body;
      });
  });


  it("(GET) - get all restaurants", () => {
    return request(app.getHttpServer())
      .get("/restaurants")
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toEqual(restaurantCreated);
      });
  });


  it("(GET) - get restaurant by ID", () => {
    return request(app.getHttpServer())
      .get(`/restaurants/${restaurantCreated._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toEqual(restaurantCreated._id);
      });
  });


  it("(PUT) - update restaurant by ID", () => {
    return request(app.getHttpServer())
      .put(`/restaurants/${restaurantCreated._id}`)
      .set("Authorization", "Bearer " + jwtToken)
      .send({ name: "Updated name" })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toEqual("Updated name");
      });
  });


  it("(DELETE) - delete restaurant by ID", () => {
    return request(app.getHttpServer())
      .delete(`/restaurants/${restaurantCreated._id}`)
      .set("Authorization", "Bearer " + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.deleted).toEqual(true);
      });
  });


  it("(GET) - get restaurant by ID - 404 Error", () => {
    return request(app.getHttpServer())
      .get(`/restaurants/${restaurantCreated._id}`)
      .expect(404);
  });


  it("(GET) - get all restaurants", () => {
    return request(app.getHttpServer())
      .get("/restaurants")
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(0);
        expect(res.body).toEqual([]);
      });
  });

});
