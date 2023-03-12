const express = require('express');
const router = express.Router();
const AnswerService = require('../services/answer.service');
const answerService = new AnswerService();
const {WebhookClient} = require('dialogflow-fulfillment');

router.post('/products', async (req, res) => {
  const data= req.body;
  console.log(data);
  const anwser = await answerService.getKeyWords(data.queryResult.queryText);
  res.status(200).json({
    fulfillmentMessages: [
      {
        text: {
          text: [
            anwser
          ]
        }
      }
    ]
  });
});

router.post('/general-info', async (req, res) => {
  const data = req.body;
  console.log(data);
  const anwser = await answerService.testContext(data.queryResult.queryText);
  res.status(200).json({
    fulfillmentMessages: [
      {
        text: {
          text: [
            anwser
          ]
        }
      }
    ]
  });
});

router.post('/webhook', async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  async function ConsultaProducto(agent) {
    const data = req.body;
    const anwser = await answerService.testContext(data.queryResult.queryText);
    agent.add(anwser);
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Default Fallback Intent', ConsultaProducto);
  agent.handleRequest(intentMap);
});

module.exports = router;
