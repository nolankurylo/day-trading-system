var express = require("express");
var router = express.Router();
var crypto = require('crypto');
var base64url = require('base64url');
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
var quoteServer = require('../LogTypes/quoteServer')
var userCommand = require('../LogTypes/userCommand')
var utils = require('../tools/utils')

router.get("/", (req, res) => {
    return res.send("Hello world, NALT connected! 🌝");
});


/*
Request Body Parameters
@param userid
@param stocksymbol 
*/
router.get("/quote", 
  utils.getNextTransactionNumber,
  async (req, res) => {
  
  // NEED TO COME BACK AND MAKE FAKE QUOTE SERVER LATER 
  // ----------------------------------------------
  transactionNum = req.body.nextTransactionNum
  stockSymbol=req.body.stocksymbol
  username=req.body.userid
  quoteservertime = Math.floor(new Date().getTime());
  cryptokey = base64url(crypto.randomBytes(20))
  price = "12.12"
  // ---------------------------------------------
  userCommand(transactionNum=transactionNum, command="QUOTE", username=username, stocksymbol=stockSymbol, filename=null, funds=null, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    quoteServer(transactionNum=transactionNum, price=price, stockSymbol=stockSymbol, username=username, quoteServerTime=quoteservertime, cryptoKey=cryptokey, (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      return res.send({"Commands Executed: QUOTE": ["userCommand", "quoteServer"]});;
    })
  })   
});




module.exports = router;