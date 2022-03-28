var query = require("../tools/queryDatabase");
var fs = require('fs');

module.exports = async (username, cb) => {
    text = ''
    values = []
    if(username == null){
        text = "select * from transactions order by timestamp asc;"
    } 
    else{
        text = "select * from transactions where username=$1 order by timestamp asc;"
        values = [username]
    } 
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      rows = result.rows
      // fs.writeFileSync
      fs.writeFileSync('./dumplog.xml', "<?xml version='1.0'?>\n<log>\n");
      rows.forEach(row => {
        log = row.logtype
        sublog = ""

        if(log == "quoteServer"){
          sublog = `<quoteServer>\n`+
                      `<timestamp>${row.timestamp}</timestamp>\n`+
                      `<server>${row.server}</server>\n`+
                      `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                      `<price>${row.price}</price>\n`+
                      `<stockSymbol>${row.stocksymbol}</stockSymbol>\n`+
                      `<username>${row.username}</username>\n`+
                      `<quoteServerTime>${row.quoteservertime}</quoteServerTime>\n`+
                      `<cryptokey>${row.cryptokey}</cryptokey>\n`+
                    `</quoteServer>\n`
        } 
        else if(log == "userCommand"){
          sublog = `<userCommand>\n`+
                      `<timestamp>${row.timestamp}</timestamp>\n`+
                      `<server>${row.server}</server>\n`+
                      `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                      `<command>${row.command}</command>\n`

          if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>\n`)
          if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>\n`)
          if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>\n`)
          if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>\n`)

          sublog = sublog.concat("</userCommand>\n")
        }
        else if(log == "accountTransaction"){
          sublog =  `<accountTransaction>\n`+
                    `<timestamp>${row.timestamp}</timestamp>\n`+
                    `<server>${row.server}</server>\n`+
                    `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                    `<action>${row.action}</action>\n`+
                    `<username>${row.username}</username>\n`+
                    `<funds>${row.funds}</funds>\n`+
                    `</accountTransaction>\n`
        }
        else if(log == "systemEvent"){
          sublog = `<systemEvent>\n`+
                      `<timestamp>${row.timestamp}</timestamp>\n`+
                      `<server>${row.server}</server>\n`+
                      `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                      `<command>${row.command}</command>\n`
          
          if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>\n`)
          if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>\n`)
          if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>\n`)
          if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>\n`)

          sublog = sublog.concat("</systemEvent>\n")
        }
        else if(log == "errorEvent"){
          sublog = `<errorEvent>\n`+
                      `<timestamp>${row.timestamp}</timestamp>\n`+
                      `<server>${row.server}</server>\n`+
                      `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                      `<command>${row.command}</command>\n`
          
          if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>\n`)
          if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>\n`)
          if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>\n`)
          if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>\n`)
          if(row.errorMessage != null) sublog = sublog.concat(`<errorMessage>${row.errormessage}</errorMessage>\n`)

          sublog = sublog.concat("</errorEvent>\n")
        }
        else if(log == "debugEvent"){
          sublog = `<debugEvent>\n`+
                      `<timestamp>${row.timestamp}</timestamp>\n`+
                      `<server>${row.server}</server>\n`+
                      `<transactionNum>${row.transactionnum}</transactionNum>\n`+
                      `<command>${row.command}</command>\n`
          
          if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>\n`)
          if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>\n`)
          if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>\n`)
          if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>\n`)
          if(row.errorMessage != null) sublog = sublog.concat(`<debugMessage>${row.debudmessage}</debugMessage>\n`)

          sublog = sublog.concat("</debugEvent>\n")
        }

        fs.appendFileSync('dumplog.xml', sublog);
      });
      
      fs.appendFileSync('./dumplog.xml', "</log>");
      return cb(err, "<?xml version='1.0'?>\n<log>\n</log>")

    })
}