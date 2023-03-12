const express = require('express');
const routersApi = require('./routes');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/nueva-ruta', (req, res) => {
  res.send('Hola, soy una nueva ruta!');
});

routersApi(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
