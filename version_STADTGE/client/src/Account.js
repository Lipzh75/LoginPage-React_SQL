import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { Redirect } from 'react-router-dom';
import './assets/css/Account.css'; // Create this CSS file for styling

function Account() {
  const { email, setEmail } = useContext(UserContext);
  const [lastLogin, setLastLogin] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    if (email) {
      axios.get('http://10.3.8.10:4000/userInfo', { withCredentials: true })
        .then(response => setLastLogin(response.data.lastLogin))
        .catch(err => console.error('Failed to fetch user info:', err));
    }
  }, [email]);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    axios.post('http://10.3.8.10:4000/changePassword', { password: newPassword }, { withCredentials: true })
      .then(() => alert('Password changed successfully'))
      .catch(err => setError('Failed to change password: ' + err.message));
  };

  const handleDeleteAccount = () => {
    axios.post('http://10.3.8.10:4000/deleteAccount', {}, { withCredentials: true })
      .then(() => {
        alert('Account deleted successfully');
        setEmail('');
        setRedirect('/login');
      })
      .catch(err => setError('Failed to delete account: ' + err.message));
  };

  if (!email) {
    return <Redirect to="/login" />;
  }

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  return (
    <div className="account-container">
      <h1>Account Information</h1>
      <div className="account-info">
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Last Login:</strong> {lastLogin}</p>
      </div>
      <form onSubmit={handleChangePassword} className="change-password-form">
        <h2>Change Password</h2>
        <input
          type="password"
          placeholder="Current Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Change Password</button>
      </form>
      <button onClick={handleDeleteAccount} className="delete-account-button">Delete Account</button>
    </div>
  );
}

export default Account;
