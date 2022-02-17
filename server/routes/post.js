var express = require("express");
var router = express.Router();

var query = require("../tools/queryDatabase");

router.post("/console_test", (req, res) => {
    return res.send({"API received": req.body});
  });



module.exports = router;