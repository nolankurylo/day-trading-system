
require('dotenv').config()
const Pool = require('pg').Pool


module.exports = async (text, values, cb) => {

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
