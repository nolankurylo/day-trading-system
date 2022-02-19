var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
var utils = require('../tools/utils');
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");
var dumplog = require('../tools/dumplog')

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


  // NEED STOCK SERVER QUOTE below usercommand
  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  price = "12.12"
  stockSymbol = req.body.StockSymbol
  funds = req.body.amount

  userCommand(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
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
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else if(funds > (result.rows[0].total_funds - result.rows[0].reserved_funds) || funds < price ){
          errorMessage = `Not enough funds`
          errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else{
          text = `update transactions set buy_state = 'UNCOMMITTED' where transactionnum = $1`
          values = [transactionNum]
          query(text, values, async (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            current_unix_time = Math.floor(new Date().getTime()); 
            return res.send({"success": true, "data": null, "message": "BUY successful, confirm or cancel"});
          })
        }
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
          errorMessage = `Most recent uncommited BUY exceeded 60 second time limit`
          errorEvent(transactionNum=transactionNum, command="COMMIT_BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else{
          accountTransaction(transactionNum=transactionNum, action="remove_buy", username=username, funds=funds, stockSymbol=stockSymbol, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            text = `update transactions set buy_state = 'COMMITTED' where transactionnum = $1`
            values = [buyTransactionNum]
            query(text, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": true, "data": null, "message": "COMMIT_BUY successful"});
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


  // NEED STOCK SERVER QUOTE below usercommand
  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  price = "12.12"
  stockSymbol = req.body.StockSymbol
  funds = req.body.amount

  userCommand(transactionNum=transactionNum, command="SELL", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
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
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else if(funds > (result.rows[0].total_funds - result.rows[0].reserved_funds) || funds < price ){
          errorMessage = `Not enough funds`
          errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": errorMessage});
          })
        }
        else{
          text = `update transactions set buy_state = 'UNCOMMITTED' where transactionnum = $1`
          values = [transactionNum]
          query(text, values, async (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            current_unix_time = Math.floor(new Date().getTime()); 
            return res.send({"success": true, "data": null, "message": "BUY successful, confirm or cancel"});
          })
        }
      })
    })
  })
});


router.post("/dumplog", 
  utils.getNextTransactionNumber,
  (req, res) => {
  filename = req.body.filename
  transactionNum = req.body.nextTransactionNum
  userCommand(transactionNum=transactionNum, command="DUMPLOG", username=null, stockSymbol=null, filename=filename, funds=null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    dumplog(null, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      return res.send({"success": true, "data": result, "message": "dumplog successful"});
    })
  })
});

router.post("/user_dumplog", 
  utils.getNextTransactionNumber,
  (req, res) => {
  username = req.body.userid
  filename = req.body.filename
  transactionNum = req.body.nextTransactionNum
  userCommand(transactionNum=transactionNum, command="DUMPLOG", username=username, stockSymbol=null, filename=filename, funds=null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    dumplog(username, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      return res.send({"success": true, "data": result, "message": "user dumplog successful"});
    })
  })
});

router.post("/display_summary", 
  utils.getNextTransactionNumber,
  (req, res) => {
  username = req.body.userid
  transactionNum = req.body.nextTransactionNum
  userCommand(transactionNum=transactionNum, command="DISPLAY_SUMMARY", username=username, stockSymbol=null, filename=null, funds=null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    // get history of transactions, buys, and sells
    return res.send({"success": true, "data": null, "message": "display summary successful"});
  })
});

module.exports = router;