import React, { useState, useContext, useEffect } from "react";
import { AccountContext } from "./Account";
import UserPool from '../UserPool';
import NavBar from "./Navbar";
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'

export default function Settings (props) {

  const [status, setStatus] = useState(false);

  const { getSession, logout } = useContext(AccountContext);

  var user = UserPool.getCurrentUser();

  console.log(user)

  return (

    <div className='settings-container'>
      <NavBar />
        Logout Functionality Here @ Later
        <Button variant="primary" onClick={logout}>Logout</Button>
    </div>
  );
};