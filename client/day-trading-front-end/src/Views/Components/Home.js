import React, { useState, useContext, useEffect } from "react";
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'
import { AccountContext } from "./Account";
import UserPool from '../UserPool';
import NavBar from './Navbar'

export default function Home (props) {

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

    <div className='as-container'>
      <NavBar />
        <h1>Welcome, { user.username }</h1>
    </div>
  );
};
