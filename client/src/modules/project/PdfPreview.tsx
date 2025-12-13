import { useCallback, useMemo, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import '../../utils/pdf';

type Props = {
  file: File | null;
  onPick: (coords: { x: number; y: number }) => void;
  picked?: { x: number; y: number } | null;
};

export default function PdfPreview({ file, onPick, picked }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onPick({ x: Math.round(x), y: Math.round(y) });
    },
    [onPick]
  );

  const markerStyle = useMemo(() => {
    if (!picked) return { display: 'none' } as React.CSSProperties;
    return {
      position: 'absolute',
      left: picked.x - 6,
      top: picked.y - 6,
      width: 12,
      height: 12,
      borderRadius: 9999,
      background: '#ef4444',
      border: '2px solid white',
      boxShadow: '0 0 0 2px rgba(239,68,68,0.4)',
      pointerEvents: 'none',
    } as React.CSSProperties;
  }, [picked]);

  if (!file) {
    return <div className="border p-4 text-gray-500">Upload a template PDF to preview and pick QR position.</div>;
  }

  return (
    <div className="border rounded p-2">
      <div className="text-sm text-gray-600 mb-2">Click on the PDF to set the QR position.</div>
      <div ref={containerRef} className="relative inline-block" onClick={handleClick}>
        <Document file={file} loading={<div className="p-6">Loading PDF…</div>}>
          <Page pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false} />
        </Document>
        <div style={markerStyle} />
      </div>
      {picked && <div className="mt-2 text-sm">Picked: x={picked.x}, y={picked.y}</div>}
    </div>
  );
}
