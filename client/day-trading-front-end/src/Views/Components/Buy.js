import React, { useState, useContext, useEffect } from "react";
import {Button, Card, FormControl, InputGroup, Dropdown, DropdownButton, Modal} from 'react-bootstrap'
import { AccountContext } from "./Account";
import UserPool from '../UserPool';
import NavBar from "./Navbar";
import DropdownItem from "@restart/ui/esm/DropdownItem";

export default function Buy (props) {

  const [stock, setStock] = useState("")
  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(50)

  const [status, setStatus] = useState(false);

  const { getSession, logout } = useContext(AccountContext);

  // var user = UserPool.getCurrentUser();

  // if (!user){
  //   window.location.reload('/')
  // }

  // useEffect(() => {
  //   getSession().then((session) => {
  //     console.log("Session: ", session);
  //     setStatus(true);
  //   });
  // }, []);


  const onPurchase = (event) => {
    event.preventDefault();
    const purchaseAmount = price * amount;
    console.log("Buying " + amount + " of " + stock + " stock at " + price + " per share.")
    console.log("Total Amount: " + purchaseAmount)
  };



  return (

    <div className='buy-container'>
      <NavBar />
      <h3>Buy Stock</h3>
      <h5>This page will allow users to purchase more stock</h5>

        <div className='row'>
          <div className='col-6'>
            <InputGroup className="mb-3">
                {/*   <DropdownButton>
                        <DropdownItem>
                          TSLA
                        </DropdownItem>
                        <DropdownItem>
                          CDDR
                        </DropdownItem>
                      </DropdownButton> 
                */}
                <FormControl
                    autoComplete="off"
                    id="stock"
                    placeholder="Stock"
                    aria-label="Stock"
                    aria-describedby="basic-addon1"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <FormControl
                    autoComplete="off"
                    id="amount"
                    type="numeric"
                    placeholder="amount"
                    aria-label="amount"
                    aria-describedby="basic-addon1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                />
            </InputGroup>
          <Button variant='primary' onClick={onPurchase}>Purchase</Button>
        </div>
      </div>
    </div>
  );
};