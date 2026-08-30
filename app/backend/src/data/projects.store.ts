export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

const SEED_PROJECTS: Project[] = [
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

export const store = {
  projects: SEED_PROJECTS.map((project) => ({ ...project })),
  nextProjectId: SEED_PROJECTS.length + 1,
};

/** Restores the in-memory project list to its seed state — used by the test-only reset endpoint. */
export function resetProjects() {
  store.projects = SEED_PROJECTS.map((project) => ({ ...project }));
  store.nextProjectId = SEED_PROJECTS.length + 1;
}
