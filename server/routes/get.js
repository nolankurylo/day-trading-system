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

  quoteServer(transactionNum=transactionNum, price=price, stockSymbol=stockSymbol, username=username, quoteServerTime=quoteservertime, cryptoKey=cryptokey, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    text = "select * from user_funds where userid = $1"
    values = [username]
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        funds = 0
      }
      else{
        funds = result.rows[0].funds
      }
      userCommand(transactionNum=transactionNum, command="QUOTE", username=username, stocksymbol=stockSymbol, filename=null, funds=funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        return res.send(
          {
            "Quoteprice": price,
            "SYM": stockSymbol,
            "username": username,
            "timestamp": quoteservertime,
            "cryptographickey": cryptokey
        });
      })
    })
  })   
});




module.exports = router;