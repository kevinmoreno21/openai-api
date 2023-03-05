const  db = require('./conexion.js')
const mathjs = require('mathjs');

const GptService = require('../services/gpt.service');
const gptService = new GptService();

class AnswerService{

  constructor(){
    this.anwser = '';
  }


  async vectorSimilarity(x, y){
    return mathjs.dot(x, y);
  }


  async orderDocumentSectionByQuerySimilarity(query, contexts){
    console.log("orderDocumentSectionByQuerySimilarity");
    const queryEmbedding = await gptService.getEmbedding(query);
    // console.log(contexts, "contexts");
    // console.log('queryEmbedding', contexts[0].embedding);
    const documenSimilarity = Object.entries(contexts).map(async ([docIndex, docEmbedding ]) => {
      // console.log('queryEmbedding', JSON.parse(docEmbedding.embedding));
      // const similarity = await vectorSimilarity(queryEmbedding, JSON.parse(docEmbedding.embedding));
      // console.log(similarity, "similarity");
      return {
        similarity: await this.vectorSimilarity(queryEmbedding, JSON.parse(docEmbedding.embedding)),
        docIndex: docIndex,
        title: docEmbedding.title,
        content: docEmbedding.description,
      };
    }
    );
    let finish = await Promise.all(documenSimilarity);
    finish = finish.sort((a, b) => b.similarity - a.similarity);
    // console.log(finish, "finish");
    return finish;
  }

  // async getData(){
  //   // actual date in format to save in db mysql
  //   const date = new Date();
  //   const fecha_creacion = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  //   const fecha_mod = fecha_creacion;
  //   console.log(fecha_creacion, fecha_mod);
  //     const embedding = await gptService.getEmbedding("description");
  //     console.log(embedding);
  //     // const data = db.collection('data').get();
  //     data.forEach(async (item) => {
  //         const { categoria, title, description } = item;
  //         // console.log(title, description);
  //         const embedding = await gptService.getEmbedding(description);
  //         console.log(embedding);
  //         // Consulta con ? como marcadores de posición
  //       const sql = 'INSERT INTO general_info (category, title, description, embedding, fecha_creacion, fecha_mod, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)';
  //       const values = [categoria, title, description, JSON.stringify(embedding), fecha_creacion, fecha_mod, JSON.stringify(item)];
  //       execPool(sql, values);
  //     });
  //     // return data;
  // }

  async execPool(sql, values, query){
    const [result, fields] = await db.query(sql, []);
    console.log('result',result);
    return this.compareData(result, query);
  }

  async compareData(contexts, query){
    let context = await this.orderDocumentSectionByQuerySimilarity(query, contexts)
    context = context.map((item) => {
      return item.content;
    }).slice(0, 3);
    console.log(context);
    // context
    let prompt = this.generatePrompt(query, context);
    return this.getAnswer(prompt);
  }

  async testContext(query) {
    return this.execPool('SELECT * FROM general_info', [], query);

  }

  generatePrompt(query, context) {
    let prompt =  `Responde de forma concisa y clara a la pregunta "${query}" usando las siguientes notas:
    Notas: '${context[0]}' '${context[1]}' y '${context[2]}'`;
    console.log(prompt);
    return prompt;
  }

  generatePromptQuery(query, context) {
    let prompt =  `Responde de forma concisa y clara como si fueras un vendedor a la pregunta "${query}" usando las siguientes notas:
    Notas: '`;
    context.forEach((item) => {
      for (const key in item) {
        prompt += `${key} : "${item[key]}", `;
      }
      prompt = prompt.slice(0, -2);
      prompt += `|`;
    });
    prompt+= `'`;
    prompt = prompt.slice(0, -2);
    prompt= prompt += `Responde con la siguiente estructura: "nombre del producto : precio del producto y si hay delivery", adicional a eso, da una breve descripcion del producto  .`;
    // console.log(prompt);
    return prompt;
  }


  async getProducts(values){
    values = values.split(';');
    // console.log(values);
    let like = '';
    values.forEach((value) => {
      value.split(' ').forEach((word) => {
        if (word != '') {
          like = like + `nombre like '%${word.trim()}%' or descripcion like '%${word.trim()}%' or `;
        }
      });
      // like = like + `nombre like '%${value.trim()}%' or categoria like '%${value.trim()}%' or descripcion like '%${value.trim()}%' or `;
    });
    like = like.slice(0, -3);
    let sql = 'SELECT categoria, SKU, nombre, descripcion, precio, stock FROM productos where '+like;
    // console.log(sql);

    return db.query(sql, []);
  }

  async getAnswer(prompt){
    try {
      const completion = await gptService.execCreateCompletion(prompt);
      console.log(completion.data.choices[0].text);
      return completion.data.choices[0].text;
      // res.status(200).json({ result: completion.data.choices[0].text });
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        // res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        // res.status(500).json({
        //   error: {
        //     message: 'An error occurred during your request.',
        //   }
        // });
      }
    }
  }


  async getKeyWords(text) {
    // const keywords = text.split(' ');
    // return keywords;
    let prompt = `Dame palabras clave que pueda usar para filtrar en una query para la pregunta "${text}" y separalos con un ';' .`;
    const completion = await gptService.execCreateCompletion(prompt);
    // console.log(completion.data.choices[0]);
    let answer = completion.data.choices[0].text;
    console.log(answer);

    return this.getProducts(answer)
    .then(([rows, fields]) => {
      // console.log(rows); // Resultado de la consulta
      let prompt = this.generatePromptQuery(text, rows);
      // console.log(prompt);
      return this.getAnswer(prompt);
    })
    .catch((error) => {
      console.log(error); // Error en caso de fallo
    })
    .finally(() => {
      // Liberar la conexión del pool
      db.end();
    });
  }


}

module.exports = AnswerService;
