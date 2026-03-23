# Software Requirements Specification (SRS)

## 1. Document Control
- Project Name: Fleet Management System
- Version: 1.0
- Date: 2026-03-23
- Prepared For: Project Stakeholders
- Prepared By: Development Team

## 2. Introduction
### 2.1 Purpose
This SRS defines the functional and non-functional requirements for the Fleet Management System. It serves as the baseline for development, testing, deployment, and maintenance.

### 2.2 Scope
The system provides end-to-end fleet operations support including:
- User authentication and role-based access control
- Vehicle and fuel tracking
- Utility monitoring (water and electricity)
- Inventory and purchasing workflows
- Machine/asset and service request management
- Attendance and notifications
- Dashboard and reporting

The platform consists of:
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + MongoDB (Atlas)
- Optional backup transfer: MongoDB to SQL Server local database

### 2.3 Definitions
- RBAC: Role-Based Access Control
- API: Application Programming Interface
- JWT: JSON Web Token
- SRS: Software Requirements Specification

## 3. Overall Description
### 3.1 Product Perspective
The system is a web-based enterprise application with a decoupled frontend and backend:
- Frontend hosted on Netlify
- Backend hosted on Render
- Primary data store in MongoDB Atlas

### 3.2 User Classes and Characteristics
- Admin: full access, user and role management
- Fleet Manager: fleet operations and monitoring
- Maintenance Technician: service and machine tasks
- Inventory Officer: stock and purchasing
- Finance Accountant: utility/fuel cost visibility
- Driver Employee: attendance and operational data submission
- Supervisor Manager: oversight and approvals

### 3.3 Operating Environment
- Client: modern browsers (Chrome, Edge, Firefox)
- Server: Node.js 20+ runtime
- Database: MongoDB Atlas
- Backup target: SQL Server on localhost (database NELNA_APP)

### 3.4 Constraints
- Internet required for hosted environment
- Atlas network access must permit backend host
- Correct environment variables are mandatory in deployment

### 3.5 Assumptions and Dependencies
- MongoDB Atlas cluster remains available
- Render and Netlify services remain available
- Proper CORS configuration between frontend and backend

## 4. Functional Requirements
### 4.1 Authentication and Authorization
- FR-001: The system shall allow users to log in using email and password.
- FR-002: The system shall issue JWT tokens on successful authentication.
- FR-003: The system shall enforce RBAC on protected endpoints.
- FR-004: The system shall provide current user profile endpoint.

### 4.2 User Management
- FR-010: Admin shall create users with name, email, password, and role.
- FR-011: Admin shall view existing users.
- FR-012: System shall prevent duplicate email accounts.

### 4.3 Vehicle Management
- FR-020: Users with permission shall create, view, update, and manage vehicle records.
- FR-021: System shall maintain vehicle document metadata.

### 4.4 Fuel Management
- FR-030: Users with permission shall log fuel entries.
- FR-031: System shall provide fuel logs for reporting and dashboard consumption.

### 4.5 Utility Management
- FR-040: Users with permission shall create and edit water meter records.
- FR-041: Users with permission shall create and edit electricity usage records.
- FR-042: Utility data shall be visible in tabular form with update capability.

### 4.6 Inventory and Purchasing
- FR-050: Users shall manage products and suppliers.
- FR-051: Users shall create purchase orders and associated items.
- FR-052: Users shall manage GRN and stock movements.

### 4.7 Machine/Asset and Service Management
- FR-060: Users shall manage machine and asset data.
- FR-061: Users shall create and track service requests.
- FR-062: Users shall maintain service tasks, spare parts, and history.

### 4.8 Attendance and Notifications
- FR-070: Users shall submit and update attendance data according to permission.
- FR-071: System shall generate and manage notifications.

### 4.9 Dashboard and Reports
- FR-080: System shall expose dashboard summary endpoints.
- FR-081: System shall support reporting and saved report filters.

### 4.10 Data Backup Transfer
- FR-090: System shall support exporting MongoDB collections into SQL Server tables.
- FR-091: Each Mongo collection shall be transferred into a dedicated SQL table under schema mongo_backup.
- FR-092: Backup tables shall include mongo_id, payload (JSON), and synced_at.

## 5. External Interface Requirements
### 5.1 User Interface
- Responsive web UI for desktop and mobile browsers
- Login page, dashboard, and module-specific forms/tables

### 5.2 Software Interfaces
- Frontend to backend via REST API under /api/v1
- Backend to MongoDB Atlas via connection string
- Optional backend script to SQL Server using connection string

### 5.3 Communications Interfaces
- HTTPS for hosted frontend/backend traffic
- TLS-encrypted MongoDB Atlas connections

## 6. Non-Functional Requirements
### 6.1 Security
- NFR-001: Passwords shall be hashed before storage.
- NFR-002: JWT secret must be strong in production.
- NFR-003: API must enforce authorization at endpoint level.
- NFR-004: CORS must restrict allowed origins to trusted hosts.

### 6.2 Reliability and Availability
- NFR-010: Backend shall attempt database reconnection on disconnect.
- NFR-011: Health endpoint shall reflect database status.

### 6.3 Performance
- NFR-020: Typical API requests should complete within acceptable operational latency under normal load.
- NFR-021: Backup transfer should complete collection-wise and log row counts.

### 6.4 Maintainability
- NFR-030: Codebase shall use modular structure (routes, services, repositories, models).
- NFR-031: Environment-driven configuration shall be used.

### 6.5 Portability
- NFR-040: Frontend shall be deployable as static assets.
- NFR-041: Backend shall run in containerized and cloud-hosted environments.

## 7. Data Requirements
### 7.1 Primary Data Store
- MongoDB database: Fleet_New
- Core collections include users, vehicles, fuel_logs, water_meter_data, electricity_data, inventory and service collections.

### 7.2 Backup Data Store
- SQL Server database: NELNA_APP
- Schema: mongo_backup
- One table per source Mongo collection

## 8. Deployment Requirements
- DR-001: Backend environment variables must include MONGODB_URI, MONGODB_DB_NAME, JWT_SECRET, CORS_ORIGIN.
- DR-002: Frontend environment variable VITE_API_BASE_URL must point to backend /api/v1 URL.
- DR-003: Atlas network access must allow backend egress.

## 9. Acceptance Criteria
- AC-001: Valid users can log in and receive token.
- AC-002: Role-based access blocks unauthorized module actions.
- AC-003: CRUD operations for key modules work without server-side errors.
- AC-004: Health endpoint returns connected status when DB is reachable.
- AC-005: Mongo-to-SQL backup script copies collections into NELNA_APP successfully.

## 10. Risks and Mitigations
- Risk: Atlas network restrictions may block backend.
  - Mitigation: Whitelist required IP ranges and verify health endpoint.
- Risk: Misconfigured production env variables.
  - Mitigation: Deployment checklists and fail-fast validation.
- Risk: Credential leakage.
  - Mitigation: Store secrets in platform environment settings, not source files.

## 11. Future Enhancements
- Incremental (delta) backup strategy to SQL Server
- Audit trail and immutable change logs
- Centralized monitoring and alerting dashboard
- Automated integration test suite for critical endpoints
