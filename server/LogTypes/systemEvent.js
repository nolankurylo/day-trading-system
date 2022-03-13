var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, command, username, stockSymbol, filename, funds, cb) => {
    timestamp = Math.floor(new Date().getTime());
    text = `insert into transactions (transactionnum, logtype, timestamp, server, command, username, stocksymbol, filename, funds)
    values ($1, 'systemEvent', $2, 'own_server', $3, $4, $5, $6, $7)`
    values = [transactionNum, timestamp, command, username, stockSymbol, filename, funds]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  