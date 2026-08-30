import { Router } from 'express';

const router = Router();

const DEMO_USER = {
  id: 1,
  email: 'admin@taskflow.com',
  password: 'Admin@123',
  name: 'Admin',
  role: 'admin',
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
    },
  });
});

export default router;
