var express = require("express");
var router = express.Router();
var crypto = require('crypto');
var base64url = require('base64url');
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
var quoteServer = require('../LogTypes/quoteServer')
var userCommand = require('../LogTypes/userCommand')
var quote = require('../quoteServer/quote')
var utils = require('../tools/utils')

router.get("/", (req, res) => {
    return res.send("Hello world, NALT connected! 🌝");
});


/*
Request Body Parameters
@param userid
@param StockSymbol 
*/
router.get("/quote", 
  utils.getNextTransactionNumber,
  async (req, res) => {

  username = req.body.userid
  transactionNum=req.body.nextTransactionNum
  stockSymbol = req.body.StockSymbol

  returnedQuote = quote.getQuote(stockSymbol, username)
  price = returnedQuote.Quoteprice
  quoteServerTime = returnedQuote.timestamp
  cryptoKey = returnedQuote.cryptokey

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
@param stocksymbol 
*/
router.get("/get_quote", (req,res) => {
  stockSymbol = req.body.stockSymbol
  username = req.body.userid
  return res.send(quote.getQuote(stockSymbol, username));
})

module.exports = router;