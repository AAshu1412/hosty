-- 1. Create a custom ENUM type for your build statuses
CREATE TYPE build_status AS ENUM ('pending', 'building', 'success', 'failed', 'failure');

-- 2. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                  -- Internal Database ID
    github_id BIGINT UNIQUE NOT NULL,       -- Mapped from your 'id' field
    github_username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    
    -- Auth Tokens
    access_token TEXT NOT NULL,
    access_token_expires_in BIGINT NOT NULL,
    refresh_token TEXT,
    refresh_token_expires_in BIGINT,
    token_type VARCHAR(50) NOT NULL,
    
    -- App State
    has_completed_onboarding BOOLEAN DEFAULT FALSE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- GitHub Profile Data (Flattened from your nested 'user' object)
    node_id VARCHAR(255),
    account_type VARCHAR(50),               -- Mapped from 'type'
    name VARCHAR(255),
    user_view_type VARCHAR(50),
    bio TEXT,
    location VARCHAR(255),
    notification_email VARCHAR(255),
    avatar_url TEXT,
    html_url TEXT,
    
    -- Timestamps (Postgres handles these natively much better than Unix integers!)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPLOYED REPOS TABLE
CREATE TABLE deployed_repos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Links to users table
    
    repo_url TEXT NOT NULL,
    sub_directory VARCHAR(255),
    branch VARCHAR(100) NOT NULL,
    notification_email VARCHAR(255),        -- Mapped from 'email'
    hosted_site_url TEXT NOT NULL,
    
    -- Current State tracking
    current_status build_status NOT NULL DEFAULT 'pending',
    current_build_number INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUILDS HISTORY TABLE (Replaces your number_of_builds array)
CREATE TABLE builds (
    id SERIAL PRIMARY KEY,
    repo_id INTEGER NOT NULL REFERENCES deployed_repos(id) ON DELETE CASCADE, -- Links to deployed_repos
    
    build_number INTEGER NOT NULL,
    status build_status NOT NULL,
    build_logs TEXT,                        -- Room for your commented-out build logs!
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);