const express = require('express');
const router = express.Router();
const AnswerService = require('../services/answer.service');
const answerService = new AnswerService();


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

module.exports = router;
