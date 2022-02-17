import React, { useState, useContext, useEffect } from "react";
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'
import { AccountContext } from "./Account";
import UserPool from '../UserPool';

const Status = () => {
  const [status, setStatus] = useState(false);

  const { getSession, logout } = useContext(AccountContext);

  var user = UserPool.getCurrentUser();

  useEffect(() => {
    getSession().then((session) => {
      console.log("Session: ", session);
      setStatus(true);
    });
  }, []);

  return (

    <div className='Login'>
        <Modal.Dialog className='LoginCard'>
                <Modal.Header>
                    <Modal.Title>Welcome, { user.username }</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    This is the first iteration of Account Summary
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={logout}>Logout</Button>
                </Modal.Footer>
            </Modal.Dialog>
    </div>
  );
};
export default Status;