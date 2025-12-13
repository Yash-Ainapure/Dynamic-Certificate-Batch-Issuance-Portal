export default function StatusBadge({ status }: { status: string }) {
  return <span className="px-2 py-1 rounded bg-gray-200 text-sm">{status}</span>;
}
