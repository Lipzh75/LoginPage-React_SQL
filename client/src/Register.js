import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import './Form.css';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState('');

  const user = useContext(UserContext);

  function registerUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios.post('http://10.3.8.10:4000/register', data, { withCredentials: true })
      .then(response => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setRedirect(true);
      });
  }

  if (redirect) {
    return <Redirect to={'/'}/>
  }

  return (
    <div className="form-container">
      <h2>Registrieren</h2>
      <form onSubmit={registerUser}>
        <div className="form-group">
          <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Registrieren</button>
      </form>
    </div>
  );
}

export default Register;
