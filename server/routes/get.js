var express = require("express");
const { quote } = require("yahoo-finance");
var router = express.Router();
const yf = require("yahoo-finance")

var query = require("../tools/queryDatabase");

router.get("/", (req, res) => {
    return res.send("Hello world, NALT connected! 🌝");
});

router.get("/db_test", (req, res) => {
    text = "select * from users"
    values = []
    query(text, values, async (err, result) => {
      if (err) return res.send(err);
        return res.send({"db_data": result});
    })
  });

router.get("/stock_server_test", async (req, res) => {
  const quote = await yf.quote('AAPL', ['price'])
  
  return res.send(
    {
      "Quoteprice": quote['price']['regularMarketPrice'],
      "SYM": quote['price']['symbol'],
      "username": "nolan",
      "timestamp": quote['price']['regularMarketTime'],
      "cryptographickey": "lol"
    });
});




module.exports = router;