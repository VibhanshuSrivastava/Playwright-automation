import { useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import ProjectsPage from "./pages/ProjectsPage"

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Email and password are required');
    return;
  }

  try {
    const response = await fetch(
      'http://localhost:3000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
      return;
    }

    setIsLoggedIn(true);
  } catch {
    setError('Unable to connect to the server');
  }
};

  if (isLoggedIn) {
    if (isLoggedIn) {
  return <ProjectsPage />;
}
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">TaskFlow</div>

        <h1>Welcome back</h1>

        <p className="subtitle">
          Sign in to continue to your workspace
        </p>

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

        <p className="demo-credentials">
          Demo: admin@taskflow.com / Admin@123
        </p>
      </div>
    </div>
  );
}

export default App;