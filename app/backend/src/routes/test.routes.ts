import { Router } from 'express';
import { resetProjects } from '../data/projects.store.js';

const router = Router();

// Test-only utility: restores the in-memory project list to its seed state,
// so end-to-end tests can start from a known, deterministic dataset instead
// of whatever other tests happened to leave behind. Not available when
// NODE_ENV=production.
router.post('/reset', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      message: 'Not available in production',
    });
  }

  resetProjects();

  return res.status(204).send();
});

export default router;
