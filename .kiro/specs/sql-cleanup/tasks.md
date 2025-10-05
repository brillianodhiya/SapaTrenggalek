# Implementation Plan - SQL Files Cleanup

- [x] 1. Audit existing SQL files and extract unique content

  - Review all 15 SQL files to identify unique functionality
  - Extract essential content that must be preserved
  - Identify redundant or obsolete code
  - Document dependencies between files
  - _Requirements: 1.1, 2.2_

- [x] 2. Create consolidated schema.sql file

  - Start with current schema.sql as base
  - Integrate vector support from vector-related files
  - Add security fixes from security-related files
  - Include all necessary indexes and functions
  - Ensure proper ordering of SQL statements
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 3. Create optional migrations.sql file

  - Extract migration logic for existing databases
  - Include content hash updates and vector migrations
  - Add proper error handling for migrations
  - Document migration steps and requirements
  - _Requirements: 3.3_

- [x] 4. Create consolidated test-data.sql file

  - Merge test data from test-search-data.sql
  - Add realistic sample data for development
  - Include data for testing vector search functionality
  - Ensure data supports all application features
  - _Requirements: 1.3_

- [x] 5. Remove redundant SQL files

  - Delete add-content-hash.sql
  - Delete add-vector-support.sql
  - Delete debug-vector-issue.sql
  - Delete fix-all-security-warnings.sql
  - Delete fix-embedding-format.sql
  - Delete fix-final-security-warnings.sql
  - Delete fix-security-warnings.sql
  - Delete fix-vector-functions.sql
  - Delete fix-vector-operator.sql
  - Delete reinstall-pgvector.sql
  - Delete run-content-hash-update.sql
  - Delete simple-vector-fix.sql
  - Delete test-search-data.sql
  - _Requirements: 2.1, 2.2_

- [x] 6. Update documentation and setup scripts

  - Update SETUP.md to reference new SQL structure
  - Update setup-database.js script if needed
  - Update DATABASE-MANAGEMENT.md documentation
  - Test database setup with new consolidated files
  - _Requirements: 1.2, 3.1_
