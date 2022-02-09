import React from 'react'
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'


export default function Login (props) {

    React.useEffect(() => {
        document.title = "Day Trading Login"
     }, []);

     const loginAction = () => {
        console.log(document.getElementById('username').value)
        console.log(document.getElementById('password').value)
     }

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
                        />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={loginAction}>Login</Button>
                    <Button variant="secondary">Sign Up</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </div>
    )
}

