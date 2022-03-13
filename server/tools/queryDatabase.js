
require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false

})

module.exports = async (text, values, cb) => {

  const client = await pool.connect()
  .catch((err) => {
    console.log("Failure to connect to pool: " + err)
  });

  await client.query(text, values, (err, result) => {
    client.release()
    if(err){
      console.log(text)
      console.log(values)
    }
    return cb(err, result)
  })
}
