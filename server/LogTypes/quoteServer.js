var query = require("../tools/queryDatabase");

module.exports = async (timestamp, price, stockSymbol, username, quoteServerTime, cryptoKey, cb) => {

    text = `insert into transactions (logtype, transaction_timestamp, server_name, price, stocksymbol, userid, quoteservertime, cryptokey)
    values ('quoteServer', $1, 'own_server', $2, $3, $4, $5, $6)`
    values = [timestamp, price, stockSymbol, username, quoteServerTime, cryptoKey]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  