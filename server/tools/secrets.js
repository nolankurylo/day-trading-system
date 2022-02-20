// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
var AWS = require('aws-sdk')
region = "ca-central-1"
secretName = "seng468-secrets"


module.exports = () => {
    function get_secrets(cb){
        // Create a Secrets Manager client
        var client = new AWS.SecretsManager({
            region: region
        });

        client.getSecretValue({SecretId: secretName}, function(err, data) {
            if(err) console.log(err)
            // console.log(data)
            return cb(err, data['SecretString'])
        })
 
    }
    x = get_secrets((err, data) => {
        console.log(data)
        return data
    }) 
    console.log("x", x)
    
}

