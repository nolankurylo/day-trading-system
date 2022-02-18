import React, { useState, useContext, useEffect } from "react";
import {Button, Card, FormControl, InputGroup, Modal} from 'react-bootstrap'
import NavBar from "./Navbar";
import { AccountContext } from "./Account";
import UserPool from '../UserPool';

export default function Sell (props) {

  const [stock, setStock] = useState("")
  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(50)
  const [status, setStatus] = useState(false);
  const { getSession, logout } = useContext(AccountContext);

  // var user = UserPool.getCurrentUser();

  // console.log(getSession())

  // useEffect(() => {
  //   getSession().then((session) => {
  //     console.log("Session: ", session);
  //     setStatus(true);
  //   });
  // }, []);


  const onSell = (event) => {
    event.preventDefault();
    const purchaseAmount = price * amount;
    console.log(stock)
    console.log(purchaseAmount)
  };

  return (

    <div className='sell-container'>
        <NavBar />
          <h3>Sell Stock</h3>
          <h5>This page will allow a user to view all stocks they own, and sell a specified amount and receive the funds back into account</h5>

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
          <Button variant='primary' onClick={onSell}>Sell</Button>
        </div>
      </div>
    </div>
  );
};