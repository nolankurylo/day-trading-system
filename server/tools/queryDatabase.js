
require('dotenv').config()
const Pool = require('pg').Pool
const getSecrets = require('../tools/secrets')


module.exports = async (text, values, cb) => {

  const secrets =  JSON.parse(getSecrets.response.data.SecretString)
  const pool = new Pool({
    connectionString: secrets.DATABASE_URL,
    ssl: false
  
  })
  const client = await pool.connect()
  .catch((err) => {
    console.log("Failure to connect to pool: " + err)
  });

  await client.query(text, values, (err, result) => {
    client.release()
    return cb(err, result)
  })
}
