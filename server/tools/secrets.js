var AWS = require('aws-sdk')
region = "ca-central-1"
secretName = "seng468-secrets"

var client = new AWS.SecretsManager({
    region: region
});

module.exports = client.getSecretValue({SecretId: secretName}, function(err, data) {
        if(err) console.log(err)
        return data['SecretString']
    })
    
