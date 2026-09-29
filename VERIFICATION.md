# Verification record

Development environment: Windows, Node.js, no TESC service credentials, no Docker executable. Checks below apply to the supplied source and credential-free local preview, not to a deployed TESC installation.

## Executed

| Check | Result |
|---|---|
| TypeScript strict type checking | Passed |
| ESLint | Passed |
| Next.js production build | Passed |
| Production Node startup | Passed |
| Domain validation / scheduling / sanitization | 23 tests passed |
| PostgreSQL migration / RLS / moderation / quotas | 10 tests passed |
| Request protection / CAPTCHA / scanning | 7 tests passed |
| Media visibility / inline and download redirects | 7 tests passed with a mocked Storage adapter |
| Browser public routes / language / SEO / responsive / admin denial | 35 tests passed |
| Homepage visual review | Desktop and mobile screenshot review; automated captures at 1440, 1024, 768, 390 pixels |

Total: **47 unit/database/handler tests + 35 browser tests = 82 passing tests**.

The database tests execute the shipped SQL against PGlite’s PostgreSQL engine with test Auth/Storage schemas and roles. The test checks do not substitute for real Supabase Auth or Storage behavior. The browser suite uses the unconfigured preview; it verifies that forms and authentication fail closed when credentials are absent. It does not claim successful live admin login, cloud upload, email or Turnstile verification.

## Required staging acceptance before launch

Use a dedicated staging project and non-production recipient addresses. These steps require credentials and services that were not available here.

1. Apply the exact migration to Supabase. Confirm RLS/grants and that every object bucket is private. Remove any conflicting inherited policies from an existing shared project.
2. Invite the first administrator. Complete the email invitation, set a password, log in, sign out, reset the password and verify session refresh. Confirm an authenticated user without a profile is denied.
3. Create an editor. Check CRUD for allowed content; verify direct API and database requests cannot alter roles or site settings.
4. Create a prayer letter in all three languages. Preview it; schedule a few minutes ahead in Hong Kong time; check both listing and direct URL before and after the timestamp. Test unpublish, duplicate, archive, and soft-delete.
5. Create a course/category and related ministry; attach a syllabus/cover, publish, check detail fields and registration URL. Reorder staff and inspect the public team page.
6. Upload an MP4 within the actual proxy/provider limits; check progress, scanner state, poster selection, publication and playback. Verify YouTube/Vimeo alternatives and captions/transcript.
7. Submit a public PDF through a real Turnstile widget. Confirm it is pending, storage is private, guessed URLs fail, contributor email is absent from anonymous responses, and invalid/MIME-spoofed/oversized files fail.
8. Confirm a clean scan, approve and publish. Verify browser inline PDF viewing, explicit download and revocation after hiding. Existing signed links expire after 60 seconds.
9. Submit a contact enquiry with consent. Confirm private inbox persistence, notification delivery and visible failure state when the mail adapter is down.
10. Verify final logo, official content, language terminology, image licensing, captions, alt text, keyboard navigation, contrast and screen-reader behavior.
11. Run `docker compose build` on the intended NAS architecture, then verify health, restart behavior, environment injection, Cloudflare Tunnel, canonical domain and lack of NAS admin port exposure.
12. Configure and restore-test independent database, media, code and NAS backups. Record owners and retention schedules.

## Not performed / not claimed

- No actual NAS/Docker image build, tunnel creation, DNS/domain change or GitHub publication.
- No connection to a real TESC Supabase project, real auth account, email provider, scanner or Turnstile account.
- No formal WCAG audit or penetration test.
- No claim of configured or tested backups.
