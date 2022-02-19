var query = require("../tools/queryDatabase");

module.exports = async (transactionNum, action, username, funds, stockSymbol, cb) => {
    timestamp = Math.floor(new Date().getTime());

    if(action == 'remove_buy'){
        text = `with a as (update user_funds set funds = funds - $5 where userid = $4),
        b as (insert into transactions (transactionnum, logtype, timestamp, server, action, username, funds)
        values ($1, 'accountTransaction', $2, 'own_server', $3, $4, $5)),
        up as (update user_stocks set amount = amount + $5 where userid = $4 and stocksymbol = $6)
        insert into user_stocks (userid, amount, stocksymbol) 
        select $4, $5, $6 where not exists (select 1 from user_stocks where userid = $4 and stocksymbol = $6)
        `
        values = [transactionNum, timestamp, 'remove', username, funds, stockSymbol]
        query(text, values, async (err, result) => {
            return cb(err, result)
        })
    }
    else if(action == 'add'){
        text = `with up as(update user_funds set funds = funds + $5
            where userid = $4),
            sert as (insert into user_funds (userid, funds) 
            select $4, $5 where not exists (select 1 from user_funds where 
            userid = $4))
            insert into transactions (transactionnum, logtype, timestamp, server, action, username, funds)
        values ($1, 'accountTransaction', $2, 'own_server', $3, $4, $5)`
        values = [transactionNum, timestamp, action, username, funds]
        query(text, values, async (err, result) => {
            return cb(err, result)
        })
    }
    else{ // default == remove
        text = `insert into transactions (transactionnum, logtype, timestamp, server, action, username, funds)
        values ($1, 'accountTransaction', $2, 'own_server', $3, $4, $5)`
        values = [transactionNum, timestamp, action, username, funds]
        query(text, values, async (err, result) => {
            return cb(err, result)
        })
    } 
}
  