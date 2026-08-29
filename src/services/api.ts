const API_BASE_URL = 'http://localhost:3000/api';

export async function login(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
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
    throw new Error(data.message);
  }

  return data;
}

export async function getProjects() {
  const response = await fetch(
    `${API_BASE_URL}/projects`
  );

  if (!response.ok) {
    throw new Error('Unable to load projects');
  }

  return response.json();
}

export async function createProject(
  name: string,
  description: string
) {
  const response = await fetch(
    `${API_BASE_URL}/projects`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

export async function updateProject(
  id: number,
  name: string,
  description: string,
  status: 'active' | 'completed'
) {
  const response = await fetch(
    `${API_BASE_URL}/projects/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

export async function deleteProject(id: number) {
  const response = await fetch(
    `${API_BASE_URL}/projects/${id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
}