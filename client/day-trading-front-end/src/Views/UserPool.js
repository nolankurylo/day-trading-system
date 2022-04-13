import { CognitoUserPool } from "amazon-cognito-identity-js"

const poolData = {

    UserPoolId: "ca-central-1_JQTB2mPxa",
    ClientId: "50u8jq7dhqpp8qu6u68tbr0t5u"

}

export default new CognitoUserPool(poolData)