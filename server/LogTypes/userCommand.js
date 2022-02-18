var query = require("../tools/queryDatabase");

module.exports = async (timestamp, command, username, stockSymbol, filename, funds, cb) => {

    text = `insert into transactions (logtype, transaction_timestamp, server_name, command, userid, stocksymbol, file_name, funds)
    values ('userCommand', $1, 'own_server', $2, $3, $4, $5, $6)`
    values = [timestamp, command, username, stockSymbol, filename, funds]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  
  