import React, {useState} from 'react'
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'
import { Link } from "react-router-dom";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import UserPool from './UserPool';


export default function Login (props) {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();

    const user = new CognitoUser({
      Username: username,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log("onSuccess: ", data);
      },
      onFailure: (err) => {
        console.error("onFailure: ", err);
      },
      newPasswordRequired: (data) => {
        console.log("newPasswordRequired: ", data);
      },
    });
  };

    return (
        <div className='Login'>
            <Modal.Dialog className='LoginCard'>
                <Modal.Header>
                    <Modal.Title>Day Trading Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <FormControl
                            autoComplete="off"
                            id="username"
                            placeholder="Username"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}

                        />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <FormControl
                            autoComplete="off"
                            id="password"
                            type="password"
                            placeholder="Password"
                            aria-label="Password"
                            aria-describedby="basic-addon1"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={onSubmit}>Login</Button>
                    <Button variant="secondary">
                        <Link to="/register">Sign Up</Link>
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
       </div>
    )
}

