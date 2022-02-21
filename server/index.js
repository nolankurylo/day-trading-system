const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser')
const cors = require('cors')
const router = express.Router();
var AWS = require('aws-sdk')
const fs = require('fs');

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


if (!fs.existsSync('./.env')){

  region = "ca-central-1"
  secretName = "seng468-secrets"
  var client = new AWS.SecretsManager({
      region: region
  });

  client.getSecretValue({SecretId: secretName}, function(err, data) {
          if(err) console.log(err)
          file_content =''
          for (const [key, value] of Object.entries(JSON.parse(data['SecretString']))) {
              file_content+=key+'='+value+'\n'
              process.env[key] = value
          }
          fs.writeFile('.env', file_content, err => {
            if (err) {
              console.error(err)
              return
            }
            app.listen(port, () => console.log(`.env created, Web Server listening on port ${port}!`));
          })
      })
} else {
  app.listen(port, () => console.log(`Web Server listening on port ${port}!`));
}

