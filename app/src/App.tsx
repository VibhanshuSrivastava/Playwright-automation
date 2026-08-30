import { useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import ProjectsPage from './pages/ProjectsPage';
import { login } from './services/api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('taskflow:isLoggedIn') === 'true');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      await login(email, password);

      localStorage.setItem('taskflow:isLoggedIn', 'true');
      setIsLoggedIn(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to connect to the server');
    }
  };

  if (isLoggedIn) {
    return <ProjectsPage />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">TaskFlow</div>

        <h1>Welcome back</h1>

        <p className="subtitle">Sign in to continue to your workspace</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit">Sign in</button>
        </form>

        <p className="demo-credentials">Demo: admin@taskflow.com / Admin@123</p>
      </div>
    </div>
  );
}

export default App;
