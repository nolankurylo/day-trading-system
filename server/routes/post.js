var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
var utils = require('../tools/utils');
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");
var quoteServer2 = require('../quoteServer/quote')
var quoteServer = require("../LogTypes/quoteServer")

/*
Request Body Parameters
@param userid
@param amount
*/
router.post("/add", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  funds = req.body.amount
  userCommand(transactionNum=transactionNum, command="ADD", username=username, stockSymbol=null, filename=null, funds=funds, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    accountTransaction(transactionNum=transactionNum, action="add", username=username, funds=funds, stockSymbol=null, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      return res.send({"success": true, "data": null, "message": "ADD successful"});
    })
  })
});



/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to buy of the stock
*/
router.post("/buy", 
  utils.getNextTransactionNumber,
  (req, res) => {
 
  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  stockSymbol = req.body.StockSymbol
  funds = req.body.amount

  quote = quoteServer2.getQuote(stockSymbol, username)
  price = quote.Quoteprice
  quoteServerTime = quote.timestamp
  cryptoKey = quote.cryptokey
  

  userCommand(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    quoteServer(transactionNum=transactionNum, price=price, stockSymbol=stockSymbol, username=username, quoteServerTime=quoteServerTime, cryptoKey=cryptoKey, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      systemEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        current_unix_time = Math.floor(new Date().getTime());
        text = `with a as ( select username as userid, sum(funds) as reserved_funds from transactions where username =$1 and buy_state ='UNCOMMITTED'and 
        logtype ='userCommand'and timestamp + 60000 > $2 GROUP by username ) select funds as total_funds, COALESCE(a.reserved_funds, 0) as 
        reserved_funds from user_funds natural left join a where userid =$1  `
        values = [username, current_unix_time]
        query(text, values, async (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          if (result.rowCount == 0){
            errorMessage = `Account ${username} does not exist`
            errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": quote, "message": errorMessage});
            })
          }
          else if(funds > (result.rows[0].total_funds - result.rows[0].reserved_funds) || funds < price ){
            errorMessage = `Not enough funds - Trying to buy $${funds} of stock $${stockSymbol} with only $${result.rows[0].total_funds - result.rows[0].reserved_funds} available funds`
            errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": quote, "message": errorMessage});
            })
          }
          else{
            text = `update transactions set buy_state = 'UNCOMMITTED', num_stocks = $2 where transactionnum = $1`
            values = [transactionNum, funds/price]
            query(text, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              current_unix_time = Math.floor(new Date().getTime()); 
              return res.send({"success": true, "data": quote, "message": "BUY successful, confirm or cancel"});
            })
          }
        })
      })
    })
  })
});


/*
Request Body Parameters
@param userid
*/
router.post("/commit_buy", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum

  text = `select * from transactions where username = $1 and logtype = 'userCommand' and buy_state = 'UNCOMMITTED' order by timestamp DESC`
  values = [username]
  query(text, values, async (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    if (result.rowCount == 0){
      errorMessage = `No uncommited BUYS for ${username}`
      userCommand(transactionNum=transactionNum, command="COMMIT_BUY", username=username, stockSymbol=null, filename=null, funds=null, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        errorEvent(transactionNum=transactionNum, command="COMMIT_BUY", username=username, stockSymbol=null, filename=null, funds=null, errorMessage=errorMessage, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          return res.send({"success": false, "data": null, "message": errorMessage});
        })
      })
    }
    else {
      stockSymbol=result.rows[0].stocksymbol
      funds=result.rows[0].funds
      buyTransactionNum = result.rows[0].transactionnum
      uncommited_buy_timestamp = parseInt(result.rows[0].timestamp)
      
      userCommand(transactionNum=transactionNum, command="COMMIT_BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        one_minute_unix = 60 * 1000
        current_unix_time = Math.floor(new Date().getTime());
        if(uncommited_buy_timestamp + one_minute_unix < current_unix_time ){
          errorMessage = `Most recent uncommitted BUY exceeded 60 second time limit`
          errorEvent(transactionNum=transactionNum, command="COMMIT_BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else{
          accountTransaction(transactionNum=transactionNum, action="commit_buy", username=username, funds=funds, stockSymbol=stockSymbol, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            text = `select price from transactions where transactionnum = $1 and logtype='quoteServer'`
            values = [buyTransactionNum]
            query(text, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              price=result.rows[0].price
              text = `with a as (update transactions set buy_state = 'COMMITTED' where transactionnum = $1),
                    up as (update user_stocks set num_stocks = num_stocks + $3 where userid = $2 and stocksymbol = $4)
                    insert into user_stocks (userid, num_stocks, stocksymbol) 
                    select $2, $3, $4 where not exists (select 1 from user_stocks where userid = $2 and stocksymbol = $4)`
              values = [buyTransactionNum, username, funds/price, stockSymbol]
              query(text, values, async (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"success": true, "data": null, "message": "COMMIT_BUY successful"});
              })
            })
          })
        }
      })
    }
  })
});


/*
Request Body Parameters
@param userid
*/
router.post("/cancel_buy", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum

  text = `select * from transactions where username = $1 and logtype = 'userCommand' and buy_state = 'UNCOMMITTED' order by timestamp DESC`
  values = [username]
  query(text, values, async (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    if (result.rowCount == 0){
      errorMessage = `No uncommited BUYS for ${username}`
      userCommand(transactionNum=transactionNum, command="CANCEL_BUY", username=username, stockSymbol=null, filename=null, funds=null, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        errorEvent(transactionNum=transactionNum, command="CANCEL_BUY", username=username, stockSymbol=null, filename=null, funds=null, errorMessage=errorMessage, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          return res.send({"success": false, "data": null, "message": errorMessage});
        })
      })
    }
    else {
      stockSymbol=result.rows[0].stocksymbol
      funds=result.rows[0].funds
      buyTransactionNum = result.rows[0].transactionnum
      uncommited_buy_timestamp = parseInt(result.rows[0].timestamp)
      
      userCommand(transactionNum=transactionNum, command="CANCEL_BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        one_minute_unix = 60 * 1000
        current_unix_time = Math.floor(new Date().getTime());
        if(uncommited_buy_timestamp + one_minute_unix < current_unix_time ){
          errorMessage = `Most recent uncommited BUY exceeded 60 second time limit`
          errorEvent(transactionNum=transactionNum, command="CANCEL_BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else{
          text = `update transactions set buy_state = 'CANCELLED' where transactionnum = $1`
          values = [buyTransactionNum]
          query(text, values, async (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": true, "data": null, "message": "CANCEL_BUY successful"});
          })
        }
      })
    }
  })
});




/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to sell of the stock
*/
router.post("/sell", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  stockSymbol = req.body.StockSymbol
  funds = req.body.amount

  quote = quoteServer2.getQuote(stockSymbol, username)
  price = quote.Quoteprice
  quoteServerTime = quote.timestamp
  cryptoKey = quote.cryptokey

  

  userCommand(transactionNum=transactionNum, command="SELL", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    quoteServer(transactionNum=transactionNum, price=price, stockSymbol=stockSymbol, username=username, quoteServerTime=quoteServerTime, cryptoKey=cryptoKey, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      systemEvent(transactionNum=transactionNum, command="SELL", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        text = `select * from user_stocks where userid = $1 and stocksymbol = $2`
        values = [username, stockSymbol]
        query(text, values, async (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          if (result.rowCount == 0){
            errorMessage = `No holdings for stock ${stockSymbol} exist for user ${username}`
            errorEvent(transactionNum=transactionNum, command="SELL", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": quote, "message": errorMessage});
            })
          }
          else if(funds > price * result.rows[0].num_stocks){
            errorMessage = `Not enough funds - Trying to sell $${funds} of stock $${stockSymbol} with only $${price * result.rows[0].num_stocks} available funds`
            errorEvent(transactionNum=transactionNum, command="SELL", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": quote, "message": errorMessage});
            })
          }
          else{
            dollar_holdings = price * result.rows[0].num_stocks
            text = `update transactions set sell_state = 'UNCOMMITTED' where transactionnum = $1`
            values = [transactionNum]
            query(text, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              current_unix_time = Math.floor(new Date().getTime()); 
              return res.send({"success": true, "data": quote, "message": "SELL successful, confirm or cancel"});
            })
          }
        })
      })
    })
  })
});





module.exports = router;