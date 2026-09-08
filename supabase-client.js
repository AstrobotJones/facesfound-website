// ── Faces Found — Supabase Client ─────────────────────────
// Shared client used by all pages. Import this before any
// other script that needs database or auth access.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL     = 'https://ayqqhviensokzccjjryv.supabase.co';
const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cXFodmllbnNva3pjY2pqcnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMDc5NDQsImV4cCI6MjEwMTU4Mzk0NH0.mKeYXKADHsYOagL6zCXkpX1wzpgSe5Y0QiXXjLYxCvc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
