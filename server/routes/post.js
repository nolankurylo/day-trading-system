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

  text = `with upsert as(update user_funds set funds = funds + $2
    where userid = $1)
    insert into user_funds (userid, funds) 
    select $1, $2 where not exists (select 1 from user_funds where 
    userid = $1);`
  values = [username, req.body.funds]
  query(text, values, async (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    text = `select * from user_funds where userid = $1`
    values = [username]
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        funds = 0
      }
      else{
        funds = result.rows[0].funds
      }
      if (err) return dbFail.failSafe(err, res);
      userCommand(transactionNum=transactionNum, command="ADD", username=username, stockSymbol=null, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        accountTransaction(transactionNum=transactionNum, action="add", username=username, funds=funds, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          return res.send({"new_funds": funds});
        })
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
// router.post("/buy", 
//   utils.getNextTransactionNumber,
//   (req, res) => {


//   timestamp = Math.floor(new Date().getTime());
//   username = req.body.userid
//   transactionNum=req.body.nextTransactionNum
//   price = "12.12"
//   stockSymbol = req.body.stocksymbol

//   text = `select * from user_funds where userid = $1`
//   values = [username]
//   query(text, values, async (err, result) => {
//     if (err) return dbFail.failSafe(err, res);
//     if (result.rowCount == 0){
//       errorEvent(transactionNum=transactionNum, timestamp=timestamp, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
//         if (err) return dbFail.failSafe(err, res);
//         return res.send({"Command: BUY": "errorEvent"});
//       })
//     }
//     else if(result.rows[0].funds < price){
//       //error event - not enough funds
//     }
//     else{
//       funds = result.rows[0].funds
//       userCommand(transactionNum=transactionNum, timestamp=timestamp, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
//         if (err) return dbFail.failSafe(err, res);
//         systemEvent(transactionNum=transactionNum, timestamp=timestamp, command="BUY", username=username, stockSymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
//           if (err) return dbFail.failSafe(err, res);
//           return res.send({"Command: BUY": "userCommand, systemEvent"});
//         })
//       })

//     }
//   })
// });


/*
Request Body Parameters
@param userid
@param stockSymbol
@param amount
@
*/
router.post("/set_buy_amount", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='SET_BUY_AMOUNT'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    buy_amount=req.body.amount
    get_funds = `select * from user_funds where userid = $1`
    stock_symbol = req.body.stockSymbol
    //Check user has enough holdings
    query(get_funds, [username], async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        funds = 0
      }
      else {
        account_funds = result.rows[0].funds
        if (account_funds >= buy_amount){
          //Create entry in buy table & user command log 
          create_buy = `insert into buys (userid,stockSymbol,is_active,buy_amount)
            values ($1,$2,$3,$4);`
          values = [username,stock_symbol,false,buy_amount]
          query(create_buy, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              userCommand(transactionNum,command,username,stock_symbol,null,buy_amount, (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                //Decrement user holdings & account transaction log
                subtract_holdings = `update user_funds set funds = funds - $2
                where userid = $1`
                query(subtract_holdings, [username,buy_amount], (err, result) => {
                  if (err) return dbFail.failSafe(err, res);
                  accountTransaction(transactionNum,'remove',username,buy_amount, (err, result) => {
                    if (err) return dbFail.failSafe(err, res);
                    return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "accountTransaction"]});
                  })
                })
              })
            }) 
        } else {
          //User command and error log
          userCommand(transactionNum,command,username,stock_symbol,null,buy_amount, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            // errorEvent(transactionNum,command,username,stock_symbol,null,amount,"InsufficientFunds",(err, result) => {
            //   if (err) return dbFail.failSafe(err, res);
            // })
          })

        }
      }
    })
});

/*
Request Body Parameters
@param userid
@param stockSymbol
@
*/
router.post("/cancel_set_buy", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='CANCEL_SET_BUY'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    find_buy = `select * from buys where userid = $1 and stockSymbol = $2`
    stock_symbol = req.body.stockSymbol
    //Check if a Set Buy exists for user and stock
    query(find_buy, [username,stock_symbol], async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        userCommand(transactionNum,command,username,stock_symbol,null,null, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
        // errorEvent(transactionNum,command,username,stock_symbol,null,amount,"InsufficientFunds",(err, result) => {
        //   if (err) return dbFail.failSafe(err, res);
        // })
        })
      }
      else {
        buy_amount = result.rows[0].buy_amount
        id = result.rows[0].buy_trigger_id
        // delete from buys table
        delete_query = `delete from buys 
        where buy_trigger_id = $1`
        query(delete_query,[id],async (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          //User Command Log
          userCommand(transactionNum,command,username,stock_symbol,null,null, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            //Increment user holdings & account transaction log
            reset_funds = `update user_funds set funds = funds + $2
            where userid = $1`
            query(reset_funds, [username,buy_amount], (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              accountTransaction(transactionNum,'add',username,buy_amount, (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "accountTransaction"]});
              })
            })
          })
        })
      }
    })
});

module.exports = router;