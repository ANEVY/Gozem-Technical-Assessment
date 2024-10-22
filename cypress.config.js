const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://restful-booker.herokuapp.com",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    env: {
      username: "admin",
      password: "password123",
    },
  },
});
