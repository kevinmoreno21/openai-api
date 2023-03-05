const express = require('express');

const gptRouter = require('./gpt.router');

function routersApi(app) {
  const router = express.Router();
  app.use('/api/v1', router);
  router.use('/gpt', gptRouter);

}

module.exports = routersApi;
