const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      // on('before:browser:launch', (browser = {}, launchOptions) => {
      //   /* ... */
      // })
    },
    baseUrl: 'https://dev.pangolin.exchange/#',
    supportFile: false,
  },
});
