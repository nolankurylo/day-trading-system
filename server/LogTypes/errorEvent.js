var query = require("../tools/queryDatabase");

module.exports = async (timestamp, command, username, stockSymbol, filename, funds, errorMessage) => {

    text = `insert into transactions (logtype, transaction_timestamp, server_name, command, userid, stocksymbol, filename, funds, errormessage)
    values ('errorEvent', $1, 'own_server', $2, $3, $4, $5, $6, $7)`
    values = [timestamp, command, username, stockSymbol, filename, funds, errorMessage]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  