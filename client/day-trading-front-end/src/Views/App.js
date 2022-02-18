import '../css/App.css';
import Login from './Components/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserPool from './UserPool';
import Home from './Components/Home';
import NavBar from './Components/Navbar';
import { Account } from './Components/Account'


function App() {

var isAuth = false

if (UserPool.getCurrentUser()) {

  isAuth = true
}

  return (
    
    <div>
      { isAuth?
        <div>
          <Home />
        </div>
        :
        <div>
          <Login />
        </div>
        }
    </div>
  );
}

export default App;
