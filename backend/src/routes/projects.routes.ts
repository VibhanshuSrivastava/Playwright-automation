import { Router } from 'express';

const router = Router();

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

let projects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Redesign the company website',
    status: 'active',
  },
  {
    id: 2,
    name: 'Mobile Application',
    description: 'Build the new mobile application',
    status: 'active',
  },
];

let nextProjectId = 3;

// GET all projects
router.get('/', (_req, res) => {
  res.status(200).json(projects);
});

// GET project by ID
router.get('/:id', (req, res) => {
  const projectId = Number(req.params.id);

  const project = projects.find(
    (item) => item.id === projectId
  );

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
    id: nextProjectId++,
    name,
    description,
    status: 'active',
  };

  projects.push(project);

  return res.status(201).json(project);
});

// UPDATE project
router.put('/:id', (req, res) => {
  const projectId = Number(req.params.id);
  const { name, description, status } = req.body;

  const projectIndex = projects.findIndex(
    (item) => item.id === projectId
  );

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

  projects[projectIndex] = {
    id: projectId,
    name,
    description,
    status,
  };

  return res.status(200).json(projects[projectIndex]);
});

// DELETE project
router.delete('/:id', (req, res) => {
  const projectId = Number(req.params.id);

  const projectExists = projects.some(
    (item) => item.id === projectId
  );

  if (!projectExists) {
    return res.status(404).json({
      message: 'Project not found',
    });
  }

  projects = projects.filter(
    (item) => item.id !== projectId
  );

  return res.status(204).send();
});

export default router;