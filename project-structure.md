dynamic-certificate-portal/
├── README.md
├── docker-compose.yml             # (Optional) For running local DB/Redis
├── .gitignore
│
├── server/                        # BACKEND (Node.js + Express + TS)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                       # DB_URL, AWS_KEYS, etc.
│   │
│   ├── prisma/
│   │   ├── schema.prisma          # The DB Schema we designed
│   │   └── migrations/            # SQL migration history
│   │
│   ├── src/
│   │   ├── app.ts                 # Express App setup (Middlewares)
│   │   ├── server.ts              # Entry point (Port listening)
│   │   │
│   │   ├── config/                # Environment & External Service Config
│   │   │   ├── database.ts        # Prisma Client Instance
│   │   │   ├── aws-s3.ts          # AWS S3 Client Config
│   │   │   └── env.ts             # Environment Variable Loader
│   │   │
│   │   ├── core/                  # Shared Kernel / Core Logic
│   │   │   ├── errors/
│   │   │   │   ├── AppError.ts    # Custom Error Class
│   │   │   │   └── errorHandler.ts# Global Error Middleware
│   │   │   ├── middlewares/
│   │   │   │   ├── upload.ts      # Multer Config (ZIP/PDF)
│   │   │   │   └── logger.ts      # Request Logger
│   │   │   └── utils/
│   │   │       ├── response.ts    # Standard API Response Formatter
│   │   │       └── validator.ts   # Custom Type Checker (No Zod)
│   │   │
│   │   ├── modules/               # FEATURE MODULES (The Core Work)
│   │   │   │
│   │   │   ├── project/           # Module 1: Project Setup
│   │   │   │   ├── project.interface.ts
│   │   │   │   ├── project.controller.ts  # Req/Res handling
│   │   │   │   ├── project.service.ts     # Business Logic
│   │   │   │   └── project.routes.ts      # API Endpoints
│   │   │   │
│   │   │   ├── batch/             # Module 2: File Upload & Parsing
│   │   │   │   ├── batch.interface.ts
│   │   │   │   ├── batch.controller.ts
│   │   │   │   ├── batch.service.ts       # ZIP extraction logic
│   │   │   │   ├── batch.routes.ts
│   │   │   │   └── helpers/
│   │   │   │       ├── excelParser.ts     # SheetJS logic
│   │   │   │       └── zipExtractor.ts    # Adm-zip logic
│   │   │   │
│   │   │   └── issuance/          # Module 3: Generation & Queue
│   │   │       ├── issuance.interface.ts
│   │   │       ├── issuance.controller.ts
│   │   │       ├── issuance.service.ts    # Queue & Polling Logic
│   │   │       ├── issuance.routes.ts
│   │   │       └── helpers/
│   │   │           └── pdfStamper.ts      # pdf-lib Logic (QR generation)
│   │   │
│   │   └── routes/
│   │       └── index.ts           # Main API Router (aggregates modules)
│   │
│   └── tests/                     # Unit & Integration Tests
│       ├── project.test.ts
│       └── validation.test.ts
│
└── client/                        # FRONTEND (React + TS + Vite)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    │
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   │
    │   ├── api/                   # API Integration Layer
    │   │   ├── axiosClient.ts
    │   │   └── endpoints.ts
    │   │
    │   ├── components/            # Shared UI Components
    │   │   ├── common/
    │   │   │   ├── Button.tsx
    │   │   │   ├── ProgressBar.tsx
    │   │   │   └── FileDropzone.tsx
    │   │   └── layout/
    │   │       ├── Navbar.tsx
    │   │       └── Sidebar.tsx
    │   │
    │   ├── modules/               # FEATURE MODULES (Matches Backend)
    │   │   │
    │   │   ├── project/           # Step 1
    │   │   │   ├── CreateProjectForm.tsx
    │   │   │   ├── PdfPreview.tsx # react-pdf implementation
    │   │   │   └── types.ts
    │   │   │
    │   │   ├── batch/             # Step 2
    │   │   │   ├── BatchUpload.tsx
    │   │   │   ├── ValidationSummary.tsx
    │   │   │   └── types.ts
    │   │   │
    │   │   └── dashboard/         # Step 3
    │   │       ├── IssuanceTable.tsx
    │   │       ├── StatusBadge.tsx
    │   │       └── types.ts
    │   │
    │   ├── hooks/                 # Custom Hooks
    │   │   ├── usePolling.ts      # For dashboard updates
    │   │   └── useFileUpload.ts
    │   │
    │   └── utils/
    │       └── helpers.ts
    │
    └── public/