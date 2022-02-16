const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send({status: "Home page"}));

app.get('/status', (req, res) => res.send({status: "I'm alive!"}));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
