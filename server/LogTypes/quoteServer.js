var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, price, stockSymbol, username, quoteServerTime, cryptoKey, cb) => {
    timestamp = Math.floor(new Date().getTime());
    text = `insert into transactions (transactionnum, logtype, timestamp, server, price, stocksymbol, username, quoteservertime, cryptokey)
    values ($1, 'quoteServer', $2, 'own_server', $3, $4, $5, $6, $7)`
    values = [transactionNum, timestamp, price, stockSymbol, username, quoteServerTime, cryptoKey]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  