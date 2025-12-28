# Deployment Plan: Exoplanet Demographics on Digital Ocean

Deploy the Exoplanet Demographics visualization to Digital Ocean App Platform.

## Configuration

| Setting | Value |
|---------|-------|
| **Repository** | https://github.com/eshelman/Exoplanet-Demographics |
| **Domain** | exoplanets.6by9.net |
| **DNS Provider** | Cloudflare |
| **Platform** | Digital Ocean App Platform (Static Site) |
| **Cost** | $5/month (or free Starter tier) |

## Project Build Info

- **Type**: Static single-page application (React + Vite + TypeScript)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Build Size**: ~5.7 MB (includes audio, data, and image assets)
- **Node Version**: 20.x

---

## Step 1: Create App on Digital Ocean

1. Go to [Digital Ocean Apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **GitHub** as source
4. Authorize and select repository: `eshelman/Exoplanet-Demographics`
5. Select branch: `main`

## Step 2: Configure Build Settings

Digital Ocean should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| Source Directory | `/` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| HTTP Port | (not applicable for static) |

Select **Static Site** as the resource type.

## Step 3: Select Plan

Choose one:
- **Starter** (Free): 3 static sites, 1GB bandwidth/month
- **Static Site** ($5/month): 1GB bandwidth, additional bandwidth $0.04/GB

For initial deployment, Starter tier is fine.

## Step 4: Configure Custom Domain

After app creation:

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `exoplanets.6by9.net`
4. Digital Ocean will provide a CNAME target (e.g., `exoplanet-demographics-xxxxx.ondigitalocean.app`)

## Step 5: Configure Cloudflare DNS

In Cloudflare dashboard for `6by9.net`:

1. Go to **DNS** → **Records**
2. Add a CNAME record:

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | exoplanets | `<your-app>.ondigitalocean.app` | DNS only (grey cloud) |

**Important**: Use "DNS only" (grey cloud), not "Proxied" (orange cloud). Digital Ocean handles SSL and needs direct connection for certificate validation.

## Step 6: Verify SSL

Digital Ocean automatically provisions Let's Encrypt SSL. After DNS propagates (usually 1-5 minutes):

1. Visit https://exoplanets.6by9.net
2. Verify the lock icon appears
3. Check certificate is issued by Let's Encrypt

---

## App Spec (Optional)

For infrastructure-as-code, create `.do/app.yaml` in the repo:

```yaml
name: exoplanet-demographics
region: sfo
static_sites:
  - name: web
    github:
      repo: eshelman/Exoplanet-Demographics
      branch: main
      deploy_on_push: true
    build_command: npm run build
    output_dir: dist
    index_document: index.html
    error_document: index.html
    routes:
      - path: /
    domains:
      - domain: exoplanets.6by9.net
        type: PRIMARY
```

---

## Deployment Workflow

Once configured, deployments are automatic:

1. Push to `main` branch
2. Digital Ocean detects the push
3. Builds the app (`npm run build`)
4. Deploys to CDN
5. Site is live (typically 2-3 minutes)

### Manual Deployment

If needed, trigger manually:
1. Go to app dashboard
2. Click **Actions** → **Force Rebuild and Deploy**

---

## Pre-Deployment Checklist

- [ ] Run `npm run build` locally - verify no errors
- [ ] Run `npm run test:run` - ensure tests pass
- [ ] Test with `npm run preview` - verify production build works
- [ ] Verify all assets load (audio, images, data files)
- [ ] Check browser console for errors
- [ ] Commit and push all changes to `main`

## Post-Deployment Checklist

- [ ] Site loads at https://exoplanets.6by9.net
- [ ] HTTPS working (lock icon, valid certificate)
- [ ] Demographics Tour works (zoom regions, navigation)
- [ ] Notable Systems Tour works (simulations load)
- [ ] Audio plays (ambient, UI sounds)
- [ ] Mobile responsive layout correct
- [ ] All planet data loads and displays
- [ ] Simulations render correctly (binary stars, orbits)

---

## Rollback

If a deployment causes issues:

1. Go to App Platform dashboard
2. Click **Activity** tab
3. Find the last working deployment
4. Click **...** → **Rollback to this deployment**

---

## Troubleshooting

### Build Fails
- Check build logs in Activity tab
- Verify `package-lock.json` is committed
- Ensure Node version compatibility (20.x)

### Domain Not Working
- Verify CNAME record in Cloudflare
- Ensure Cloudflare proxy is OFF (grey cloud)
- Wait for DNS propagation (check with `dig exoplanets.6by9.net`)

### SSL Certificate Issues
- Ensure domain is added in App Platform settings
- Cloudflare proxy must be disabled
- Wait up to 24 hours for certificate provisioning

### 404 on Direct URLs
- Verify `error_document: index.html` in app spec
- App Platform should handle SPA routing automatically
