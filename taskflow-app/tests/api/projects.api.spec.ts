import { test, expect } from '../fixtures/project.fixture';

test.describe('Projects API', () => {
  test('should return projects successfully', async ({
    request,
  }) => {
    const response = await request.get(
      'http://localhost:3000/api/projects'
    );

    expect(response.status()).toBe(200);

    const projects = await response.json();

    expect(Array.isArray(projects)).toBeTruthy();
    expect(projects.length).toBeGreaterThan(0);
  });

  test('should return a project created by the fixture', async ({
    request,
    project,
  }) => {
    const response = await request.get(
      `http://localhost:3000/api/projects/${project.id}`
    );

    expect(response.status()).toBe(200);

    const responseProject = await response.json();

    expect(responseProject).toEqual(project);
  });

  test('should create a new project', async ({ request }) => {
  const projectData = {
    name: `API Project ${Date.now()}`,
    description: 'Created through Playwright API test',
  };

  const response = await request.post(
    'http://localhost:3000/api/projects',
    {
      data: projectData,
    }
  );

  expect(response.status()).toBe(201);

  const project = await response.json();

  expect(project).toMatchObject({
    name: projectData.name,
    description: projectData.description,
    status: 'active',
  });

  expect(project.id).toBeDefined();

  // Cleanup
  const deleteResponse = await request.delete(
    `http://localhost:3000/api/projects/${project.id}`
  );

  expect(deleteResponse.status()).toBe(204);
});

test('should reject project creation when required fields are missing', async ({
  request,
}) => {
  const response = await request.post(
    'http://localhost:3000/api/projects',
    {
      data: {
        name: 'Incomplete Project',
      },
    }
  );

  expect(response.status()).toBe(400);

  const body = await response.json();

  expect(body.message).toBe(
    'Name and description are required'
  );
});

test('should update an existing project', async ({
  request,
  project,
}) => {
  const updatedData = {
    name: `Updated ${project.name}`,
    description: 'Updated through Playwright API test',
    status: 'completed' as const,
  };

  const response = await request.put(
    `http://localhost:3000/api/projects/${project.id}`,
    {
      data: updatedData,
    }
  );

  expect(response.status()).toBe(200);

  const updatedProject = await response.json();

  expect(updatedProject).toMatchObject({
    id: project.id,
    name: updatedData.name,
    description: updatedData.description,
    status: 'completed',
  });
});

test('should return 404 when updating a non-existent project', async ({
  request,
}) => {
  const response = await request.put(
    'http://localhost:3000/api/projects/999999',
    {
      data: {
        name: 'Updated Project',
        description: 'Updated description',
        status: 'completed',
      },
    }
  );

  expect(response.status()).toBe(404);

  const body = await response.json();

  expect(body.message).toBe('Project not found');
});

test('should delete an existing project', async ({
  request,
  project,
}) => {
  const response = await request.delete(
    `http://localhost:3000/api/projects/${project.id}`
  );

  expect(response.status()).toBe(204);

  const getResponse = await request.get(
    `http://localhost:3000/api/projects/${project.id}`
  );

  expect(getResponse.status()).toBe(404);

  const body = await getResponse.json();

  expect(body.message).toBe('Project not found');
});

test('should return 404 when deleting a non-existent project', async ({
  request,
}) => {
  const response = await request.delete(
    'http://localhost:3000/api/projects/999999'
  );

  expect(response.status()).toBe(404);

  const body = await response.json();

  expect(body.message).toBe('Project not found');
});
});