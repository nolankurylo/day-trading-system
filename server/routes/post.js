var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
var utils = require('../tools/utils');
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");
var quote = require('../quoteServer/quote')
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
      select COALESCE(funds,0) as user_total, COALESCE(buy_amount,0) as buys_total from user_funds, buy_amounts;`
      query(get_funds, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
          errorEvent(transactionNum,command,username,stock_symbol,null,buy_amount,"User Not Found",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": "User Not Found"});
          })
        }
        else {
          buys_total = result.rows[0].buys_total
          funds_needed = result.rows[0].user_total + buys_total
          if (funds_needed >= buy_amount){
            if (buys_total > 0){
              //Update
              update_buy = `with buy_update as (update buys set buy_amount = $3
              where userid = $1 and stocksymbol = $2)
              update user_funds set funds = funds + $4 - $3
              where userid = $1`
              values = [username,stock_symbol,buy_amount,buys_total]
              query(update_buy, values, async (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                accountTransaction(transactionNum,'remove',username,buy_amount,null, (err, result) => {
                  if (err) return dbFail.failSafe(err, res);
                  return res.send({"success": true, "data": null, "message": "SET_BUY_AMOUNT successful"});
                })
              })
            } else {
              //Insert
              insert_buy = `with buy_insert as (insert into buys (userid, buy_amount, is_active, stocksymbol)
              values ($1,$2,$3,$4))
              update user_funds set funds = funds - $2
              where userid = $1`
              values = [username,buy_amount,false,stock_symbol]
              query(subtract_holdings, [username,buy_amount], (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                accountTransaction(transactionNum,'remove',username,buy_amount,null, (err, result) => {
                  if (err) return dbFail.failSafe(err, res);
                  return res.send({"success": true, "data": null, "message": "SET_BUY_AMOUNT successful"});
                })
              })
            }
          } else {
            //error log
            errorEvent(transactionNum,command,username,stock_symbol,null,buy_amount,"Insufficient Funds",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": null, "message": "Not enough funds for trigger"});
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
            return res.send({"success": false, "data": null, "message": "Buy trigger not found"});
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
            return res.send({"success": true, "data": null, "message": "SET_BUY_TRIGGER successful"});
          })
        })
      }
    })
})

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
            return res.send({"success": false, "data": null, "message": "Buy trigger not found"});
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
                return res.send({"success": true, "data": null, "message": "CANCEL_SET_BUY successful"});
              })
            })
          })
        })
      }
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
      get_stocks = `select num_stocks from user_stocks where userid =$1 and stocksymbol = $2;`
      query(get_stocks, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
          errorEvent(transactionNum,command,username,stock_symbol,null,sell_amount,"Insufficient Stocks",(err, result) => {
            if (err) return dbFail.failSafe(err, res);
            return res.send({"success": false, "data": null, "message": "Not enough stocks for trigger"});
          })
        }
        else {
          stock_total = result.rows[0].num_stocks
          if (stock_total >= sell_amount){
            //Check if sell trigger exists 
            get_sells = `select * from sells where userid =$1 and stocksymbol = $2;`
            query(get_sells, [username,stock_symbol], async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              if (result.rowCount == 0){
                //Insert
                insert_sell = `insert into sells (userid, sell_amount, is_active, stocksymbol) 
                values($1,$2,$3,$4)`
                values = [username,sell_amount,false,stock_symbol]
                query(insert_sell, values, async (err, result) => {
                  return res.send({"success": true, "data": null, "message": "SET_SELL_AMOUNT successful"});
                })
              }
              else {
                if (result.rows[0].is_active){
                  //error log
                  errorEvent(transactionNum,command,username,stock_symbol,null,sell_amount,"Trigger Already Active",(err, result) => {
                    if (err) return dbFail.failSafe(err, res);
                    return res.send({"success": false, "data": null, "message": "Cannot change active trigger amount"});
                  })
                } else {
                  //update
                  update_sells = `update sells set sell_amount = $1
                  where userid = $2 and stocksymbol = $3`
                  values = [sell_amount,username,stock_symbol]
                  query(update_sells, values, async (err, result) => {
                    if (err) return dbFail.failSafe(err, res);
                    return res.send({"success": true, "data": null, "message": "SET_SELL_AMOUNT successful"});
                  })
                }
              }
            })
          } else {
            //error log
            errorEvent(transactionNum,command,username,stock_symbol,null,sell_amount,"Insufficient Shares",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": null, "message": "Not enough stocks for trigger"});
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
      //Check if a Set Sell exists for user and stock
      find_sell=`select * from sells where userid = $1 and stocksymbol = $2`
      query(find_sell, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
            errorEvent(transactionNum,command,username,stock_symbol,null,trigger_amount,"Sell trigger not found",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": null, "message": "Sell trigger not found"});
            })
        }
        else {
          id = result.rows[0].sell_trigger_id
          sell_amount = result.rows[0].sell_amount
          //Check if trigger is active 
          if (result.rows[0].is_active){
            //Just update trigger
            update_query = `update sells set 
              sell_trigger_threshold = $3,is_active = $4 where userid = $1 and stocksymbol = $2`
              values=[username,stock_symbol,trigger_amount,true]
              query(update_query,values,async (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"success": true, "data": null, "message": "SET_SELL_TRIGGER successful"});
              })
          } else {
            //Update trigger and decrement stock table 
            update_query = `with update_sells as (update sells set 
            sell_trigger_threshold = $3,is_active = $4 where userid = $1 and stocksymbol = $2)
            update user_stocks set num_stocks = num_stocks - $5
            where userid = $1 and stocksymbol = $2`
            values=[username,stock_symbol,trigger_amount,true,sell_amount]
            query(update_query,values,async (err, result) => {
              if (err) return dbFail.failSafe(err, res);
              systemEvent(transactionNum,command,username,stock_symbol,null,sell_amount,(err, result) => {
                if (err) return dbFail.failSafe(err, res);
                return res.send({"success": true, "data": null, "message": "SET_SELL_TRIGGER successful"});
              })
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
router.post("/cancel_set_sell", 
  utils.getNextTransactionNumber,
  (req, res) => {
    command='CANCEL_SET_SELL'
    username = req.body.userid
    transactionNum=req.body.nextTransactionNum
    stock_symbol = req.body.StockSymbol
    //User Command Log
    userCommand(transactionNum,command,username,stock_symbol,null,null, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      find_sell = `select * from sells where userid = $1 and stockSymbol = $2`
      //Check if a Set Sell exists for user and stock
      query(find_sell, [username,stock_symbol], async (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        if (result.rowCount == 0){
            errorEvent(transactionNum,command,username,stock_symbol,null,null,"No Sell Trigger To Cancel",(err, result) => {
              if (err) return dbFail.failSafe(err, res);
              return res.send({"success": false, "data": null, "message": "Sell trigger not found"});
            })
        }
        else {
          sell_amount = result.rows[0].sell_amount
          id = result.rows[0].sell_trigger_id
          // delete from sells table
          delete_query = `delete from sells 
          where sell_trigger_id = $1`
          query(delete_query,[id],async (err, result) => {
            if (err) return dbFail.failSafe(err, res);
              //Increment user stocks & account transaction log
              reset_funds = `update user_stocks set num_stocks = num_stocks + $3
              where userid = $1 and stocksymbol = $2`
              query(reset_funds, [username,stock_symbol,sell_amount], (err, result) => {
                if (err) return dbFail.failSafe(err, res);
                accountTransaction(transactionNum,'add',username,sell_amount,null, (err, result) => {
                  if (err) return dbFail.failSafe(err, res);
                  return res.send({"success": true, "data": null, "message": "CANCEL_SET_SELL successful"});
                })
              })
          })
        }
      })
    })
  }
)

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