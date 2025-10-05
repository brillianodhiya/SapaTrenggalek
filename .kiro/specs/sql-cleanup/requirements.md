# Requirements Document - SQL Files Cleanup

## Introduction

Folder `/sql` memiliki terlalu banyak file SQL yang redundant dan membingungkan. Banyak file yang merupakan patch/fix sementara yang sudah tidak diperlukan lagi. Perlu dilakukan konsolidasi menjadi struktur yang bersih dan maintainable.

## Requirements

### Requirement 1

**User Story:** As a developer, I want a clean SQL structure, so that I can easily understand and maintain the database schema without confusion from multiple patch files.

#### Acceptance Criteria

1. WHEN reviewing SQL files THEN there SHALL be maximum 3-4 core SQL files
2. WHEN setting up database THEN the schema SHALL be complete in one main file
3. WHEN applying migrations THEN there SHALL be clear migration files if needed

### Requirement 2

**User Story:** As a project maintainer, I want to remove redundant SQL patch files, so that the project structure is clean and new developers aren't confused by multiple fix files.

#### Acceptance Criteria

1. WHEN listing SQL files THEN there SHALL be no temporary fix files
2. WHEN reviewing database setup THEN all necessary functionality SHALL be in consolidated files
3. WHEN new developers join THEN they SHALL have clear SQL files to work with

### Requirement 3

**User Story:** As a system administrator, I want consolidated database setup files, so that I can quickly set up the database without running multiple patch files.

#### Acceptance Criteria

1. WHEN setting up database THEN there SHALL be one main schema file
2. WHEN adding vector support THEN it SHALL be integrated into main schema
3. WHEN running database setup THEN all security fixes SHALL be included by default
