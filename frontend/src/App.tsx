import type { Project } from './app/features/projects/projects.types';
import { useGetProjectsQuery } from './app/features/projects/projectsApi';

function App() {
  const {
    data: projects,
    isLoading,
    isError,
  } = useGetProjectsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to load projects</div>;
  }

  return (
    <div>
      <h1>MBD Dashboard</h1>

      <h2>Projects</h2>

      {projects?.map((project: Project) => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.customer}</p>
        </div>
      ))}
    </div>
  );
}

export default App;