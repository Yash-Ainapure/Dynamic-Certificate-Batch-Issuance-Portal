import FileDropzone from '../../components/common/FileDropzone';

export default function BatchUpload() {
  return (
    <div className="space-y-4">
      <FileDropzone onFiles={() => {}} />
    </div>
  );
}
