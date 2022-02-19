var query = require("../tools/queryDatabase");

module.exports = async (username, cb) => {
    text = ''
    values = []
    if(username == null){
        text = "select * from transactions;"
    } 
    else{
        text = "select * from transactions where username=$1;"
        values = [username]
    } 
    query(text, values, async (err, result) => {
      if (err) return dbFail.failSafe(err, res);
      rows = result.rows
  
      if (result.rowCount == 0) return res.send("<?xml version=\"1.0\"?><log></log>");
      else {
        logStr = "<?xml version=\"1.0\"?>\n\t<log>\n"
        
        rows.forEach(row => {
          log = row.logtype
          sublog = ""
  
          if(log == "quoteServer"){
            sublog = `<quoteServer>
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <price>${row.price}</price>
                        <stockSymbol>${row.stocksymbol}</stockSymbol>
                        <username>${row.username}</username>
                        <quoteServerTime>${row.quoteservertime}</quoteServerTime>
                        <cryptokey>${row.cryptokey}</cryptokey>
                      </quoteServer>\n`
          } 
          else if(log == "userCommand"){
            sublog = `<userCommand> 
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <command>${row.command}</command>`
  
            if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>`)
            if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>`)
            if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>`)
            if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>`)
  
            sublog = sublog.concat("</userCommand>\n")
          }
          else if(log == "accountTransaction"){
            sublog =  `<accountTransaction>
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <action>${row.action}</action>
                        <username>${row.username}</username>
                        <funds>${row.funds}</funds> 
                      </accountTransaction>\n`
          }
          else if(log == "systemEvent"){
            sublog = `<systemEvent>
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <command>${row.command}</command>`
            
            if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>`)
            if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>`)
            if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>`)
            if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>`)
  
            sublog = sublog.concat("</systemEvent>\n")
          }
          else if(log == "errorEvent"){
            sublog = `<errorEvent>
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <command>${row.command}</command>`
            
            if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>`)
            if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>`)
            if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>`)
            if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>`)
            if(row.errorMessage != null) sublog = sublog.concat(`<errorMessage>${row.errormessage}</errorMessage>`)
  
            sublog = sublog.concat("</errorEvent>\n")
          }
          else if(log == "debugEvent"){
            sublog = `<debugEvent>
                        <timestamp>${row.timestamp}</timestamp>
                        <server>${row.server}</server>
                        <transactionNum>${row.transactionnum}</transactionNum>
                        <command>${row.command}</command>`
            
            if(row.username != null) sublog = sublog.concat(`<username>${row.username}</username>`)
            if(row.stockSymbol != null) sublog = sublog.concat(`<stockSymbol>${row.stockSymbol}</stockSymbol>`)
            if(row.filename != null) sublog = sublog.concat(`<filename>${row.filename}</filename>`)
            if(row.funds != null) sublog = sublog.concat(`<funds>${row.funds}</funds>`)
            if(row.errorMessage != null) sublog = sublog.concat(`<debugMessage>${row.debudmessage}</debugMessage>`)
  
            sublog = sublog.concat("</debugEvent>\n")
          }
  
          logStr = logStr.concat(sublog)
        });
        
        logStr = logStr.concat("</log>")
        return cb(err, logStr)
      }
    })
}