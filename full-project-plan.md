Project Description: Dynamic Certificate Batch Issuance Portal(Web App)
Overview:
Build a 3-step certificate issuance web application that allows an admin user to:

Create a certificate project with a sample certificate template (PDF).

Upload a ZIP file containing personalized PDFs and a corresponding Excel mapping file.

Validate uploaded files, preview issuance details, and simulate real-time batch issuance.

View issued certificates in a dashboard with download and retry options.
This simulates a real-world bulk digital certificate issuing system.
Goals:
By the end of this assignment, the intern should be able to:
Build a frontend in React that follows a multi-step flow.

Build a backend in Node.js that processes PDFs, ZIPs, and Excel files.

Handle file uploads, validations, and batch processing.

Persist project data and provide resumable flows.

Create a basic real-time dashboard using polling or WebSockets.
Assignment Breakdown:
Step 1: Create a Project & Upload Template PDF
Frontend Tasks:
Create a form with fields: Project Name, Description, Issuer, Issue Date.

Upload a sample certificate PDF.

Display the PDF using react-pdf/pdf.js.

Allow user to click on the PDF and record the (X, Y) coordinates of the QR code position.

Show step-wise tooltips using react-joyride or any custom logic with localStorage.
Backend Tasks:
Create endpoint to save project data and uploaded sample PDF.

Store QR code coordinates and allow retrieving them when the project is revisited.
Step 2: Upload Batch ZIP File
Frontend Tasks:
Provide interface to upload a ZIP containing:
Multiple PDFs.

One Excel file mapping certificate IDs to filenames.
Allow re-upload if validation fails.

Display:
Total entries found.

Number of valid/invalid records.

Estimated processing time (based on dummy logic).

Automatic batch breakdown (e.g., 50-50-50-50-50).
Display validation messages.
Backend Tasks:
Create endpoint to receive the ZIP file and extract contents.

Parse Excel file and verify that filenames match those in ZIP.

Validate max limit (e.g., 250 certificates); make this configurable in backend.

Return validation summary to frontend.

Store validated ZIP in aws S3.
Step 3: Issuance Dashboard
Frontend Tasks:
Create dashboard page with table:
Certificate ID, Status (Pending, In Progress, Issued, Failed), Action buttons.

View Certificate (preview PDF).

Retry, Reissue, or Republish options.

“Open in Verification Portal” button linking to https://verify.example-url.com?id=certificateId
Display real-time updates using long pooling.

Show batch-wise progress (e.g., Batch 1: 50/50 complete).
Backend Tasks:
Simulate certificate issuance using queues.

Update statuses in DB

Push status updates to frontend via pooling

Provide endpoint to return all issued certificates as a downloadable ZIP.

Delete uploaded ZIP after issuance completes (optional for prototype).
Persist data in PostgreSQL using a provider like neon.
use prisma orm.
Use AWS S3 to store files.

Write unit tests for validation logic.

Deploy frontend/backend to a platform like Vercel/Render for demo.
Deliverables:
GitHub repository with complete code (frontend + backend).

README.md file with:
Setup instructions
Features implemented
Technologies used

Optional features attempted
Sample ZIP file with PDFs and Excel used for testing

File Uploads Format & Sample
You should support a ZIP file that includes:
Multiple PDFs (named exactly as in Excel)
1 Excel sheet with metadata mapping
project-files.zip
┣ certificate_map.xlsx
┣ john_doe.pdf
┣ jane_doe.pdf
┗ ... up to 250

Instructions for assignee:
Submit your Demo Screen recording file, GitHub repo link and deployed link.
Include clear comments in your code for easier review.