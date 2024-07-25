import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from "axios";
import UserContext from "./UserContext";
import Login from "./Login";
import Home from './Home';
import ACP from './ACP';
import './assets/css/App.css';
import logo from './assets/img/gkd.png';
import Account from "./Account";

function App() {
  const [email, setEmail] = useState('');
  const [userGroup, setUserGroup] = useState('');

  useEffect(() => {
    axios.get('http://10.3.8.10:4000/user', { withCredentials: true })
      .then(response => {
        setEmail(response.data.email);
        setUserGroup(response.data.group);
      })
      .catch(err => {
        console.error('Failed to fetch user data:', err);
      });
  }, []);  

  function logout() {
    axios.post('http://10.3.8.10:4000/logout', {}, { withCredentials: true })
      .then(() => {
        setEmail('');
        setUserGroup('');
      })
      .catch(err => {
        console.error('Failed to logout:', err);
      });
  }

  return (
    <UserContext.Provider value={{ email, setEmail, userGroup, setUserGroup }}>
      <BrowserRouter>
        <nav>
          <img src={logo} alt='LOGO' className='logo' />
          <div className='nav-container'>
            <div className='nav-links'>
              {!!email && (
                <>
                  <Link to={'/docs'}>Docusaurus</Link>
                  {userGroup === 'Admin' || userGroup === 'Editor' ? (<Link to={'/'}>CMS & Editor</Link>) : null}
                  {userGroup === 'Admin' && <Link to={'/acp'}>ACP</Link>}
                </>
              )}
            </div>

            {!!email && (
              <div className='user-logout-container'>
                <a className='user-icon' href="/account"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg></a>
                <a className='logout' onClick={e => { e.preventDefault(); logout(); }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="logout-icon"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg></a>
              </div>
            )}
          </div>
        </nav>
        <main>
          <Switch>
            <Route exact path={'/'} component={Home} />
            <Route exact path={'/account'} component={Account} />
            <Route exact path={'/login'} component={Login} />
            <Route exact path={'/acp'}>{userGroup === 'Admin' ? <ACP /> : <Redirect to='/' />}</Route>
          </Switch>
        </main>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
