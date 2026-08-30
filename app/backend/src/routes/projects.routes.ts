import { Router } from 'express';
import { store, type Project } from '../data/projects.store.js';

const router = Router();

// GET all projects
router.get('/', (_req, res) => {
  res.status(200).json(store.projects);
});

// GET project by ID
router.get('/:id', (req, res) => {
  const projectId = Number(req.params.id);

  const project = store.projects.find((item) => item.id === projectId);

  if (!project) {
    return res.status(404).json({
      message: 'Project not found',
    });
  }

  return res.status(200).json(project);
});

// CREATE project
router.post('/', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      message: 'Name and description are required',
    });
  }

  const project: Project = {
    id: store.nextProjectId++,
    name,
    description,
    status: 'active',
  };

  store.projects.push(project);

  return res.status(201).json(project);
});

// UPDATE project
router.put('/:id', (req, res) => {
  const projectId = Number(req.params.id);
  const { name, description, status } = req.body;

  const projectIndex = store.projects.findIndex((item) => item.id === projectId);

  if (projectIndex === -1) {
    return res.status(404).json({
      message: 'Project not found',
    });
  }

  if (!name || !description || !status) {
    return res.status(400).json({
      message: 'Name, description and status are required',
    });
  }

  store.projects[projectIndex] = {
    id: projectId,
    name,
    description,
    status,
  };

  return res.status(200).json(store.projects[projectIndex]);
});

// DELETE project
router.delete('/:id', (req, res) => {
  const projectId = Number(req.params.id);

  const projectExists = store.projects.some((item) => item.id === projectId);

  if (!projectExists) {
    return res.status(404).json({
      message: 'Project not found',
    });
  }

  store.projects = store.projects.filter((item) => item.id !== projectId);

  return res.status(204).send();
});

export default router;
