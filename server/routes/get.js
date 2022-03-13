var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
var quoteServer = require('../LogTypes/quoteServer')
var userCommand = require('../LogTypes/userCommand')
var quote = require('../quoteServer/quote')
var utils = require('../tools/utils')
const validate = require('../tools/validate');
var dumplog = require('../tools/dumplog')


/*
Request Body Parameters
none
*/
router.get("/", (req, res) => {
    return res.send("Hello world, NALT connected! 🌝");
});

/*
Request Body Parameters
none
*/
router.get("/test",  (req, res) => {

  query("select * from users",[],async (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    return res.send(result);
  })
  
});


/*
Request Body Parameters
@param userid
@param StockSymbol 
*/
router.post("/quote", 
  validate.quote(),
  async (req, res) => {

  let username = req.body.userid
  let transactionNum=req.body.nextTransactionNum
  let stockSymbol = req.body.StockSymbol

  let returnedQuote = quote.getQuote(stockSymbol, username)
  let price = returnedQuote.Quoteprice
  let quoteServerTime = returnedQuote.timestamp
  let cryptoKey = returnedQuote.cryptokey

  userCommand(transactionNum=transactionNum, command="QUOTE", username=username, stocksymbol=stockSymbol, filename=null, funds=null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    quoteServer(transactionNum=transactionNum, price=price, stockSymbol=stockSymbol, username=username, quoteServerTime=quoteServerTime, cryptoKey=cryptoKey, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      return res.send({"success": true, "data": {"current_price": price}, "message": "QUOTE successful"});
    })
  })   
});

/*
Request Body Parameters
@param userid
@param StockSymbol 
*/
router.get("/get_quote", 
  validate.quote(),
  (req,res) => {
  stockSymbol = req.body.StockSymbol
  username = req.body.userid
  return res.send(quote.getQuote(stockSymbol, username));
})

/*
Request Body Parameters
none
*/
router.get("/get_dump", (req,res) => {
  dumplog(null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    return res.send(result);
  })
})


module.exports = router;