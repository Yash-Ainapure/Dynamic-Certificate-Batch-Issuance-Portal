import React from 'react';

type Props = { onFiles: (files: FileList) => void };
export default function FileDropzone({ onFiles }: Props) {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFiles(e.target.files);
  }
  return (
    <label className="flex items-center justify-center border-2 border-dashed rounded p-8 cursor-pointer text-gray-600">
      <input type="file" className="hidden" onChange={onChange} />
      Drop files here or click to browse
    </label>
  );
}
