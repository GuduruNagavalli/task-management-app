const { app, initApp } = require('../server');

initApp().catch((error) => {
  console.warn('Could not connect to MongoDB during initialization:', error?.message || error);
});

module.exports = app;
