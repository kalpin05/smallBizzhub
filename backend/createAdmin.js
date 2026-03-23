/**
 * ============================================================
 *  ADMIN SEEDER — SmallBizHub
 *  Run once to create your admin account:
 *
 *    node createAdmin.js
 *
 *  ⚠️  Edit ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME below
 *      before running.
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

/* ─── ✏️  SET YOUR ADMIN CREDENTIALS HERE ─────────────────── */
const ADMIN_NAME     = "Admin";
const ADMIN_EMAIL    = "admin@smallbizhub.com";   // change this
const ADMIN_PASSWORD = "Admin@123";               // change this (min 6 chars)
/* ─────────────────────────────────────────────────────────── */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createAdmin() {
  console.log("🛡️  Creating admin user:", ADMIN_EMAIL);

  /* 1. Create in Supabase Auth */
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    options: { data: { name: ADMIN_NAME, role: "admin" } },
  });

  if (authError) {
    // If already exists in auth, try to look up existing user
    if (
      authError.message.includes("already registered") ||
      authError.message.includes("already been registered")
    ) {
      console.log("⚠️  Auth user already exists — checking users1 table…");
    } else {
      console.error("❌ Auth signup failed:", authError.message);
      process.exit(1);
    }
  }

  const userId = authData?.user?.id;

  if (!userId) {
    console.error(
      "❌ Could not get user ID.\n" +
      "   If auth user already exists, go to Supabase Dashboard → Auth → Users,\n" +
      "   copy the UUID for " + ADMIN_EMAIL + ", and run this SQL:\n\n" +
      "   INSERT INTO users1 (id, name, email, password, role)\n" +
      "   VALUES ('<UUID>', '" + ADMIN_NAME + "', '" + ADMIN_EMAIL + "', 'managed_by_supabase_auth', 'admin')\n" +
      "   ON CONFLICT (email) DO UPDATE SET role = 'admin';\n"
    );
    process.exit(1);
  }

  /* 2. Upsert into users1 table */
  const { error: dbError } = await supabase
    .from("users1")
    .upsert(
      [{
        id: userId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: "managed_by_supabase_auth",
        role: "admin",
      }],
      { onConflict: "email" }
    );

  if (dbError) {
    console.error("❌ DB insert failed:", dbError.message);
    process.exit(1);
  }

  console.log("✅ Admin created successfully!");
  console.log("   Email   :", ADMIN_EMAIL);
  console.log("   Password:", ADMIN_PASSWORD);
  console.log("   Login at: http://localhost:3000/admin-login");
  process.exit(0);
}

createAdmin();
