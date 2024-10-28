// import * as allure from "allure-js-commons";
describe("Restful Booker API - CRUD Operations positive testing", () => {
  let bookingId; // To store the ID of the created booking
  let apiData;
  before(function () {
    // Load test data from a fixture file
    cy.fixture("apiData").then((data) => {
      apiData = data;
    });
  });

  it("Create a Booking", function () {
    cy.request({
      method: "POST",
      url: "/booking",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        firstname: apiData?.firstname || "John",
        lastname: apiData?.lastname || "Cornors",
        totalprice: apiData?.totalprice || 1000,
        depositpaid: apiData?.depositpaid || true,
        bookingdates: {
          checkin: apiData?.checkin || "2024-10-25",
          checkout: apiData?.checkout || "2024-10-30",
        },
        additionalneeds: apiData?.additionalneeds || "Dinner",
      },
    }).then(function (response) {
      // Verify the response
      expect(response.status).to.eq(200);
      // Save bookingId for later tests
      bookingId = response.body?.bookingid;
    });
  });
  it("Get the Created Booking", function () {
    cy.request({
      method: "GET",
      url: `/booking/${bookingId}`,
    }).then(function (response) {
      expect(response.status).to.eq(200);
      expect(response.body.firstname).to.eq(apiData?.firstname);
      expect(response.body.lastname).to.eq(apiData?.lastname);
    });
  });

  it("Update the booking (change checkout date and additional needs)", function () {
    cy.request({
      method: "PUT",
      url: `/booking/${bookingId}`,
      auth: {
        username: Cypress.env("username"),
        password: Cypress.env("password"),
      },
      body: {
        firstname: apiData?.firstname || "John",
        lastname: apiData?.lastname || "Cornors",
        totalprice: apiData?.totalprice || 1000,
        depositpaid: apiData?.depositpaid || true,
        bookingdates: {
          checkin: apiData?.checkin || "2024-10-25",
          checkout: apiData?.updatedCheckout || "2024-10-30",
        },
        additionalneeds: apiData?.updatedAdditionalNeeds || "Dinner",
      },
    }).then(function (response) {
      expect(response.status).to.eq(200);
      expect(response.body.bookingdates.checkout).to.eq(
        apiData?.updatedCheckout
      );
      expect(response.body.additionalneeds).to.eq(
        apiData?.updatedAdditionalNeeds
      );
    });
  });

  it("Delete the booking", function () {
    cy.request({
      method: "DELETE",
      url: `/booking/${bookingId}`,
      auth: {
        username: Cypress.env("username"),
        password: Cypress.env("password"),
      },
    }).then(function (response) {
      expect(response.status).to.eq(201);
    });
  });
});

describe("Restful Booker API - CRUD Operations negative testing", () => {
  let bookingId; // To store the ID of the created booking
  let apiData;
  before(function () {
    // Load test data from a fixture file
    cy.fixture("apiData").then((data) => {
      apiData = data;
    });
  });

  //Create a new context for negative testing
  it("Create a Booking with invalid data", function () {
    cy.request({
      method: "POST",
      url: "/booking",
      failOnStatusCode: false,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        firstname: apiData?.firstname || "John",
        lastname: 100, // last name has to be string
      },
    }).then(function (response) {
      // Verify the response
      expect(response.status).to.eq(500);
      expect(response.body).to.contain("Internal Server Error");
    });
  });
  it("Get the Booking data for an invalid ID", function () {
    cy.request({
      method: "GET",
      url: `/booking/${apiData.invalidBookingId}`, //invalid ID
      failOnStatusCode: false,
    }).then(function (response) {
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.eq(404);
      expect(response.body).to.contain("Not Found");
    });
  });
  it("Update the booking (change checkout date and additional needs) without authenticating", function () {
    cy.request({
      method: "PUT",
      url: `/booking/${bookingId}`,
      failOnStatusCode: false,
      body: {
        firstname: apiData?.firstname || "John",
        lastname: apiData?.lastname || "Cornors",
        totalprice: apiData?.totalprice || 1000,
        depositpaid: apiData?.depositpaid || true,
        bookingdates: {
          checkin: apiData?.checkin || "2024-10-25",
          checkout: apiData?.updatedCheckout || "2024-10-30",
        },
        additionalneeds: apiData?.updatedAdditionalNeeds || "Dinner",
      },
    }).then(function (response) {
      expect(response.status).to.eq(403);
      expect(response.body).to.contain("Forbidden");
    });
  });
  it("Update the booking (change checkout date and additional needs) with invalid checkout date", function () {
    cy.request({
      method: "PUT",
      url: `/booking/${bookingId}`,
      failOnStatusCode: false,
      auth: {
        username: Cypress.env("username"),
        password: Cypress.env("password"),
      },
      body: {
        bookingdates: {
          checkout: 20241025,
        },
        additionalneeds: apiData?.updatedAdditionalNeeds || "Dinner",
      },
    }).then(function (response) {
      expect(response.status).to.eq(400);
      expect(response.body).to.contain("Bad Request");
    });
  });
  it("Delete booking without authenticating", function () {
    cy.request({
      method: "DELETE",
      url: `/booking/${bookingId}`,
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.eq(403);
      expect(response.body).to.contain("Forbidden");
    });
  });
  it("Delete booking for an invalid ID", function () {
    cy.request({
      method: "DELETE",
      url: `/booking/${apiData.invalidBookingId}`,
      failOnStatusCode: false,
      auth: {
        username: Cypress.env("username"),
        password: Cypress.env("password"),
      },
    }).then(function (response) {
      expect(response.status).to.eq(405);
      expect(response.body).to.contain("Method Not Allowed");
    });
  });
});
