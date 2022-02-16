var express = require("express");
var router = express.Router();

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



module.exports = router;