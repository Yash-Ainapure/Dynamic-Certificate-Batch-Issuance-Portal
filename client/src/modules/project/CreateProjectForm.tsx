import React from 'react';
import Button from '../../components/common/Button';

export default function CreateProjectForm() {
  return (
    <form className="space-y-4">
      <input className="border p-2 w-full" placeholder="Project Name" />
      <textarea className="border p-2 w-full" placeholder="Description" />
      <input className="border p-2 w-full" placeholder="Issuer" />
      <input className="border p-2 w-full" type="date" />
      <Button label="Create Project" />
    </form>
  );
}
