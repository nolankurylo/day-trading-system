var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
var utils = require('../tools/utils');
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");


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


/*
Request Body Parameters
@param userid
@param stockSymbol
@param amount
*/
router.post("/set_buy_amount", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='SET_BUY_AMOUNT'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    buy_amount=req.body.amount
    stock_symbol = req.body.StockSymbol
    userCommand(transactionNum,command,username,stock_symbol,null,buy_amount, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      //Check user has enough holdings
      get_funds = `with buy_amounts as (select SUM(buy_amount) as buy_amount from buys where userid = $1 and stockSymbol = $2)
      select COALESCE(funds,0) + COALESCE(buy_amount,0) as total_funds from user_funds, buy_amounts;`
      query(get_funds, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
          errorEvent(transactionNum,command,username,stock_symbol,null,buy_amount,"Insufficient Funds",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "errorEvent"]});
          })
        }
        else {
          account_funds = result.rows[0].total_funds
          if (account_funds >= buy_amount){
            //upsert into buy table & user command log 
            create_buy = `with upsert as(update buys set buy_amount = $1
              where userid = $2 and stocksymbol = $3)
              insert into buys (userid, buy_amount, is_active, stocksymbol) 
              select $2, $1, $4, $3 where not exists 
              (select 1 from buys where userid = $2 and stocksymbol = $3)`
            values = [buy_amount,username,stock_symbol,false]
            query(create_buy, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              //Decrement user holdings & account transaction log
              subtract_holdings = `update user_funds set funds = funds - $2
              where userid = $1`
              query(subtract_holdings, [username,buy_amount], (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                accountTransaction(transactionNum,'remove',username,buy_amount,null, (err, result) => {
                  if (err) return dbFail.failSafe(err, res);
                  return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "accountTransaction"]});
                })
              })
            })
          } else {
            //error log
            errorEvent(transactionNum,command,username,stock_symbol,null,buy_amount,"Insufficient Funds",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "errorEvent"]});
            })
          }
        }
      })
    })
  }
);

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
router.post("/cancel_set_buy", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='CANCEL_SET_BUY'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    stock_symbol = req.body.StockSymbol
    find_buy = `select * from buys where userid = $1 and stockSymbol = $2`
    //Check if a Set Buy exists for user and stock
    query(find_buy, [username,stock_symbol], async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        userCommand(transactionNum,command,username,stock_symbol,null,null, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          errorEvent(transactionNum,command,username,stock_symbol,null,null,"No Buy To Cancel",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: CANCEL_SET_BUY": ["userCommand", "errorEvent"]});
          })
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
              accountTransaction(transactionNum,'add',username,buy_amount,null, (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"Commands Executed: CANCEL_SET_BUY": ["userCommand", "accountTransaction"]});
              })
            })
          })
        })
      }
    })
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amounnt
*/
router.post("/set_buy_trigger", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='SET_BUY_TRIGGER'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    stock_symbol=req.body.StockSymbol
    trigger_amount=req.body.amount
    find_buy=`select * from buys where userid = $1 and stockSymbol = $2`
    //Check if a Set Buy exists for user and stock
    query(find_buy, [username,stock_symbol], async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        userCommand(transactionNum,command,username,stock_symbol,null,trigger_amount, (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          errorEvent(transactionNum,command,username,stock_symbol,null,trigger_amount,"No Buy To Set a Trigger",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: SET_BUY_TRIGGER": ["userCommand", "errorEvent"]});
          })
        })
      }
      else {
        id = result.rows[0].buy_trigger_id
        // update buy table with trigger amount
        update_query = `update buys set 
        buy_trigger_threshold = $2,
        is_active = $3
        where buy_trigger_id = $1`
        query(update_query,[id,trigger_amount,true],async (err, result) => {
          if (err) return dbFail.failSafe(err, res);
          //User Command Log
          userCommand(transactionNum,command,username,stock_symbol,null,trigger_amount, (err, result) => {
            if (err) return dbFail.failSafe(err, res);
              return res.send({"Commands Executed: SET_BUY_TRIGGER": ["userCommand"]});
          })
        })
      }
    })
})



/*
Request Body Parameters
@param userid
@param stockSymbol
@param amount
*/
router.post("/set_sell_amount", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='SET_SELL_AMOUNT'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    sell_amount=req.body.amount
    stock_symbol = req.body.StockSymbol
    userCommand(transactionNum,command,username,stock_symbol,null,sell_amount, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      //Check user has enough holdings
      get_stocks = `select amount from user_stocks where userid = $1 and stockSymbol = $2;`
      query(get_stocks, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
          errorEvent(transactionNum,command,username,stock_symbol,null,sell_amount,"Insufficient Stocks",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "errorEvent"]});
          })
        }
        else {
          stock_amount = result.rows[0].amount
          if (stock_amount >= sell_amount){
            //upsert into buy table & user command log 
            create_sell = `with upsert as(update sells set sell_amount = $1
              where userid = $2 and stocksymbol = $3)
              insert into sells (userid, sell_amount, is_active, stocksymbol) 
              select $2, $1, $4, $3 where not exists 
              (select 1 from sells where userid = $2 and stocksymbol = $3)`
            values = [sell_amount,username,stock_symbol,false]
            query(create_sell, values, async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              //account transaction log
              accountTransaction(transactionNum,'remove',username,sell_amount,null, (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "accountTransaction"]});
              })
            })
          } else {
            //error log
            errorEvent(transactionNum,command,username,stock_symbol,null,sell_amount,"Insufficient Stocks",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"Commands Executed: SET_BUY_AMOUNT": ["userCommand", "errorEvent"]});
            })
          }
        }
      })
    })
  }
);

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amounnt
*/
router.post("/set_sell_trigger", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='SET_SELL_TRIGGER'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    stock_symbol=req.body.StockSymbol
    trigger_amount=req.body.amount

    userCommand(transactionNum,command,username,stock_symbol,null,trigger_amount, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      //Check if a Set Buy exists for user and stock
      find_sell=`select * from sells where userid = $1 and stockSymbol = $2`
      query(find_sell, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
            errorEvent(transactionNum,command,username,stock_symbol,null,trigger_amount,"No Sell To Set a Trigger",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"Commands Executed: SET_SELL_TRIGGER": ["userCommand", "errorEvent"]});
            })
        }
        else {
          id = result.rows[0].buy_trigger_id
          // update buy table with trigger amount
          update_query = `update sells set 
          sell_trigger_threshold = $2,
          is_active = $3
          where sell_trigger_id = $1`
          query(update_query,[id,trigger_amount,true],async (err, result) => {
            if (err) return dbFail.failSafe(err, res);
            //Decrement user holdings & account transaction log
            subtract_holdings = `update user_funds set funds = funds - $2
            where userid = $1`
            query(subtract_holdings, [username,trigger_amount], (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              accountTransaction(transactionNum,'remove',username,trigger_amount,null, (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"Commands Executed: SET_SELL_TRIGGER": ["userCommand"]});
              })
            })
          })
        }
      })
    })
})

module.exports = router;