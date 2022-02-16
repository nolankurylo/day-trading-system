import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './Views/App';
import Login from './Views/Login';
import SignUp from "./Views/SignUp";
import reportWebVitals from './test/reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
          <Route path="/" element={<App />}/>
          <Route path="/register" element={<SignUp />}/>
          <Route path="/login" element={<Login />}/>
        </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
