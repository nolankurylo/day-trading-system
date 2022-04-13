import React, { useState } from 'react'
import {Button, FormControl, InputGroup, Modal} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserPool from '../UserPool';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import axios from 'axios'

export default function SignUp (props) {

    const apiEndpoint = 'http://localhost:3000'

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const emailAttribute = new CognitoUserAttribute({
        Name: 'email',
        Value: email
       });

    const onSubmit = (event) => {

        
        event.preventDefault();

        UserPool.signUp(username, password, [emailAttribute], null, (err, data) => {
            if (err) {
                console.error(err);
                alert(err)
                return
            }

            // Input into DATABASE 

            const post_req = { 'username': username, 'email': email, 'password': password}

            axios.post(apiEndpoint + '/register', post_req)
                .then(res => {
                    const result = res.data;
                    console.log(result);
                })

            window.location.href='/login'

        });
    };

    return (
        <div className='SignUp'>
            <Modal.Dialog className='SignUpCard'>
                <Modal.Header>
                    <Modal.Title>Day Trading Sign Up</Modal.Title>
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
                            id="email"
                            placeholder="Email"
                            aria-label="Email"
                            aria-describedby="basic-addon1"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                    <Button variant="primary">
                        <Link to="/login" className='register-link'>Login</Link>
                    </Button>
                    <Button variant="secondary" onClick={onSubmit}>Sign Up</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </div>
    )
}