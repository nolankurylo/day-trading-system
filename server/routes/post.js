var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
var utils = require('../tools/utils');
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");

router.post("/console_test", (req, res) => {
  return res.send({"API received": req.body});
});


/*
Request Body Parameters
@param userid
@param funds
*/
router.post("/add", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  funds = req.body.funds
  userCommand(transactionNum=transactionNum, command="ADD", username=username, stockSymbol=null, filename=null, funds=funds, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    accountTransaction(transactionNum=transactionNum, action="add", username=username, funds=funds, (err, result) => {
      if (err) return dbFail.failSafe(err, res);

      text = `with upsert as(update user_funds set funds = funds + $2
        where userid = $1)
        insert into user_funds (userid, funds) 
        select $1, $2 where not exists (select 1 from user_funds where 
        userid = $1);`
      values = [username, req.body.funds]

      query(text, values, async (err, result) => {
        return res.send({"Commands Executed: ADD": ["userCommand", "accountTransaction"]});
      })
    })
  })
});



/*
Request Body Parameters
@param userid
@param stocksymbol
@param amount - that the user wants to buy of the stock
*/
router.post("/buy", 
  utils.getNextTransactionNumber,
  (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  price = "12.12"
  stockSymbol = req.body.stocksymbol
  funds = req.body.amount

  userCommand(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    
    systemEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      text = `select * from user_funds where userid = $1`
      values = [username]
      query(text, values, async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
          errorMessage = `Account ${username} does not exist`
          errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: BUY": ["userCommand", "systemEvent", "errorEvent"]});
          })
        }
        else if(funds > result.rows[0].funds || result.rows[0].funds < price ){
          errorMessage = `Not enough funds`
          errorEvent(transactionNum=transactionNum, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, errorMessage=errorMessage, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: BUY": ["userCommand", "systemEvent", "errorEvent"]});
          })
        }
        else{
          return res.send({"Commands Executed: BUY": ["userCommand", "systemEvent"]});
        }
      })
    })
  })
});


module.exports = router;