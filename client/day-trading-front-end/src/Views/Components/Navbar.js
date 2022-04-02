import React, { useState, useContext, useEffect } from "react";
import {Button, Navbar, FormControl, InputGroup, Modal} from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { AccountContext } from "./Account";
import UserPool from '../UserPool';

export default function NavBar (props) {

  const { getSession, logout } = useContext(AccountContext);

  return (
    <div>
        <Navbar className='navbar-main'>
            <Link to='/account_summary' className='navitem'>
              Account Summary
            </Link>
            <Link to='/buy' className='navitem'>
                Buy
            </Link>
            <Link to='/sell' className='navitem'>
              Sell
            </Link>
            <Button onClick={logout} className='logoutButton navitem'>
              Logout
             </Button>
        </Navbar>
    </div>
  );
};