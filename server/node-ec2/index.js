const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser')
const cors = require('cors')
const router = express.Router();


app.use('*', cors())
app.use(router);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.json());
app.use("/", require("./routes/get"));
app.use("/", require("./routes/post"));
app.use("/", require("./routes/patch"));
app.use("/", require("./routes/delete"));


app.listen(port, () => console.log(`Web Server listening on port ${port}!`));


