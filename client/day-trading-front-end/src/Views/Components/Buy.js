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


  const onPurchase = (event) => {
    event.preventDefault();
    const purchaseAmount = price * amount;
    console.log("Buying " + amount + " of " + stock + " stock at " + price + " per share.")
    console.log("Total Amount: " + purchaseAmount)
  };



  return (

    <div className='buy-container'>
      <NavBar />
        BUY PAGE BUY PAGE

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