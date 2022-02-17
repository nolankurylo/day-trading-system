import '../css/App.css';
import Login from './Components/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserPool from './UserPool';
import Home from './Components/Home';
import { Account } from './Components/Account'


function App() {

var isAuth = false

if (UserPool.getCurrentUser()) {

  isAuth = true
}

  return (
    
    <Account>

      { isAuth?
        <Home />
        :
        <Login/>
        }
    </Account>
  );
}

export default App;
