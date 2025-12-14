# Dynamic Certificate Batch Issuance Portal

Monorepo with `server` (Node/Express/TS/Prisma) and `client` (React/TS/Vite/Tailwind).

## Overview
A 3-step web app to:
- Create a project with a template PDF and QR placement coordinates.
- Upload a ZIP with personalized PDFs and a single Excel mapping file.
- Validate and issue batch with statuses and downloads.

## High level architecture
<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/1cee3230-877c-401a-a812-835ac0422d17" />

## QR verification service
<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/26dd64fb-4398-4e12-aed5-e9f7ff0787d3" />


## Tech Stack
- Client: React + TypeScript + Vite + Tailwind
- Server: Node.js + Express + TypeScript
- ORM/DB: Prisma + PostgreSQL (AWS RDS)
- Storage: AWS S3

## Monorepo Structure
- Server: `server/`
- Client: `client/`


## Prerequisites
- Node.js 18+ (LTS recommended)
- npm/pnpm/yarn
- PostgreSQL instance (AWS RDS)
- AWS account with an S3 bucket

## Environment Variables (server)
Create `server/.env` based on [server/.env.example](cci:7://file:///home/yash/Desktop/projects/ai-certs/server/.env.example:0:0-0:0):

- Database
  - `DATABASE_URL` = `postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public`

- AWS
  - `AWS_REGION` (e.g., `ap-south-1`)
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET` (your bucket name)

- App
  - `PORT` (default `4000`)

## Client Environment Variables
Create `client/.env.local` (or `client/.env`) and set:
- API
  - `VITE_API_BASE_URL` (e.g., `http://localhost:4000`)

## Local Setup
1) Install dependencies
   - In `server/`: `npm install`
   - In `client/`: `npm install`

2) Configure environment
   - Copy [server/.env.example](cci:7://file:///home/yash/Desktop/projects/ai-certs/server/.env.example:0:0-0:0) → `server/.env`
   - Fill in `DATABASE_URL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `PORT`

3) Database & Prisma
   - In `server/`: `npm run prisma:generate`
   - Sync schema to DB (dev): `npx prisma db push`

4) Run in development
   - Server (http://localhost:4000): `npm run dev` in `server/`
   - Client (http://localhost:5173): `npm run dev` in `client/`
