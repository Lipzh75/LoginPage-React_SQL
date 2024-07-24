import './App.css';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import Register from "./Register";
import UserContext from "./UserContext";
import axios from "axios";
import Login from "./Login";
import logo from './logo.png';
import Home from './Home';

function App() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios.get('http://10.3.8.10:4000/user', { withCredentials: true })
      .then(response => {
        setEmail(response.data.email);
      });
  }, []);

  function logout() {
    axios.post('http://10.3.8.10:4000/logout', {}, { withCredentials: true })
      .then(() => setEmail(''));
  }

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      <BrowserRouter>
        <nav>
          <img src={logo} alt='LOGO' className='logo' />
          <div className='nav-container'>
            <div className='nav-links'>
              <Link to={'/'}>Home</Link>
              {!email && (
                <>
                  <Link to={'/login'}>Einlogen</Link>
                  <Link to={'/register'}>Registrieren</Link>
                </>
              )}
              {!!email && (
                <a onClick={e => { e.preventDefault(); logout(); }}>Ausloggen</a>
              )}
            </div>
          </div>

        </nav>
        <main>
          <Switch>
            <Route exact path={'/'} component={Home} />
            <Route exact path={'/register'} component={Register} />
            <Route exact path={'/login'} component={Login} />
          </Switch>
        </main>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
