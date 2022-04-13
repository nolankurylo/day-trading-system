import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './Views/App';
import Login from './Views/Components/Login';
import SignUp from "./Views/Components/SignUp";
import Buy from "./Views/Components/Buy";
import Sell from "./Views/Components/Sell"
import { Account } from './Views/Components/Account';
import AccountSummary from './Views/Components/AccountSummary';
import Settings from './Views/Components/Settings';
import reportWebVitals from './test/reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Account>
      <Routes>
          <Route path="/" element={<App />}/>
          <Route path="/register" element={<SignUp />}/>
          <Route path="/login" element={<Login />}/>
          <Route path='/buy' element={<Buy />} />
          <Route path='/sell' element={<Sell />}/>
          <Route path='/account_summary' element={<AccountSummary />}/>
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </Account>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
