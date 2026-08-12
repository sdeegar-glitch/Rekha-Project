-- Enable Row Level Security on every public table.
--
-- This app connects exclusively via Prisma using the Supabase "postgres"
-- role (DATABASE_URL / DIRECT_URL), which bypasses RLS by default in
-- Supabase's setup — so this has no effect on the app's own behavior.
-- What it does close: every Supabase project automatically exposes a
-- public PostgREST API (https://<project>.supabase.co/rest/v1/<table>)
-- governed by the project's anon key. With RLS disabled, anyone who
-- obtains that anon key can read/write every row directly through that
-- API, completely bypassing this application's auth checks. No policies
-- are added here, so the default becomes deny-all for the anon/
-- authenticated roles that API uses — exactly right, since this app
-- never uses that API and has no legitimate need for it to allow access.

ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."TimeSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ClinicSettings" ENABLE ROW LEVEL SECURITY;
