# Security

Silkpath is a static site with no server, no accounts and no analytics. Shortlists and checklists stay in the visitor's browser (`localStorage`).

Report a vulnerability privately through GitHub's "Report a vulnerability" button on the Security tab. Please do not open a public issue.

Built-in protections: a strict Content-Security-Policy (no inline scripts, no third-party requests), all dataset text escaped before rendering, no `eval`, and security headers in `public/_headers` for Netlify and Cloudflare Pages.
