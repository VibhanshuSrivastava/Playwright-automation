import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed'>('active');
  const [updating, setUpdating] = useState(false);

  const fetchProjects = async () => {
  try {
    setLoading(true);
    setError('');

    const data = await getProjects();
    setProjects(data);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Unable to load projects'
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      return;
    }

    try {
      setCreating(true);

      const data = await createProject(
  name,
  description
);

setProjects((currentProjects) => [
  ...currentProjects,
  data,
]);

setName('');
setDescription('');
setSuccess('Project created successfully');
    } catch {
      setError('Unable to connect to the server');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (project: Project) => {
  setEditingProjectId(project.id);
  setEditName(project.name);
  setEditDescription(project.description);
  setEditStatus(project.status);
  setError('');
  setSuccess('');
  };

  const handleUpdateProject = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setError('');
  setSuccess('');

  if (!editName.trim() || !editDescription.trim()) {
    setError('Name and description are required');
    return;
  }

  if (editingProjectId === null) {
    return;
  }

  try {
    setUpdating(true);

    const data = await updateProject(
      editingProjectId,
      editName,
      editDescription,
      editStatus
    );

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === editingProjectId
          ? data
          : project
      )
    );

    setEditingProjectId(null);
    setSuccess('Project updated successfully');
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Unable to update project'
    );
  } finally {
    setUpdating(false);
  }
};

const handleDeleteProject = async (projectId: number) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this project?'
  );

  if (!confirmed) {
    return;
  }

  setError('');
  setSuccess('');

  try {
    await deleteProject(projectId);

    setProjects((currentProjects) =>
      currentProjects.filter(
        (project) => project.id !== projectId
      )
    );

    setSuccess('Project deleted successfully');
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Unable to delete project'
    );
  }
};



  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div className="projects-page">
      <h1>Projects</h1>

      <form onSubmit={handleCreateProject}>
        <div className="form-group">
          <label htmlFor="project-name">
            Project name
          </label>

          <input
            id="project-name"
            type="text"
            placeholder="Enter project name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="project-description">
            Description
          </label>

          <textarea
            id="project-description"
            placeholder="Enter project description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="success-message">
            {success}
          </p>
        )}

        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create project'}
        </button>
      </form>

      <hr />

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
  <div
    className="project-card"
    key={project.id}
  >
    {editingProjectId === project.id ? (
      <form onSubmit={handleUpdateProject}>
        <div className="form-group">
          <label htmlFor={`edit-name-${project.id}`}>
            Project name
          </label>

          <input
            id={`edit-name-${project.id}`}
            value={editName}
            onChange={(event) =>
              setEditName(event.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor={`edit-description-${project.id}`}>
            Description
          </label>

          <textarea
            id={`edit-description-${project.id}`}
            value={editDescription}
            onChange={(event) =>
              setEditDescription(event.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor={`edit-status-${project.id}`}>
            Status
          </label>

          <select
            id={`edit-status-${project.id}`}
            value={editStatus}
            onChange={(event) =>
              setEditStatus(
                event.target.value as 'active' | 'completed'
              )
            }
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" disabled={updating}>
          {updating ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={() => setEditingProjectId(null)}
          disabled={updating}
        >
          Cancel
        </button>
      </form>
    ) : (
      <>
        <h2>{project.name}</h2>

        <p>{project.description}</p>

        <span>
          Status: {project.status}
        </span>

        <div>
  <button
    type="button"
    onClick={() => startEditing(project)}
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleDeleteProject(project.id)}
  >
    Delete
  </button>
</div>
      </>
    )}
  </div>
))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;