var assert = require('assert');

// example test from documentation
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

/* TEST TO BE ADDED */

/*
Request Body Parameters
@param userid
@param StockSymbol 
*/
// router.get("/quote") test

/*
Request Body Parameters
@param userid
@param amount
*/
// router.post("/add") test

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to buy of the stock
*/
// router.post("/buy"); test

/*
Request Body Parameters
@param userid
*/
// router.post("/cancel_buy") test

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to sell of the stock
*/
// router.post("/sell") test

/*
Request Body Parameters
@param userid
*/
// router.post("/commit_sell") 

/*
Request Body Parameters
@param userid
*/
// router.post("/cancel_sell") test

/*
Request Body Parameters
@param userid
@param stockSymbol
@param amount
*/
// router.post("/set_buy_amount")

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount
*/
// router.post("/set_buy_trigger") test

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
// router.post("/cancel_set_buy") test

/*
Request Body Parameters
@param filename
*/
// router.post("/dumplog") test

/*
Request Body Parameters
@param filename
@param userid
*/
// router.post("/user_dumplog") test

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount
*/
// router.post("/set_sell_amount") test

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amounnt
*/
// router.post("/set_sell_trigger") test

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
// router.post("/cancel_set_sell") test

/*
Request Body Parameters
@param userid
*/
// router.post("/display_summary") test

// debugEvent() test

// systemEvent() test

// errorEvent() test

// accountTransaction() test

// usercommand() test