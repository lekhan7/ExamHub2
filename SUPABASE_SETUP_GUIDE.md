# Supabase Setup Guide

## Overview
Your ExamHub backend has been updated to use Supabase instead of localhost for:
- Room storage and management
- Room members tracking  
- PDF file storage (using Supabase Storage)
- All other database operations

## Setup Instructions

### 1. Configure Your .env File
The `.env` file has been created in the `server/` directory. You need to update it with your actual Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
```

### 2. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Schema
The backend now uses these Supabase tables (already defined in your schema):

#### `rooms`
```sql
create table public.rooms (
  id uuid not null default gen_random_uuid (),
  name text not null,
  exam_tag text not null,
  is_public boolean null default false,
  room_code text null,
  creator_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint rooms_pkey primary key (id),
  constraint rooms_room_code_key unique (room_code),
  constraint rooms_creator_id_fkey foreign KEY (creator_id) references users (id)
);
```

#### `room_members`
```sql
create table public.room_members (
  id uuid not null default gen_random_uuid (),
  room_id uuid null,
  user_id uuid null,
  joined_at timestamp with time zone null default now(),
  is_creator boolean null default false,
  constraint room_members_pkey primary key (id),
  constraint room_members_room_id_user_id_key unique (room_id, user_id),
  constraint room_members_room_id_fkey foreign KEY (room_id) references rooms (id) on delete CASCADE,
  constraint room_members_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
);
```

#### `pdf_files`
```sql
create table public.pdf_files (
  id uuid not null default gen_random_uuid (),
  room_id uuid null,
  filename text not null,
  original_name text not null,
  file_size bigint null,
  storage_path text not null,
  uploaded_by uuid null,
  uploaded_at timestamp with time zone null default now(),
  constraint pdf_files_pkey primary key (id),
  constraint pdf_files_room_id_fkey foreign KEY (room_id) references rooms (id) on delete CASCADE,
  constraint pdf_files_uploaded_by_fkey foreign KEY (uploaded_by) references users (id)
);
```

### 4. Supabase Storage Setup
Create a bucket named `pdfs` in your Supabase Storage for PDF uploads:

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it `pdfs`
4. Set up appropriate access policies

### 5. Start Your Server
After configuring the `.env` file:

```bash
cd server
npm start
```

The server will now:
- Connect to Supabase instead of using localhost
- Store all room data in Supabase
- Upload PDFs to Supabase Storage
- Track room members in the database

## Key Changes Made

### Backend Updates
- ✅ Updated `supabase.js` to support both anon and service role keys
- ✅ Modified `databaseServices.js` to use Supabase for all operations
- ✅ Updated PDF upload to use Supabase Storage instead of local files
- ✅ Removed local file serving and multer disk storage
- ✅ Added memory-based multer for PDF uploads

### PDF Storage
- PDFs are now uploaded to Supabase Storage bucket `pdfs`
- Files are stored as: `pdfs/{roomId}/{timestamp}-{filename}`
- Public URLs are generated for file access
- Metadata is stored in the `pdf_files` table

## Testing
Once you've configured your `.env` file with real Supabase credentials:
1. Start the server
2. Create rooms and verify they appear in Supabase
3. Join rooms and check the `room_members` table
4. Upload PDFs and verify they appear in Supabase Storage

## Troubleshooting
- If you see "Supabase credentials not configured", check your `.env` file
- Ensure your Supabase project has the required tables created
- Verify the `pdfs` bucket exists in Supabase Storage
- Check that your service role key has storage permissions
