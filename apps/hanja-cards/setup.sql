-- Create the analytics events table
create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  session_id text not null,
  visitor_id text not null,
  event_type text not null, -- 'page_view', 'menu_change', 'hanja_view', etc.
  event_data jsonb default '{}'::jsonb, -- extra info like which hanja, which menu, duration, etc.
  page_url text,
  user_agent text
);

-- Note: We'll instruct the user to run this in their Supabase SQL Editor.
