var expect = require('chai').expect
var request = require("request");

const userCommand = require("../LogTypes/userCommand")
const accountTransaction = require("../LogTypes/accountTransaction")
const systemEvent = require("../LogTypes/systemEvent");
const errorEvent = require("../LogTypes/errorEvent");
var quoteServer = require("../LogTypes/quoteServer")

var base_url = "http://localhost:3000"

// example test for Hello World route on site using chai expect and request
describe("UNIT TEST: GET '/' route", function() {
  it('should return a string', function(done) {
    request( base_url + "/", function(error, response, body) {
      expect(body).to.equal("Hello world, NALT connected! 🌝");
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
describe("UNIT TEST: post '/quote' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/quote", 
                json: { userid: "nolan", StockSymbol: "ABC" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.be.an('object');
      expect(body.data.current_price).to.be.above(0);
      expect(body.message).to.equal('QUOTE successful');
      done();
    });
  });

  it('TEST 401: no StockSymbol', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/quote", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"StockSymbol" is required');
      done();
    });
  });

  it('TEST 401: no userid', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/quote", 
                json: { StockSymbol: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"userid" is required');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param amount
*/
describe("UNIT TEST: post '/add' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/add", 
                json: { userid: "nolan", amount: 10000.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('ADD successful');
      done();
    });
  });

  it('TEST 401: no amount', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/add", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"amount" is required');
      done();
    });
  });

  it('TEST 401: no userid', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/add", 
                json: { amount: 10000.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"userid" is required');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to buy of the stock
*/
// router.post("/buy"); test
describe("UNIT TEST: post '/buy' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/buy", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 2000.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.be.an('object');
      expect(body.message).to.equal('BUY successful, confirm or cancel');
      done();
    });
  });

  // commit to push 
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/commit_buy", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('TEST 401: no amount', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/buy", 
                json: { userid: "nolan", StockSymbol: "ABC" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"amount" is required');
      done();
    });
  });

  it('TEST 401: no StockSymbol', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/buy", 
                json: { userid: "nolan", amount: 100.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"StockSymbol" is required');
      done();
    });
  });

  it('TEST 401: no userid', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/buy", 
                json: { StockSymbol: "ABC", amount: 100.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      expect(body.message).to.equal('"userid" is required');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
*/
// router.post("/cancel_buy") test
describe("UNIT TEST: post '/cancel_buy' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/cancel_buy", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('CANCEL_BUY successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount - that the user wants to sell of the stock
*/
// router.post("/sell") test
describe("UNIT TEST: post '/sell' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/sell", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 2 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.be.an('object');
      expect(body.data.current_price).to.be.above(0);
      expect(body.message).to.equal('SELL successful, confirm or cancel');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
*/
// router.post("/commit_sell") 
describe("UNIT TEST: post '/commit_sell' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/commit_sell", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('COMMIT_SELL successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
*/
// router.post("/cancel_sell") test
describe("UNIT TEST: post '/cancel_sell' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/cancel_sell", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('CANCEL_SELL successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param stockSymbol
@param amount
*/
// router.post("/set_buy_amount")
describe("UNIT TEST: post '/set_buy_amount' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/set_buy_amount", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 200.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('SET_BUY_AMOUNT successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount
*/
// router.post("/set_buy_trigger") test
describe("UNIT TEST: post '/set_buy_trigger' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/set_buy_trigger", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 2 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('SET_BUY_TRIGGER successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
// router.post("/cancel_set_buy") test
describe("UNIT TEST: post '/cancel_set_buy' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/cancel_set_buy", 
                json: { userid: "nolan", StockSymbol: "ABC" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('CANCEL_SET_BUY successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param filename
*/
// router.post("/dumplog") test
describe("UNIT TEST: post '/dumplog' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/dumplog", 
                json: { filename: "test.xml" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.be.a('string');
      done();
    });
  });
});

/*
Request Body Parameters
@param filename
@param userid
*/
// router.post("/user_dumplog") test
describe("UNIT TEST: post '/user_dumplog' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/user_dumplog", 
                json: { filename: "test.xml", userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.be.a('string');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amount
*/
// router.post("/set_sell_amount") test
describe("UNIT TEST: post '/set_sell_amount' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/set_sell_amount", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 200.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('SET_SELL_AMOUNT successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
@param amounnt
*/
// router.post("/set_sell_trigger") test
describe("UNIT TEST: post '/set_sell_trigger' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/set_sell_trigger", 
                json: { userid: "nolan", StockSymbol: "ABC", amount: 200.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('SET_SELL_TRIGGER successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
@param StockSymbol
*/
// router.post("/cancel_set_sell") test
describe("UNIT TEST: post '/cancel_set_sell' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/cancel_set_sell", 
                json: { userid: "nolan", StockSymbol: "ABC" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('CANCEL_SET_SELL successful');
      done();
    });
  });
});

/*
Request Body Parameters
@param userid
*/
// router.post("/display_summary") test
describe("UNIT TEST: post '/display_summary' route", function () {
  it('TEST 200', function (done) {
    var obj = { method: 'POST',
                url: base_url + "/display_summary", 
                json: { userid: "nolan" }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.equal(null);
      expect(body.message).to.equal('DISPLAY_SUMMARY successful');
      done();
    });
  });
});

// debugEvent() test
describe("UNIT TEST: for debugEvent module export function", function () {
  it('sanity test', function (done) {
      debugEvent(transactionNum=-1, action="DISPLAY_SUMMARY", username="nolan", stockSymbol=null, filename=null, funds=null, debugMessage="DEBUG MESSAGE", (err, result) => {
      console.log(result)
      console.log(err)
      done();
    });
  });
});

// systemEvent() test
describe("UNIT TEST: for systemEvent module export function", function () {
  it('sanity test', function (done) {
      systemEvent(transactionNum=-1, command="SET_BUY_AMOUNT", username="nolan", stockSymbol="ABC", filename=null, funds=100.00, (err, result) => {
      console.log(result)
      console.log(err)
      done();
    });
  });
});

// errorEvent() test
describe("UNIT TEST: for errorEvent module export function", function () {
  it('sanity test', function (done) {
      errorEvent(transactionNum=-1, command="BUY", username="nolan", stockSymbol="ABC", filename=null, funds=100.00, errorMessage="Error Message", (err, result) => {
      console.log(result)
      console.log(err)
      done();
    });
  });
});

// accountTransaction() test
describe("UNIT TEST: for userCommand module export function", function () {
  it('sanity test', function (done) {
      accountTransaction(transactionNum=-2, action="add", username="nolan", funds=200.00, stockSymbol=null, (err, result) => {
      console.log(result)
      console.log(err)
      done();
    });
  });
});

// usercommand() test
describe("UNIT TEST: for userCommand module export function", function () {
  it('sanity test', function (done) {
      userCommand(transactionNum=-1, command="DISPLAY_SUMMARY", username="nolan", stockSymbol=null, filename=null, funds=null, (err, result) => {
      console.log(result)
      console.log(err)
      done();
    });
  });
});