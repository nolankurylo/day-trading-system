import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Card,
  FormControl,
  InputGroup,
  Modal,
  NavLink,
} from "react-bootstrap";
import UserPool from "../UserPool";
import NavBar from "./Navbar";
import axios from "axios";

export default function AccountSummary(props) {
  const apiEndpoint = "http://localhost:3000";

  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [initialAmount, setInitialAmount] = useState([]);

  var user = UserPool.getCurrentUser();

  useEffect(() => {
    // GET USER FUNDS -> EASY QUERY

    const get_req = { username: user.username };

    axios.post(apiEndpoint + "/get_initial_funds", get_req).then((res) => {
      const result = res.data;
      console.log(result.rows.funds);
      setInitialAmount(result.rows);
    });

    axios.post(apiEndpoint + "/get_transactions", get_req).then((res) => {
      const result = res.data;
      setTransactions(result.rows);
    });
  }, []);

  const addFunds = (event) => {
    event.preventDefault();
    console.log("Adding " + additionalAmount + " to Account");

    const min = 1;
    const max = 9999999;
    const rand = min + Math.random() * (max - min);

    const post_req = {
      userid: user.username,
      amount: additionalAmount,
      nextTransactionNum: Math.round(rand),
    };

    axios.post(apiEndpoint + "/add", post_req).then((res) => {
      const result = res.data;
      console.log(result);
      window.location.reload();
    });
  };

  return (
    <div className="as-container mb-5">
      <NavBar />

      <div className="row">
        <div className="col-8 offset-md-2">
          <h1>Account Summary</h1>
          <h2> Welcome, {user.username}</h2>
          {initialAmount.map((amount, index) => {
            return <h3 key={index}>Available Funds: ${amount.funds}</h3>;
          })}
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
          <Button variant="primary" onClick={addFunds}>
            Add Funds
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="col-8 offset-md-2">
          <h3>
            <u>Transaction Summary</u>
          </h3>
          <table
            style={{
              borderWidth: "1px",
              borderColor: "black",
              borderStyle: "solid",
            }}
          >
            <thead
              style={{
                borderWidth: "1px",
                borderColor: "black",
                borderStyle: "solid",
              }}
            >
              <tr
                style={{
                  borderWidth: "1px",
                  borderColor: "black",
                  borderStyle: "solid",
                }}
              >
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  Action
                </th>
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  Funds
                </th>
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  Stock Symbol
                </th>
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  Price
                </th>
                <th
                  style={{
                    borderWidth: "1px",
                    borderColor: "black",
                    borderStyle: "solid",
                  }}
                >
                  Number of Stocks
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                borderWidth: "1px",
                borderColor: "black",
                borderStyle: "solid",
              }}
            >
              {transactions.map((transaction, index) => {
                return (
                  <tr
                    key={transaction.id}
                    style={{
                      borderWidth: "1px",
                      borderColor: "black",
                      borderStyle: "solid",
                      fontSize: "12px",
                    }}
                  >
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.id}
                    </td>
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.command}
                    </td>
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.funds}
                    </td>
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.stocksymbol}
                    </td>
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.price}
                    </td>
                    <td
                      style={{
                        borderWidth: "1px",
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      {transaction.num_stocks}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
