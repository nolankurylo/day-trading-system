var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, action, username, funds, cb) => {
    timestamp = Math.floor(new Date().getTime());
    text = `insert into transactions (transactionnum, logtype, timestamp, server, action, username, funds)
    values ($1, 'accountTransaction', $2, 'own_server', $3, $4, $5)`
    values = [transactionNum, timestamp, action, username, funds]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  