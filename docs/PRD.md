# Kidstack — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft for Review  
**Last Updated:** 2026-11-15  

---

## 1. Executive Summary & Product Vision

**Kidstack** is a multi-tenant, cloud-based **School Management Software (SaaS)** designed to streamline academic, administrative, financial, and communication workflows for K-12 schools and school networks.

While legacy school ERPs suffer from cluttered interfaces, rigid reporting, and high-friction workflows, Kidstack focuses on **low-click operational speed**, **strict multi-tenant data isolation**, and **role-tailored clarity** across four distinct portals:

1. **Super Admin Module** — Platform-level tenant onboarding, school account lifecycle, and global oversight.
2. **Admin Module** — Day-to-day school operations across Administration, Academics, Finance, and Communication.
3. **Teacher Module** — Streamlined profile management, score/result entry, and account security.
4. **Student Module** — Transparent access to personal profile, published academic results, school fee status, and account security.

---

## 2. Competitor Research & Market Context

### 2.1 Competitor Landscape

| Competitor | Target Segment | Multi-Tenancy Model | Key Strengths | Common Pain Points |
| :--- | :--- | :--- | :--- | :--- |
| **PowerSchool SIS** | Large public school districts | Hierarchical district-to-school containerization | Deep compliance, state reporting, massive ecosystem | Steep learning curve, complex UI, expensive and rigid for private/independent schools |
| **Fedena** | Private & international school groups | Multi-branch ERP under a master super-admin | Multi-campus support, modular finance & RBAC | Dated UI/UX, fragmented workflows between modules |
| **Gradelink** | Small-to-medium private & faith schools | Primarily single-school (limited diocese view) | Simple gradebooks, fast teacher onboarding | Limited cross-tenant SaaS provisioning and multi-campus analytics |
| **Alma SIS** | Modern K-12 & charter networks | Cloud-native network switching | Clean modern UX, flexible traditional & standards-based grading | Custom scoping needed for regional fee structures & international curricula |
| **Regional ERPs** *(e.g., Edves, SAFSIMS, Classe365)* | Private K-12 & emerging markets | Multi-tenant SaaS | Termly fee billing, CA + Exam grading, localized payment/messaging | Excessive clicks for teachers entering CA scores; delayed fee-to-exam reconciliation; rigid PDF report cards |

### 2.2 Key Market Insights & Kidstack Differentiators

1. **Workflow Friction Determines Adoption:** Schools rarely churn due to missing features; they churn when routine tasks (entering Continuous Assessment scores, checking fee balances, publishing results) take too many clicks. Kidstack will optimize for **bulk/inline score entry** and **single-screen summaries**.
2. **Financial-Academic Alignment:** Decoupled fee ledgers cause reconciliation bottlenecks. Kidstack links **fee structures, invoices, and payment receipts** directly to student records per academic term.
3. **Clean Multi-Tenant Onboarding:** Unlike enterprise tools that require weeks of manual setup, Kidstack's **Super Admin Onboarding** wizard will provision a new school tenant, initial admin account, and default academic structure in minutes.
4. **Modern, Accessible UI:** Using a clean SaaS design system (inspired by Alma's UX clarity), Kidstack avoids dated ERP tables and enforces WCAG AA contrast, responsive layouts, and role-focused navigation.

---

## 3. User Roles & Functional Requirements

### 3.1 Module 1: Super Admin

**Primary Persona:** Platform Owner / SaaS Operations Manager  
**Goal:** Onboard new schools onto Kidstack, monitor platform health, and manage school tenant accounts.

#### 3.1.1 Dashboard
- **KPI Summary Cards:** Total onboarded schools, active vs. suspended schools, total active users (admins, teachers, students), and recent onboarding activity.
- **Growth & Activity Charts:** School onboarding trend over time; tenant status breakdown.
- **Quick Actions:** Shortcut to "Onboard New School" and "Manage Accounts".

#### 3.1.2 Onboarding
- **Guided School Provisioning Wizard:**
  - **Step 1 — School Profile:** School name, school code/slug (unique tenant identifier), address, contact email, phone, logo upload, and school type/level (Primary, Secondary, K-12).
  - **Step 2 — Initial Academic Setup:** Default current academic session (e.g., `2026/2027`) and term (e.g., `First Term`), plus optional default grading scale preset.
  - **Step 3 — Primary School Admin Account:** Admin full name, email, and temporary password or invite link generation.
  - **Step 4 — Review & Provision:** Creates isolated tenant record, seeds default roles/settings, and sends onboarding credentials.

#### 3.1.3 Manage Accounts
- **School Tenant Directory:** Searchable, filterable table of all onboarded schools (Status: Active, Pending, Suspended).
- **Tenant Lifecycle Actions:**
  - View school details and user counts (admins, teachers, students).
  - Edit school metadata or subscription/plan tier.
  - Activate / Suspend / Reactivate a school tenant (suspending blocks login for all users of that school without deleting data).
  - Reset primary School Admin password or add secondary School Admins.

---

### 3.2 Module 2: School Admin

**Primary Persona:** School Principal, Vice Principal, Bursar, or School Administrator  
**Goal:** Manage day-to-day school operations, students, staff, academics, school fees, and internal communication within their school tenant.

#### 3.2.1 Dashboard
- **School KPIs:** Total enrolled students, total active staff/teachers, total classes, fee collection summary (collected vs. outstanding for the current term), and result submission status.
- **Visual Analytics:** Fee collection progress chart, student enrollment by class bar chart, and recent messages/announcements feed.
- **Quick Links:** Add Student, Record Fee Payment, Publish Results, Send Message.

#### 3.2.2 Administration
1. **Manage Classes**
   - Create, edit, and archive classes/grade levels and arms/sections (e.g., `Grade 7 - A`, `JSS 1 - Gold`).
   - Assign a Class Teacher (form tutor) to each class.
   - View class roster count and capacity.
2. **Manage Students**
   - Add individual students (Admission Number, Full Name, Gender, Date of Birth, Class/Arm, Guardian Name & Contact, Email/Login credentials, Status: Active/Graduated/Withdrawn).
   - Bulk import students via CSV template (with validation preview).
   - Edit student details, promote/transfer students between classes, or deactivate accounts.
   - Search and filter students by class, status, or admission number.
3. **Manage Staff**
   - Add, edit, and deactivate teaching and non-teaching staff (Staff ID, Full Name, Role/Designation, Email, Phone, Assigned Department, Status).
   - Create/manage Teacher login credentials and trigger password resets.

#### 3.2.3 Academics
1. **Subjects & Teachers**
   - Create and manage subjects (Subject Name, Subject Code, Department/Category).
   - Map subjects to specific classes.
   - Assign one or more Teachers to each `(Class, Subject)` pair—this assignment directly controls which classes/subjects appear in a Teacher's **Manage Results** view.
2. **Grading**
   - Configure school-wide or level-specific grading scales (e.g., `A: 70–100`, `B: 60–69`, `C: 50–59`, `D: 45–49`, `F: 0–44`) with grade points and remarks (`Excellent`, `Very Good`, etc.).
   - Configure assessment structure/weights per term (e.g., `CA1: 20%`, `CA2: 20%`, `Exam: 60%`, totaling `100%`).
   - Manage Academic Sessions and Terms (set active term, lock past terms).
3. **Results**
   - View result submission status by class and subject (Draft, Submitted by Teacher, Approved/Published).
   - Review, edit/override (with audit note), approve, or reject submitted teacher scores.
   - **Publish Results:** Toggle visibility so approved results become visible in the Student Portal.
   - Generate printable/PDF broadsheets (class-wide score matrix) and individual student report cards.

#### 3.2.4 Finance — Manage School Fees
- **Fee Structures:** Define fee items (Tuition, Lab Fee, Uniform, Bus, etc.) and assign fee schedules per Class and Term.
- **Student Fee Ledger:** Auto-generate term invoices for enrolled students; support fee discounts/waivers if applicable.
- **Record Payments:** Log full or partial payments (Amount, Payment Method: Cash/Bank Transfer/Card, Reference Number, Payment Date) and auto-update student balance.
- **Receipts & Debtor Tracking:** Generate downloadable/printable payment receipts; filter students by payment status (`Paid`, `Partial`, `Unpaid`) to track outstanding balances.

#### 3.2.5 Communication — Messages
- **Inbox & Sent Messages:** Internal messaging center for school communication.
- **Compose Message:** Send direct messages to specific Teachers, Students, or whole Classes/Roles (e.g., "All Teachers", "Grade 10 Students").
- **Announcements:** Broadcast school-wide notices visible on dashboards.
- **Read/Unread Indicators:** Clear unread badge counts and message timestamps.

---

### 3.3 Module 3: Teacher

**Primary Persona:** Subject Teacher / Class Teacher  
**Goal:** View personal profile, enter and submit student results accurately with minimal friction, and keep account credentials secure.

#### 3.3.1 My Profile
- View personal staff details (Staff ID, Full Name, Email, Phone, Assigned Classes & Subjects).
- Update permitted contact details (e.g., phone number, profile photo); core employment fields remain read-only (managed by Admin).

#### 3.3.2 Manage Results
- **Scoped Selection:** Select Academic Session, Term, Class, and Subject (restricted strictly to classes/subjects assigned to the logged-in teacher).
- **Spreadsheet-Style Score Entry Table:**
  - Lists all active students enrolled in the selected class.
  - Input fields for configured assessment components (e.g., CA1, CA2, Exam) with real-time validation against max weights.
  - Auto-calculates **Total Score**, **Grade**, and **Remark** live as scores are typed.
  - Optional teacher comment per student.
- **Workflow States:**
  - **Save Draft:** Save progress without locking.
  - **Submit for Approval:** Marks scores as submitted to Admin; locks editing unless Admin reopens/rejects.
- **Bulk CSV Upload (Optional enhancement):** Import scores for a class/subject via CSV.

#### 3.3.3 Change Password
- Standard secure form: Current Password, New Password (with strength indicator & show/hide toggle), Confirm New Password.
- Invalidates/refreshes session cleanly upon update with clear confirmation feedback.

---

### 3.4 Module 4: Student

**Primary Persona:** Enrolled Student (and/or Parent viewing on their behalf)  
**Goal:** Check personal academic profile, view/download published results, track school fee payments and balances, and manage password.

#### 3.4.1 My Profile
- View student details: Admission Number, Full Name, Current Class/Arm, Date of Birth, Gender, Guardian Contact Info, and School Name.
- Read-only academic identity fields to preserve record integrity.

#### 3.4.2 My Results
- Select Academic Session and Term.
- View **published** subject scores (CA breakdown, Exam score, Total, Grade, Remark), overall average/GPA, and class teacher/admin remarks.
- **Unpublished State:** Clear empty state if current term results have not yet been published by the School Admin.
- **Download / Print Report Card:** Clean, print-ready report card view/PDF export.

#### 3.4.3 My School Fees
- **Fee Summary Cards:** Total Billed (current term), Total Paid, and Outstanding Balance.
- **Fee Breakdown Table:** Itemized fees for the selected term/session.
- **Payment History:** Chronological list of recorded payments with date, amount, method, reference number, and downloadable/printable **Receipt**.

#### 3.4.4 Change Password
- Current Password, New Password (with visibility toggle and validation rules), Confirm New Password.

---

## 4. Core Data Model & Multi-Tenancy Architecture

### 4.1 Multi-Tenancy Strategy
- **Tenant Isolation:** Every school-scoped table includes a non-null `school_id` foreign key. All API queries and authorization middleware must enforce `school_id == current_user.school_id` (except for `SUPER_ADMIN` operating on platform-level endpoints).
- **Role-Based Access Control (RBAC):** Four primary roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`.

### 4.2 Core Entities (High-Level Schema)

| Entity | Key Fields | Notes |
| :--- | :--- | :--- |
| `School` (Tenant) | `id`, `name`, `slug`, `logo_url`, `address`, `status` (`active`/`suspended`), `created_at` | Root tenant entity |
| `User` | `id`, `school_id` (nullable for Super Admin), `email`, `password_hash`, `role`, `status`, `last_login` | Unified auth table with strict role & tenant binding |
| `AcademicSession` | `id`, `school_id`, `name` (e.g., `2026/2027`), `is_current` | Tracks school years |
| `Term` | `id`, `school_id`, `session_id`, `name`, `is_current`, `is_locked` | Tracks terms/semesters |
| `ClassRoom` | `id`, `school_id`, `name`, `arm`, `class_teacher_id` | Grade level & section |
| `StudentProfile` | `id`, `user_id`, `school_id`, `admission_no`, `class_id`, `dob`, `gender`, `guardian_info` | Extended student record |
| `StaffProfile` | `id`, `user_id`, `school_id`, `staff_no`, `designation`, `phone` | Extended teacher/admin record |
| `Subject` | `id`, `school_id`, `name`, `code` | School subject catalog |
| `SubjectAssignment` | `id`, `school_id`, `class_id`, `subject_id`, `teacher_id` | Links teacher → class → subject |
| `GradingScale` | `id`, `school_id`, `grade`, `min_score`, `max_score`, `remark` | Configurable grading bands |
| `AssessmentConfig` | `id`, `school_id`, `term_id`, `components` (JSON: CA1, CA2, Exam weights) | Configurable score weights |
| `ResultRecord` | `id`, `school_id`, `student_id`, `class_id`, `subject_id`, `term_id`, `scores` (JSON), `total`, `grade`, `status` (`draft`/`submitted`/`published`) | Student subject result |
| `FeeStructure` | `id`, `school_id`, `term_id`, `class_id`, `items` (JSON), `total_amount` | Term fee schedule per class |
| `FeePayment` | `id`, `school_id`, `student_id`, `term_id`, `amount`, `method`, `reference`, `paid_at`, `recorded_by` | Payment transaction & receipt source |
| `Message` | `id`, `school_id`, `sender_id`, `recipient_type` (`user`/`class`/`role`/`all`), `recipient_id`, `subject`, `body`, `created_at` | Internal communication |

---

## 5. UI/UX Design System (UI/UX Pro Max)

Following the **UI/UX Pro Max** design intelligence guidelines for **SaaS & Educational Dashboards**:

### 5.1 Visual Style & Color Palette
- **Design Style:** Clean Flat Design + Soft UI Evolution (crisp cards, subtle borders `#E2E8F0`, restrained elevation, zero decorative clutter).
- **Color Tokens (WCAG AA Compliant):**
  - **Primary:** Trust Blue `#2563EB` (hover `#1D4ED8`, text on primary `#FFFFFF`)
  - **Secondary / Accent:** Indigo `#4F46E5` / Sky `#3B82F6`
  - **CTA Highlight:** Energetic Orange `#EA580C` (adjusted for WCAG 3:1+ contrast)
  - **Canvas Background:** `#F8FAFC` (Slate 50)
  - **Surface / Card:** `#FFFFFF`
  - **Text Primary:** `#1E293B` (Slate 800) | **Text Muted:** `#64748B` (Slate 500)
  - **Semantic Status:** Success `#059669`, Warning `#D97706`, Danger `#DC2626`, Info `#2563EB`
- **Iconography:** Unified SVG icon set (**Lucide Icons**); no emoji icons in navigation or UI controls.

### 5.2 Typography
- **Font Pairing:** `Inter` (Minimal Swiss single-family scale for data-dense dashboards, tables, and forms) or `Poppins` (headings) + `Open Sans` (body) for a warm, approachable educational feel.
- **Scale:** Base `16px` body text (`line-height: 1.5`), clear `h1`–`h4` hierarchy, tabular numerals (`tabular-nums`) for all grades, scores, and fee amounts.

### 5.3 Layout, Navigation & Interaction Standards
- **Adaptive Navigation:** Persistent collapsible left sidebar on desktop (`≥1024px`) grouped by module sub-sections (e.g., Admin: *Dashboard, Administration, Academics, Finance, Communication*); responsive drawer/bottom navigation on mobile (`<768px`).
- **Accessibility & Touch:**
  - Minimum `4.5:1` text contrast ratio; visible focus rings (`2–4px`); full keyboard navigation (`Tab`, `Enter`, `Escape`).
  - Minimum `44×44px` touch targets with `≥8px` spacing.
  - Password fields include show/hide toggles; destructive actions (suspend school, delete record) require confirmation and use semantic danger styling.
- **Data Tables & Charts:**
  - Sortable, searchable tables with skeleton loading states and clear empty states.
  - Charts include legends, keyboard-accessible tooltips, and never rely on color alone to convey meaning.

---

## 6. Non-Functional Requirements

1. **Security & Data Privacy:**
   - Passwords hashed with `bcrypt` or `argon2`.
   - Strict RBAC and tenant isolation enforced server-side on every request.
   - Audit logging for sensitive actions (tenant suspension, result overrides, fee payment recording).
2. **Performance:**
   - Initial page load < 2s; API responses < 300ms for standard CRUD queries.
   - Paginated/virtualized tables for large student registries (50+ rows).
3. **Reliability & Data Integrity:**
   - Atomic database transactions for fee payments and bulk result submissions.
   - Soft-delete or archival (`status = inactive/archived`) for students, staff, and classes to preserve historical academic and financial records.

---

## 7. Phased Roadmap

- **Phase 1 (MVP — Core Operations):**
  - Authentication & RBAC (4 portals) + Change Password.
  - Super Admin: Dashboard, School Onboarding Wizard, Manage Accounts.
  - School Admin: Dashboard, Classes, Students, Staff, Subjects & Teachers, Grading Config, Results Approval/Publishing, Fee Structures & Manual Payment Recording, Internal Messages.
  - Teacher: My Profile, Manage Results (Draft & Submit).
  - Student: My Profile, My Results (with printable report card), My School Fees (with receipts).
- **Phase 2 (Enhancements):**
  - Online payment gateway integration (e.g., Stripe / Paystack) for self-service student fee payments.
  - Automated SMS/Email/WhatsApp notifications for published results and fee reminders.
  - Attendance tracking & timetable scheduling.

---

## 8. Confirmed Architecture & Product Decisions

1. **Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + PostgreSQL with Prisma ORM.
2. **Default Currency & Grading Localization:**
   - Default currency: **NGN (`₦`)** across all fee structures, invoices, and payment receipts.
   - **Admin-Configurable Grading Presets:** During onboarding or in *Academics → Grading*, the School Admin can select a preferred grading preset (e.g., `CA1 (20%) + CA2 (20%) + Exam (60%)`, `CA (40%) + Exam (60%)`, or a custom component breakdown) and customize grade bands.
3. **Authentication Identifiers:**
   - **Students:** Log in using **Admission Number + Password** (scoped by School Code/Tenant or unique Admission Number).
   - **Teachers:** Log in using **Staff ID + Password** (scoped by School Code/Tenant).
   - **School Admin & Super Admin:** Log in using **Email + Password**.
