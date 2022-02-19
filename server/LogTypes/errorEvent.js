var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, command, username, stockSymbol, filename, funds, errorMessage, cb) => {
    timestamp = Math.floor(new Date().getTime());
    if (command == "BUY"){
        text = `with a as (update transactions set buy_state = 'FAILED' where transactionnum = $1)
        insert into transactions (transactionnum, logtype, timestamp, server, command, username, stocksymbol, filename, funds, errormessage, buy_state)
        values ($1, 'errorEvent', $2, 'own_server', $3, $4, $5, $6, $7, $8, 'FAILED')`
        values = [transactionNum, timestamp, command, username, stockSymbol, filename, funds, errorMessage]
        query(text, values, async (err, result) => {
            return cb(err, result)
        })
    }
    else{
        text = `insert into transactions (transactionnum, logtype, timestamp, server, command, username, stocksymbol, filename, funds, errormessage)
        values ($1, 'errorEvent', $2, 'own_server', $3, $4, $5, $6, $7, $8)`
        values = [transactionNum, timestamp, command, username, stockSymbol, filename, funds, errorMessage]
        query(text, values, async (err, result) => {
            return cb(err, result)
        })
    }

    
}
  