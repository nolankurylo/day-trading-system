var express = require("express");
const { quote } = require("yahoo-finance");
var router = express.Router();
var crypto = require('crypto');
var base64url = require('base64url');
const yf = require("yahoo-finance")
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
var quoteServer = require('../LogTypes/quoteServer')
var userCommand = require('../LogTypes/userCommand')

router.get("/", (req, res) => {
    return res.send("Hello world, NALT connected! 🌝");
});

router.get("/db_test", (req, res) => {
    text = "select * from users"
    values = []
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
        return res.send({"db_data": result});
    })
  });

/*
Request Body Parameters
@param userid
@param stocksymbol
@param filename
*/
router.get("/quote", async (req, res) => {
  const quote = await yf.quote(req.body.stocksymbol, ['price'])
  
  quoteservertime = Math.floor(new Date(quote['price']['regularMarketTime']).getTime());
  transaction_timestamp = Math.floor(new Date().getTime());
  console.log(transaction_timestamp)
  cryptokey = base64url(crypto.randomBytes(20))
  price = quote['price']['regularMarketPrice']
  quoteServer(transaction_timestamp, price, req.body.stocksymbol, req.body.userid, quoteservertime, cryptokey, (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    text = "select * from user_funds where userid = $1"
    values = [req.body.userid]
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      if (result.rowCount == 0){
        funds = 0
      }
      else{
        funds = result.rows[0].funds_amount
      }
      userCommand(transaction_timestamp, "QUOTE", req.body.userid, req.body.stocksymbol, req.body.filename, funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        return res.send(
          {
            "Quoteprice": price,
            "SYM": req.body.stocksymbol,
            "username": req.body.userid,
            "timestamp": quoteservertime,
            "cryptographickey": cryptokey
        });
      })
    })
  })   
});




module.exports = router;