const express = require('express');
const router = express.Router();
const AnswerService = require('../services/answer.service');
const answerService = new AnswerService();


router.post('/products', async (req, res) => {
  const {query} = req.body;
  const anwser = await answerService.getKeyWords(query);
  res.status(200).json({message: anwser});
});

router.post('/general-info', async (req, res) => {
  const {query} = req.body;
  const anwser = await answerService.testContext(query);
  res.status(200).json({message: anwser});
});

module.exports = router;
