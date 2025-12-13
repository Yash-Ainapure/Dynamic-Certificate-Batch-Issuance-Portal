// 1. Setup
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 2. Enums (Strict status tracking)
enum BatchStatus {
  UPLOADED
  PROCESSING
  COMPLETED
  FAILED
}

enum CertStatus {
  PENDING      // Validated but not yet stamped
  QUEUED       // Added to the processing queue
  ISSUED       // PDF generated with QR code
  FAILED       // Error during generation
  INVALID      // Excel row didn't match a file in ZIP
}

// 3. Models

// STEP 1: The "Project" (Config)
model Project {
  id          String   @id @default(uuid())
  name        String
  description String
  issuer      String   // e.g., "Google", "University of X"
  issueDate   DateTime 
  
  // Template Details
  templateUrl String   // S3 URL of the blank PDF uploaded in Step 1
  qrX         Float    // X coordinate clicked by user
  qrY         Float    // Y coordinate clicked by user
  
  batches     Batch[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// STEP 2: The "Batch" (The ZIP Upload)
model Batch {
  id             String      @id @default(uuid())
  
  projectId      String
  project        Project     @relation(fields: [projectId], references: [id])
  
  // Statistics for Dashboard
  totalRecords   Int         @default(0)
  validRecords   Int         @default(0)
  zipFileUrl     String?     // Backup of the uploaded ZIP on S3
  
  status         BatchStatus @default(UPLOADED)
  
  certificates   Certificate[]
  
  createdAt      DateTime    @default(now())
}

// STEP 3: The "Certificate" (Individual Student Record)
model Certificate {
  id            String     @id @default(uuid())
  
  batchId       String
  batch         Batch      @relation(fields: [batchId], references: [id])
  
  // Data parsed from Excel 
  excelCertId   String     // e.g., "CERT-001"
  studentName   String     // e.g., "John Doe"
  fileName      String     // e.g., "john_doe.pdf"
  
  // Processing Logic
  status        CertStatus @default(PENDING)
  validationError String?  // e.g., "File missing in ZIP"
  
  // The Final Result
  finalPdfUrl   String?    // S3 URL of the final stamped PDF
  
  processedAt   DateTime?
}