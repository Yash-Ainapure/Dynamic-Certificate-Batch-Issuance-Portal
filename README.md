# Dynamic Certificate Batch Issuance Portal

## High level architecture
<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/1cee3230-877c-401a-a812-835ac0422d17" />

## QR verification service
<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/26dd64fb-4398-4e12-aed5-e9f7ff0787d3" />

## Setup instructions
1) Install dependencies
   - In `server/`: `npm install`
   - In `client/`: `npm install`

2) Configure environment variables
   - Create `server/.env` based on [server/.env.example](cci:7://file:///home/yash/Desktop/projects/ai-certs/server/.env.example:0:0-0:0):
   - Fill in `DATABASE_URL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `PORT`
   - Create `client/.env` based on [client/.env.example](cci:7://file:///home/yash/Desktop/projects/ai-certs/client/.env.example:0:0-0:0):
   - Fill in `VITE_API_BASE_URL`

3) Database & Prisma
   - In `server/`: `npm run prisma:generate`
   - Sync schema to DB (dev): `npx prisma db push`

4) Run in development
   - Server (http://localhost:4000): `npm run dev` in `server/`
   - Client (http://localhost:5173): `npm run dev` in `client/`

## Features implemented
- Create a certificate project with a sample certificate template (PDF).
- Select QR code placement coordinates.
- Upload a ZIP with personalized PDFs and a single Excel mapping file.
- Validate the zip with predefined rules
- Issue batch with statuses and download the issued certificate having QR code printed on it.
- Verify issued certificates by scanning the QR code printed on certificate pdf.

## Technologies used
- Client: React + TypeScript + Vite + Tailwind
- Server: Node.js + Express + TypeScript
- ORM/DB: Prisma + PostgreSQL (AWS RDS)
- Storage: AWS S3

## Optional features attempted
- Persists data in AWS RDS database
- Uses AWS S3 for zip and issued certificates storage
- Deployed frontend on vercel and backend on render


# Notes for uploading zip
- its should contain a excel file and pdf files
- the excel file should have a column named "excelCertId" and "fileName"
- all the pdf file names should be present in excel file
- while selecting QR coordinates select the top left corner of QR code position

