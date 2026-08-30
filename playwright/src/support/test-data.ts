export interface ProjectPayload {
  name: string;
  description: string;
}

export function buildProjectPayload(overrides: Partial<ProjectPayload> = {}): ProjectPayload {
  return {
    name: `Automation Project ${Date.now()}`,
    description: 'Created by Playwright',
    ...overrides,
  };
}
