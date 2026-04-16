# First npm beta publish checklist

Use this before publishing **`@sarkarshubh/activitywork-sdk`** from [`packages/activitywork-sdk`](../packages/activitywork-sdk/package.json). This checklist assumes a **manual** publish (no GitHub Actions release job). Registry automation and app integration (TimeHuddle, placeholder repos) are out of scope here.

To use a shorter public name (for example `@sarkarshubh/activitywork`), change the `"name"` field in that `package.json` and update install/import examples in the README before publishing.

---

## 1. npm account and package name

- [ ] **Authenticate:** `npm whoami` prints **`sarkarshubh`** (or the account that owns the `@sarkarshubh` scope).
  - If you see **`401 Unauthorized`**, you are **not** logged in for this shell. Run **`npm login`** in the **same terminal** you will use to publish (this is your machine’s npm config, not something “inside Cursor”).
  - If you use a **token**, put it in `~/.npmrc` per [npm access tokens](https://docs.npmjs.com/about-access-tokens); `npm whoami` should succeed before you publish.
- [ ] The account may publish under the **`@sarkarshubh`** scope (personal scopes match your npm username).
- [ ] Package name in [`packages/activitywork-sdk/package.json`](../packages/activitywork-sdk/package.json) is what you want (default here: **`@sarkarshubh/activitywork-sdk`**, scoped, `"publishConfig": { "access": "public" }`).
- [ ] Name availability checked (scoped package):

```bash
npm view @sarkarshubh/activitywork-sdk
```

Expect **404 Not Found** until the first publish. If a version already exists, bump your semver / prerelease before publishing.

- [ ] 2FA / publish policy understood: use `npm publish ... --otp=...` when required, or an [automation token](https://docs.npmjs.com/about-access-tokens) if you later automate CI (not required for this checklist).

**Note:** `npm view activitywork-sdk` (unscoped) returning 404 only means that **unscoped** name is unused. It does not affect a **scoped** package under `@sarkarshubh/`.

---

## 2. Repo and quality gate

- [ ] Working tree is a commit you are willing to ship (avoid publishing while unsure what is included beyond the built `dist/`).
- [ ] Nothing noisy is staged: **`dist/`** and **`node_modules/`** stay **gitignored** (do not `git add` them). Delete stray **`*.tgz`** from `npm pack` if present (also ignored, but removes clutter locally).
- [ ] From **repo root**, same sequence as [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- [ ] (Optional) CI green on `main` for that commit.

---

## 3. Build artifact sanity (`files: ["dist"]`)

The package only publishes [`dist/`](../packages/activitywork-sdk/package.json) (`"files": ["dist"]`). An empty or stale `dist` produces a broken tarball.

- [ ] **Immediately before** pack/publish, `dist/` is up to date (run `pnpm build` from root, or `pnpm --filter ./packages/activitywork-sdk build`).
- [ ] From `packages/activitywork-sdk`, create a tarball and inspect it:

```bash
cd packages/activitywork-sdk
npm pack
tar -tzf *.tgz | head -50
```

- [ ] Tarball lists `package/dist/` entries (not an empty package). Remove the `.tgz` after inspection if you do not need it.

---

## 4. Version and changelog

- [ ] Version in `packages/activitywork-sdk/package.json` reflects a **semver prerelease** beta, e.g. `0.1.0-beta.0` or `0.0.1-beta.0` (immutable once published; bump prerelease suffix for the next beta).
- [ ] [CHANGELOG.md](../CHANGELOG.md) updated with an entry for this beta (what is included, link to prior `0.1.0` notes if helpful).

---

## 5. Publish (beta dist-tag)

Work in the package directory (where `package.json` lives).

- [ ] Current directory: `packages/activitywork-sdk`.
- [ ] Scoped packages must be published **public** explicitly the first time (unless paying for private):

```bash
cd packages/activitywork-sdk
npm publish --access public --tag beta
```

- [ ] Dist-tags vs `latest`: see [npm dist-tag](https://docs.npmjs.com/cli/v10/commands/npm-dist-tag). After publish, confirm tags (step 6). For a brand-new package, verify on npm which tag points at your version so install docs stay accurate.

---

## 6. Post-publish smoke checks

- [ ] `npm view @sarkarshubh/activitywork-sdk version`
- [ ] `npm view @sarkarshubh/activitywork-sdk dist-tags`
- [ ] **Clean install** (empty folder), install the beta and resolve entrypoints:

```bash
mkdir -p /tmp/aw-sdk-smoke && cd /tmp/aw-sdk-smoke
npm init -y
npm install @sarkarshubh/activitywork-sdk@beta
# or: npm install @sarkarshubh/activitywork-sdk@0.1.0-beta.0
```

- [ ] Quick runtime smoke: small script using `createActivityWorkClient`, `checkHealth` / `preview` / `snapshot` against your ActivityWork base URL (same as local curl/SDK checks).

---

## 7. Out of scope (follow-up work)

- [ ] **TimeHuddle / placeholder repo**: add dependency on the published version and wire env (separate ticket).
- [ ] **CI publish / provenance / npm trusted publishing**: optional later; this checklist is manual-first.

When the beta is validated, communicate the install line (e.g. `@sarkarshubh/activitywork-sdk@beta` or exact version) in your team channel or integration ticket.
