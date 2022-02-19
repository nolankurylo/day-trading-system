

var query = require("../tools/queryDatabase");

module.exports = {

    getNextTransactionNumber: async (req, res, next) => {
        text = `select max(transactionnum) as curr_transaction_num from transactions `
        values = []
        query(text, values, async (err, result) => {
            if(err) next(err)
            if(result.rowCount == 0){
                req.body.nextTransactionNum = 1
            }
            else{
                req.body.nextTransactionNum = result.rows[0].curr_transaction_num + 1
            } 
            next()
        })
    }
}
  