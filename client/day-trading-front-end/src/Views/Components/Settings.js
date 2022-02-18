import React, { useState, useContext, useEffect } from "react";
import { AccountContext } from "./Account";
import UserPool from '../UserPool';
import NavBar from "./Navbar";

export default function Settings (props) {

  const [status, setStatus] = useState(false);

  const { getSession, logout } = useContext(AccountContext);

  // var user = UserPool.getCurrentUser();

  // if (!user){
  //   window.location.reload('/login')
  // }

  // useEffect(() => {
  //   getSession().then((session) => {
  //     console.log("Session: ", session);
  //     setStatus(true);
  //   });
  // }, []);

  return (

    <div className='settings-container'>
      <NavBar />
        Logout Functionality Here @ Later
    </div>
  );
};