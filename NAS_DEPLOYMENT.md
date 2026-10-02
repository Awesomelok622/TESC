# TESC on Synology DSM 7.x (DS1621+)

This project runs **Next.js in Container Manager**. The default backend is local SQLite with scrypt password hashes and HttpOnly sessions. Prayer PDFs are stored outside the public web root but are readable without signing in. The nine supplied 2026 letters seed automatically on first start. Supabase is optional when the full content management system is needed; the two backends do not share accounts or letters automatically.

## 1. Verify the NAS

1. Update DSM 7.x and confirm **Container Manager** is available in Package Center on this NAS. DSM 7.2 uses Container Manager in place of the older Docker package. Verify adequate free disk for source, images, backups, and the prayer letter library.
2. Give the NAS DNS and outbound HTTPS access to the container registry, the configured Supabase endpoint, and the mail/CAPTCHA/scanner providers you use. Keep DSM time synchronization enabled; scheduled publication compares UTC timestamps.
3. Install **Container Manager**. **Web Station** and its Apache/Nginx/PHP services are optional for a separate static site; they do not run this Next.js application. DSM's built-in reverse proxy handles HTTPS for this Compose deployment. Do not install MariaDB/PHP for this stack.

Synology documents [Container Manager projects](https://kb.synology.com/en-global/DSM/help/ContainerManager/docker_project), [DSM 7 reverse proxy](https://kb.synology.com/en-af/DSM/tutorial/Quick_Start_Synology_SSO), and [certificate management](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/connection_certificate).

## 2. Place files and grant upload access

Use this exact layout (the Compose bind mount is relative to the project directory):

```text
/volume1/docker/tesc/app/
  Dockerfile
  docker-compose.yml
  .env                         # private runtime settings, never in Git
  src/ public/ supabase/ ...   # application source
  uploads/                     # NAS-persistent private files
    admin-media/media/
    admin-media/submissions/
  data/                        # SQLite database and prayer PDFs
    tesc.sqlite
    prayer/
```

Copy the repository, including `seed/prayer/`, into `/volume1/docker/tesc/app/`, excluding `node_modules`, `.next`, and local `.env` files. Create `.env` from `.env.example`. Create `uploads` and `data` before launching. The container process runs as **UID/GID 1001**, so give that UID write access to the private data and upload trees:

```sh
cd /volume1/docker/tesc/app
mkdir -p uploads/admin-media/media uploads/admin-media/submissions
mkdir -p data
sudo chown -R 1001:1001 uploads data
sudo chmod -R u+rwX,go-rwx uploads data
```

If a DSM shared-folder ACL overrides Unix mode bits, grant the container's UID write permission through the ACL too. Test by uploading a PDF from `/admin`. Do **not** put `data` or `uploads` under `/volume1/web/`: that shared folder may expose files directly. The application serves prayer PDFs through `/api/media/{id}`.

## 3. Configure accounts and secrets

1. For the local backend, leave the Supabase URL and anon key empty. Set `NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN` and `LOCAL_DATA_DIR=/data/local` in `.env` before building. Compose mounts `./data` there.
2. Create the first administrator with a strong password (12+ characters) after the container starts. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_DISPLAY_NAME` temporarily, then run `docker compose exec -e ADMIN_EMAIL -e ADMIN_PASSWORD -e ADMIN_DISPLAY_NAME next-app node scripts/create-local-admin.mjs`. Remove the one-time variables from the shell afterwards. The admin can change the password at `/admin/password`.
3. Anyone can view and download prayer letters at `/zh-Hant/prayer`; the date control sorts newest or oldest first. Admins upload and manage letters at `/admin`. Member signup at `/signup` requires email confirmation before sign-in. For the local backend, verify a sender domain with Resend and set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` (for example `TESC Members <members@mail.tesc.org.hk>`). Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS public origin. If these settings are missing, signup displays an unavailable notice instead of creating accounts. Six digit verification codes expire after 10 minutes and are limited to five attempts; members can request another code after one minute.
4. For the optional full Supabase CMS, apply all four SQL migrations in order, enable email signup, configure the Auth callback/SMTP, set Supabase keys before building, and create the first admin with `pnpm admin:create`. Import the prayer PDFs through that CMS separately; local SQLite data is not read in Supabase mode.

Back up the entire `data` directory, including `tesc.sqlite` and `prayer/`, as one consistent snapshot. Back up `uploads` and Supabase data as well if you use the optional CMS.

## 4. Start the Container Manager project

In **Container Manager → Project → Create**, set project name `tesc`, path `/volume1/docker/tesc/app`, and use the checked-in `docker-compose.yml`. Build and start it. Alternatively, over SSH:

```sh
cd /volume1/docker/tesc/app
docker compose config
docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:3000/api/health
```

The app binds only `127.0.0.1:3000` on the NAS. Container Manager's `cloudflared` profile is optional and should not be enabled when using the DSM reverse proxy path below.

## 5. Route HTTPS through DSM

1. Point the chosen DNS name (for example `tesc.org.hk`) to the NAS public address. Forward TCP **80 and 443** from the router to the NAS if it must be public. Keep NAS management ports private.
2. In **Control Panel → Security → Certificate**, request a Let's Encrypt certificate for the exact hostname and assign it to this reverse proxy service. Domain validation and renewal require the hostname/ports to be reachable as Synology documents.
3. In **Control Panel → Login Portal → Advanced → Reverse Proxy → Create**, set source **HTTPS**, hostname `tesc.org.hk`, port **443**; destination **HTTP**, hostname `127.0.0.1`, port **3000**. Enable HTTP→HTTPS redirection for port 80 and HSTS only after HTTPS works. Preserve the incoming Host and forwarding headers.
4. Ensure `.env` uses `NEXT_PUBLIC_SITE_URL=https://tesc.org.hk` and rebuild after changing this value. Configure the same origin in Turnstile and Supabase Auth. Do not cache HTML or `/api/*` at the proxy: content scheduling and access checks are dynamic.

See Synology's [reverse proxy instructions](https://kb.synology.com/en-af/DSM/tutorial/Quick_Start_Synology_SSO) and [certificate instructions](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/connection_certificate).

## 6. Verify before opening to visitors

- Open `/zh-Hant`, `/zh-Hant/team`, `/zh-Hant/ministries#posters`, `/zh-Hant/digitalisation`, `/prayer-letters`, and `/zh-Hant/contact` over HTTPS.
- Without signing in, open and download a prayer PDF. Switch the list between newest-first and oldest-first. Confirm `/admin` still requires an administrator account.
- Upload a test PDF from `/admin`; check that it appears under `/volume1/docker/tesc/app/data/prayer/` and that an unrelated visitor receives 404 from its media URL. Confirm the newest date appears first, then remove the test letter.
- Submit a contact form with Turnstile and verify the submission in `/admin/contacts`. If the mail adapter is configured, verify delivery separately.
- Run `docker compose ps`, inspect app logs, and test a backup restore of both Supabase data and `uploads`.

## Package choice summary

| Component | This deployment | When to use an alternative |
|---|---|---|
| Container Manager | Required for the supplied Compose application | DSM 7.1 may show the older Docker package. |
| DSM reverse proxy + Let's Encrypt | Recommended HTTPS entry point | Cloudflare Tunnel is an optional Compose profile. |
| Web Station / Apache / Nginx | Not required | Static exports or other sites under `/volume1/web/`. |
| Supabase PostgreSQL/Auth | Required for current schema and login | Self-hosted Supabase needs a separately maintained stack. |
| MariaDB 10 / SQLite / PHP / native Node | Not used | Only after porting the application away from Supabase/Container Manager. |
