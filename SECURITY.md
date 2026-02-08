# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| 1.3.x   | :white_check_mark: |
| < 1.3.0 | :x:                |

## Reporting a Vulnerability

We take the security of Panindigan FCA seriously. If you believe you have found a security vulnerability in Panindigan, please report it to us as described below.

### How to Report

**Do not open a public issue.**

Instead, please send an email to our security team or the maintainer directly. If you are comfortable doing so, please include the following details:

- The type of vulnerability (e.g., XSS, SQLi, RCE, etc.).
- Full paths of source file(s) related to the manifestation of the bug.
- The location of the affected source code (tag/branch/commit or direct URL).
- Any special configuration required to reproduce the issue.
- Step-by-step instructions to reproduce the issue.
- Proof-of-concept or exploit code.
- Impact of the issue, including how an attacker might exploit the issue.

### Response Timeline

We will do our best to respond to your report within 48 hours. We will investigate the issue and determine if it is a valid security vulnerability. If it is, we will work with you to fix the issue and release a patch.

## Security Best Practices for Users

- **Environment Variables**: Always use `FB_APPSTATE` environment variable instead of `appstate.json` file in production or public repositories.
- **Secrets**: Never commit your `appstate.json` or any other credentials to version control.
- **Updates**: Keep your library updated to the latest version to ensure you have the latest security patches.
