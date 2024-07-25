import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import './assets/css/Form.css';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [redirect, setRedirect] = useState('');

  const user = useContext(UserContext);

  function loginUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios.post('http://10.3.8.10:4000/login', data, { withCredentials: true })
      .then(response => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setLoginError(false);
        setRedirect(true);
      })
      .catch(() => {
        setLoginError(true);
      });
  }

  if (redirect) {
    return <Redirect to={'/'}/>
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      {loginError && (
        <div className="error">LOGIN ERROR! Falsche E-Mail oder Passwort!</div>
      )}
      <form onSubmit={loginUser}>
        <div className="form-group">
          <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
}

export default Login;
