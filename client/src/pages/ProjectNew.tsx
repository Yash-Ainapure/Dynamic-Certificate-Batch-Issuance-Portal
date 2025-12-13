import CreateProjectForm from '../modules/project/CreateProjectForm';

export default function ProjectNew() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Project</h1>
      <CreateProjectForm />
    </div>
  );
}
