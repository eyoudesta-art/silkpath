# Release checklist

**Pre-deploy**
- [ ] CI green on `main` (tests and build)
- [ ] `verifiedOn` and the dataset reviewed for anything that changed this year
- [ ] CHANGELOG updated
- [ ] No unresolved "Source links need review" issue

**Deploy**
- [ ] Merge to `main`; watch the *Deploy to GitHub Pages* run
- [ ] Open the live URL in a private window: Discover, a detail drawer, Compare, My plan
- [ ] Check on a real phone, on mobile data
- [ ] Share-preview card shows in WhatsApp/Telegram

**Post-deploy**
- [ ] Reload once online, then go offline: the app still opens
- [ ] Confirm the footer shows the new build id
- [ ] Announce

**Rollback triggers**
- Blank page or console errors on first load
- A fee or deadline shown wrongly in a way that could cost applicants money
- Service worker serving a stale build after 24 h

**Rollback**: `git revert` the release commit and push, or redeploy the previous run from the Actions tab.
