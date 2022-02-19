var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, timestamp, command, username, stockSymbol, filename, funds, errorMessage) => {

    text = `insert into transactions (transactionnum, logtype, timestamp, server, command, username, stocksymbol, filename, funds, errormessage)
    values ($1, 'errorEvent', $2, 'own_server', $3, $4, $5, $6, $7, $8)`
    values = [transactionNum, timestamp, command, username, stockSymbol, filename, funds, errorMessage]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  