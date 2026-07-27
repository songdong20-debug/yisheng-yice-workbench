"use client";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://clypunixxgtazdwfkuzs.supabase.co",
  "sb_publishable_l2lje7P2J6ee4Q_THZrwrw_Z-cGmcN_",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
