
require('dotenv').config()
const Pool = require('pg').Pool

if(process.env.NODE_ENV == "production"){
  ssl_value = {
    rejectUnauthorized: false
  }
}
else{
  ssl_value = false
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl_value

})

// queryDatabase(text, values, cb(err, result)) {
module.exports = async (text, values, cb) => {
  const client = await pool.connect()
  .catch((err) => {
    console.log("Failure to connect to pool: " + err)
  });

  await client.query(text, values, (err, result) => {
    client.release()
    return cb(err, result)
  })
}
