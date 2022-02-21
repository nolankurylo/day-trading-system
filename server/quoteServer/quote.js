var crypto = require('crypto');
var base64url = require('base64url')

function getQuote(sym_raw, user) {

    sym = sym_raw.substring(0,3)
    base_p = 0
    for(let i = 0; i < sym.length; i++) base_p = base_p + sym.charCodeAt(0)
    base_p = ((base_p % 250) + (base_p * 0.03)).toFixed(2)
    base_p = parseFloat(base_p)

    if(base_p == 0) base_p = 69.69

    base_inc = base_p * 0.35

    rad = ((new Date().getTime() % (86400000))/(86400000)) * 6.28
    sin_val = Math.sin(rad)

    p = (base_p + (base_inc * sin_val)).toFixed(2)
    p = parseFloat(p)

    if(p < 0) p = 0.01

    var quoteObj = {
        "Quoteprice": p,
        "SYM": sym,
        "username": user,
        "timestamp": new Date().getTime(),
        "cryptokey": base64url(crypto.randomBytes(20))
    }
    return quoteObj
}

module.exports = {getQuote}