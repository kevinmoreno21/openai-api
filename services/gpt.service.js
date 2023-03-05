const { Configuration, OpenAIApi  } = require("openai");
const  db = require('./conexion.js')
const mathjs = require('mathjs');

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);
const EMOTION_MODEL = 'text-embedding-ada-002';

class GptService{

  constructor(){
    this.anwser = '';
  }


  async getEmbedding(text){
    console.log("getEmbedding");
    try {
      let response = await openai.createEmbedding({
        model: EMOTION_MODEL,
        input: text,
      });
      if (response.error || response?.data?.error) {
        console.log("error", response);
        if (response.status === 429) {
          console.log("Too many requests");
          let i = 0;
          let second = 3000;
          let times = 5;
          while (i < times) {
            await new Promise((resolve) => setTimeout(resolve, second));
            response = await openai.createEmbedding({
              model: EMOTION_MODEL,
              input: text,
            });
            if (!(response.error || response?.data.error)) {
              break;
            }
            i++;

            if (i == times) {
              return { error: response?.error || response?.data?.error };
            }
          }
        }
      }
      return response.data.data[0].embedding;
    } catch (error) {
      console.log("error", error);
      return { error: error };
    }
  };

  execCreateCompletion(prompt){
    return openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 1000,
      n: 1,
      stop: null,
      temperature: 0.5
    });
  }
}
module.exports = GptService;
