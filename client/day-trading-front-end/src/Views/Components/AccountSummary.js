import React, { useState, useContext, useEffect } from "react";
import {Button, Card, FormControl, InputGroup, Modal, NavLink} from 'react-bootstrap'
import { AccountContext } from "./Account";
import UserPool from '../UserPool';
import NavBar from "./Navbar";

export default function AccountSummary (props) {

  const [additionalAmount, setAdditionalAmount] = useState(0)
  const [withdrawalAmount, setWithdrawalAmount] = useState(0)
  const [initialAmount, setInitialAmount] = useState(5000)
  // const [newAmount, setNewAmount] = useState(0)


  const addFunds = (event) => {
    event.preventDefault();
    var newAmount = initialAmount + additionalAmount;
    console.log("Adding " + additionalAmount + " to Account")
    console.log("New Total Amount: " + newAmount)
  };

  const withdrawFunds = (event) => {
    event.preventDefault();
    var newAmount = initialAmount - withdrawalAmount;
    console.log("Removing " + withdrawalAmount + " from Account")
    console.log("New Total Amount: " + newAmount)
  };

  return (

    <div className='as-container'>
      <NavBar />
        Account Summary

        <div className='row' style={{marginBottom:50}}>
          <h2>Amount Available: {initialAmount}</h2>
        </div>

        <div className='row'>
          <div className='col-6'>

            <h3>ADD Funds</h3>
            <InputGroup className="mb-3">
                
                <FormControl
                    autoComplete="off"
                    id="addFunds"
                    placeholder="addFunds"
                    aria-label="Stock"
                    aria-describedby="basic-addon1"
                    value={additionalAmount}
                    onChange={(event) => setAdditionalAmount(event.target.value)}
                />
            </InputGroup>
            <Button variant='primary' onClick={addFunds}>Add Funds</Button>

          </div>

          <div className='col-6'>
            <h3>Withdraw Funds</h3>
            <InputGroup className="mb-3">
                
                <FormControl
                    autoComplete="off"
                    id="addFunds"
                    placeholder="addFunds"
                    aria-label="Stock"
                    aria-describedby="basic-addon1"
                    value={withdrawalAmount}
                    onChange={(event) => setWithdrawalAmount(event.target.value)}
                />
            </InputGroup>
          <Button variant='primary' onClick={withdrawFunds}>Add Funds</Button>
        </div>
      </div>
  </div>
  );
};