import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { Redirect } from 'react-router-dom';
import './assets/css/ACP.css';

function ACP() {
  const { userGroup } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [redirect, setRedirect] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUserGroup, setNewUserGroup] = useState('readOnly');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [listError, setListError] = useState('');
  const [listSuccess, setListSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    axios.get('http://10.3.8.10:4000/check-admin', { withCredentials: true })
      .then(response => {
        if (response.data.allowed === false) {
          setRedirect('/');
        }
      })
      .catch(() => setRedirect('/'));
  }, []);

  useEffect(() => {
    axios.get('http://10.3.8.10:4000/users', { withCredentials: true })
      .then(response => {
        setUsers(response.data);
        setListError('');
        setListSuccess('');
      })
      .catch(() => setRedirect('/'));
  }, []);

  function handleDeleteUser(userId) {
    if (window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      axios.delete(`http://10.3.8.10:4000/deleteUser/${userId}`, { withCredentials: true })
        .then(() => {
          setUsers(users.filter(user => user.id !== userId));
          setListSuccess('Benutzer erfolgreich gelöscht.');
        })
        .catch(() => setListError('Fehler beim Löschen des Benutzers.'));
    }
  }

  function handleCreateUser(e) {
    e.preventDefault();
    if (newUserPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    const userData = { email: newUserEmail, password: newUserPassword, group: newUserGroup };
    axios.post('http://10.3.8.10:4000/createUser', userData, { withCredentials: true })
      .then(() => {
        setNewUserEmail('');
        setNewUserPassword('');
        setConfirmPassword('');
        setNewUserGroup('readOnly');
        setSuccess('Benutzer erfolgreich erstellt.');
        axios.get('http://10.3.8.10:4000/users', { withCredentials: true })
          .then(response => setUsers(response.data))
          .catch(() => setError('Fehler beim Laden der Benutzerliste.'));
      })
      .catch(() => setError('Fehler beim Erstellen des Benutzers.'));
  }

  function generateRandomPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const length = Math.floor(Math.random() * (14 - 8 + 1)) + 8;
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setNewUserPassword(password);
    setConfirmPassword(password);
  }

  function togglePasswordVisibility() {
    setPasswordVisible(!passwordVisible);
  }

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (userGroup !== 'Admin') {
    return <Redirect to='/' />;
  }

  return (
    <div className="acp-container">
      <div className="acp-content">
        <div className="user-list-container">
          <h2>Benutzerliste</h2>
          {listError && <div className="error">{listError}</div>}
          {listSuccess && <div className="success">{listSuccess}</div>}
          <ul className="user-list">
            {users.slice(0, 5).map(user => (
              <li key={user.id} className="user-list-item">
                <div className="user-info">
                  <span>{user.email}</span>
                  <span>Gruppe: {user.group}</span>
                </div>
                <div className="user-actions">
                  <select
                    value={user.group}
                    onChange={(e) => {
                      const newGroup = e.target.value;
                      axios.post(`http://10.3.8.10:4000/updateUserGroup/${user.id}`, { group: newGroup }, { withCredentials: true })
                        .then(() => {
                          setUsers(users.map(u => u.id === user.id ? { ...u, group: newGroup } : u));
                        })
                        .catch(() => setError('Fehler beim Aktualisieren der Benutzergruppe.'));
                    }}
                  >
                    <option value="readOnly">Read-Only</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <button onClick={() => handleDeleteUser(user.id)}>Löschen</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="create-user-container">
          <h2>Benutzer erstellen</h2>
          <form className="create-user-form" onSubmit={handleCreateUser}>
            <div className="form-group">
              <label htmlFor="email">E-Mail:</label>
              <input
                type="email"
                id="email"
                className="input-field"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Passwort:</label>
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                className="input-field"
                value={newUserPassword}
                onChange={e => setNewUserPassword(e.target.value)}
                required
                style={{width: '100%'}} // Sicherstellen, dass das Feld die maximale Breite beibehält
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Wiederholen:</label>
              <input
                type="password"
                id="confirm-password"
                className="input-field"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{width: '100%'}} // Sicherstellen, dass das Feld die maximale Breite beibehält
              />
            </div>
            <div className="form-group">
              <label htmlFor="group">Benutzergruppe:</label>
              <select
                id="group"
                className="input-field"
                value={newUserGroup}
                onChange={e => setNewUserGroup(e.target.value)}
                required
              >
                <option value="readOnly">Read-Only</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-group full-width">
              <button
                type="button"
                className="generate-password-button"
                onClick={generateRandomPassword}
              >
                Zufälliges Passwort
              </button>
              
              <button
                type="button"
                className="toggle-visibility-button"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Passwort Verbergen' : 'Passwort Anzeigen'}
              </button>

              <button type="submit" className="submit-button">Benutzer Erstellen</button>
            </div>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default ACP;
