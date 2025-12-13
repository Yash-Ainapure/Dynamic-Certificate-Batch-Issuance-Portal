import { pdfjs } from 'react-pdf';

// Configure react-pdf's pdfjs worker referencing the exact version of the API in use
// This prevents UnknownErrorException about API vs Worker version mismatch
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
