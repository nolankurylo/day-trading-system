const Joi = require('joi'); 

joi_objects = {
    userid: Joi.string().alphanum().min(1).max(100).required(), 
    amount: Joi.number().min(0.01).required(),
    StockSymbol: Joi.string().min(1).max(3).required(),
    filename: Joi.string().min(1).max(100).required()
}


e = module.exports

e.add = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            userid: joi_objects.userid,
            amount: joi_objects.amount
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
}

e.buy_sell = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            userid: joi_objects.userid,
            amount: joi_objects.amount,
            StockSymbol: joi_objects.StockSymbol
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
}


e.userid = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            userid: joi_objects.userid
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
}


e.quote = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            userid: joi_objects.userid,
            StockSymbol: joi_objects.StockSymbol
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
}

e.user_dumplog = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            userid: joi_objects.userid,
            filename: joi_objects.filename
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
},

e.dumplog = () => {  
    return (req, res, next) => {
        schema = Joi.object().keys({ 
            filename: joi_objects.filename
        }); 
        result = schema.validate(req.body);
        if (result.error){
            return res.status(401).send({ message: result.error.details[0].message })
        } 
        next()
    }
}

