var query = require("../tools/queryDatabase");

module.exports = async (timestamp, action, username, funds, cb) => {

    text = `insert into transactions (logtype, transaction_timestamp, server_name, action, userid, funds)
    values ('accountTransaction', $1, 'own_server', $2, $3, $4)`
    values = [timestamp, action, username, funds]
    query(text, values, async (err, result) => {
        return cb(err, result)
    })
}
  