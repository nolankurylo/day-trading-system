var expect = require('chai').expect
var request = require("request");

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
                json: { userid: "nolan", StockSymbol: "ABC", amount: 300.00 }
              }
    request.post(obj, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(body.success).to.equal(true);
      expect(body.data).to.be.an('object');
      expect(body.message).to.equal('BUY successful, confirm or cancel');
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