var express = require("express");
var router = express.Router();
const dbFail = require("../tools/dbFailSafe");
var query = require("../tools/queryDatabase");
var userCommand = require("../LogTypes/userCommand")

router.post("/console_test", (req, res) => {
  return res.send({"API received": req.body});
});


/*
Request Body Parameters
@param userid
@param funds_amount
@param filename
*/
router.post("/add", (req, res) => {
  transaction_timestamp = Math.floor(new Date().getTime());
  text = `with upsert as(update user_funds set funds_amount = funds_amount + $2
    where userid = $1)
    insert into user_funds (userid, funds_amount) 
    select $1, $2 where not exists (select 1 from user_funds where 
    userid = $1);`
  values = [req.body.userid, req.body.funds_amount]
  query(text, values, async (err, result) => {
    if (err) return dbFail.failSafe(err, res);
    text = `select * from user_funds where userid = $1`
    values = [req.body.userid]
    query(text, values, async (err, result) => {
      if (result.rowCount == 0){
        funds = 0
      }
      else{
        funds = result.rows[0].funds_amount
      }
      if (err) return dbFail.failSafe(err, res);
      userCommand(transaction_timestamp, "ADD", req.body.userid, "NA", req.body.filename, funds, (err, result) => {
        if (err) return dbFail.failSafe(err, res);
        return res.send({"new_funds_amount": funds});
      })
    })
  })
});



/*
Request Body Parameters
@param userid
@param buy_amount
@param stocksymbol
*/
// router.post("/buy", (req, res) => {

//   text = `select * from user_funds where userid = $1`
//   values = [req.body.userid]
//   query(text, values, async (err, result) => {
//     if (err) return dbFail.failSafe(err, res);
//     if(result.rowCount < 0 || result.rows[0].funds_amount < req.body.buy_amount){
//       return res.send({"success": false, errormessage:"Not enough funds"});
//     }
//     else{
//       text = `insert into buys * from user_funds where userid = $1`
//       values = [req.body.userid]
//       query(text, values, async (err, result) => {
//         if (err) return dbFail.failSafe(err, res);
//           return res.send({"success": true, message:"Bought the stock"});
//       })

//     }
//   })
// });


module.exports = router;