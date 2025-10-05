# Design Document - SQL Files Cleanup

## Overview

This design outlines the strategy for consolidating multiple SQL patch files into a clean, maintainable structure that includes all necessary functionality in organized files.

## Architecture

### Current State Analysis

- **15 SQL files** exist in the `/sql` directory
- Multiple **patch/fix files** that were created to solve temporary issues
- **Redundant vector support** files with overlapping functionality
- **Security fix files** that should be integrated into main schema
- **Test data files** that could be consolidated

### Target State

- **1 main schema file** (`schema.sql`) with complete database structure
- **1 migrations file** (`migrations.sql`) for updates to existing databases
- **1 test data file** (`test-data.sql`) for development and testing
- **Clean project structure** without redundant patch files

## Components and Interfaces

### File Structure (Target)

```
sql/
├── schema.sql (MAIN - Complete database schema)
├── migrations.sql (OPTIONAL - For existing database updates)
└── test-data.sql (OPTIONAL - Sample data for testing)

REMOVE:
├── add-content-hash.sql
├── add-vector-support.sql
├── debug-vector-issue.sql
├── fix-all-security-warnings.sql
├── fix-embedding-format.sql
├── fix-final-security-warnings.sql
├── fix-security-warnings.sql
├── fix-vector-functions.sql
├── fix-vector-operator.sql
├── reinstall-pgvector.sql
├── run-content-hash-update.sql
├── simple-vector-fix.sql
└── test-search-data.sql
```

### Content Consolidation Strategy

#### schema.sql (Master File)

- **Base tables**: All core application tables
- **Vector support**: Integrated pgvector extension and functions
- **Security fixes**: All RLS policies and security measures
- **Indexes**: All necessary indexes for performance
- **Functions**: All custom database functions

#### migrations.sql (Optional)

- **Schema updates**: For existing databases that need updates
- **Data migrations**: Any data transformation needed
- **Version tracking**: Track which migrations have been applied

#### test-data.sql (Optional)

- **Sample data**: Realistic test data for development
- **Test scenarios**: Data for testing various features
- **Development setup**: Quick data setup for new developers

## Data Models

### Schema Organization

```sql
-- 1. Extensions and Setup
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Core Tables
CREATE TABLE entries (...);
CREATE TABLE monitoring_keywords (...);

-- 3. Vector Support
-- Integrated vector columns and functions

-- 4. Security (RLS)
-- All row-level security policies

-- 5. Indexes
-- All performance indexes

-- 6. Functions
-- All custom functions
```

## Error Handling

### File Consolidation Safety

- **Content review**: Extract all unique functionality from patch files
- **Dependency check**: Ensure no functionality is lost
- **Testing**: Verify consolidated schema works correctly

### Migration Strategy

- **Backup existing**: Preserve current working schema
- **Incremental consolidation**: Merge files step by step
- **Validation**: Test each consolidation step

## Testing Strategy

### Schema Validation

- **Fresh database**: Test schema.sql on clean database
- **Existing database**: Test migrations.sql on existing setup
- **Functionality test**: Ensure all features work after consolidation
- **Performance test**: Verify indexes and functions perform correctly
