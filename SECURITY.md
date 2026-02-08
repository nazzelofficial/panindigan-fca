# Security Policy

## 🛡️ Our Commitment to Security

The Panindigan FCA team takes security seriously. We are committed to protecting our users and maintaining the integrity of this library. This document outlines our security policies, how to report vulnerabilities, and best practices for secure usage.

---

## 📋 Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Support Status | Security Updates | End of Life |
|---------|----------------|------------------|-------------|
| 1.4.x   | ✅ **Active Support** | Yes | - |
| 1.3.x   | ✅ **Active Support** | Yes | TBD |
| 1.2.x   | ⚠️ **Limited Support** | Critical only | 2025-06-01 |
| 1.1.x   | ❌ **End of Life** | No | 2025-02-08 |
| < 1.1.0 | ❌ **End of Life** | No | 2025-02-08 |

### Support Policy

- **Active Support**: Full security patches and bug fixes
- **Limited Support**: Critical security vulnerabilities only
- **End of Life**: No updates; please upgrade immediately

**Recommendation**: Always use the latest stable version to ensure you have the most recent security protections.

---

## 🚨 Reporting a Vulnerability

### ⚠️ Critical: Do NOT Open Public Issues

If you discover a security vulnerability, **please do NOT disclose it publicly** via GitHub Issues, discussions, or social media. Public disclosure can put all users at risk before a fix is available.

### Secure Reporting Channels

Choose one of the following methods to report vulnerabilities:

#### 1. GitHub Security Advisories (Recommended)
1. Navigate to the [Security tab](https://github.com/nazzelofficial/panindigan-fca/security)
2. Click "Report a vulnerability"
3. Fill out the private vulnerability report form
4. Submit securely - only maintainers will see your report

#### 2. Email Security Team
- **Email**: security@panindigan.com
- **Website**: [panindigan.com](https://panindigan.com)
- **Developer**: [nazzelofficial.com](https://nazzelofficial.com)
- **Subject Line**: `[SECURITY] Vulnerability Report - Panindigan FCA`
- **PGP Key**: Available at [keybase.io/panindigan](https://keybase.io/panindigan) (if applicable)

#### 3. Private Message on GitHub
If email is unavailable, you may message the maintainers directly through GitHub.

### What to Include in Your Report

To help us understand and fix the issue quickly, please include:

#### Required Information
- [ ] **Vulnerability Type** (e.g., XSS, SQL Injection, RCE, Authentication Bypass, CSRF, Path Traversal)
- [ ] **Affected Version(s)** (specific version numbers)
- [ ] **Impact Assessment** (severity and potential exploitation)
- [ ] **Reproduction Steps** (detailed, step-by-step instructions)

#### Recommended Information
- [ ] **Affected Files** (full paths to source files)
- [ ] **Source Code Location** (branch, tag, commit hash, or direct URL)
- [ ] **Special Configuration** (any non-default settings required)
- [ ] **Proof of Concept** (code, screenshots, or video demonstration)
- [ ] **Suggested Fix** (if you have one)
- [ ] **CVE ID** (if already assigned)

#### Example Report Template

```markdown
**Vulnerability Type**: Authentication Bypass

**Affected Versions**: 1.3.0 - 1.4.0

**Severity**: High (CVSS 8.1)

**Description**: 
An attacker can bypass authentication by manipulating the appstate cookie...

**Reproduction Steps**:
1. Install panindigan-fca@1.4.0
2. Modify appstate.json by changing...
3. Execute the following code:
   ```javascript
   // POC code here
   ```
4. Observe that authentication succeeds without valid credentials

**Impact**:
- Unauthorized access to Facebook accounts
- Potential data exfiltration
- Account takeover risk

**Suggested Fix**:
Validate cookie integrity by...

**Additional Context**:
Tested on Node.js v20.x, Ubuntu 22.04
```

---

## ⏱️ Response Timeline

We are committed to responding promptly to security reports:

| Timeframe | Action |
|-----------|--------|
| **Within 24 hours** | Initial acknowledgment of receipt |
| **Within 48 hours** | Preliminary assessment and severity classification |
| **Within 7 days** | Detailed investigation and validation |
| **Within 14 days** | Patch development and testing |
| **Within 21 days** | Coordinated disclosure and release |

### Severity Classification

We use the [CVSS v3.1](https://www.first.org/cvss/calculator/3.1) scoring system:

- 🔴 **Critical (9.0-10.0)**: Immediate response, emergency patch within 48 hours
- 🟠 **High (7.0-8.9)**: Priority response, patch within 7 days
- 🟡 **Medium (4.0-6.9)**: Standard response, patch within 14 days
- 🟢 **Low (0.1-3.9)**: Scheduled response, patch in next minor release

### Communication

- We will keep you informed throughout the investigation and remediation process
- You will be credited in the security advisory (unless you prefer to remain anonymous)
- We may request additional information or clarification during the investigation
- We will coordinate the disclosure timeline with you

---

## 🏆 Security Hall of Fame

We recognize and thank the following security researchers for responsibly disclosing vulnerabilities:

| Researcher | Vulnerability | Severity | Date | Bounty |
|------------|---------------|----------|------|--------|
| *No vulnerabilities reported yet* | - | - | - | - |

**Interested in being listed?** Report a valid security vulnerability and help make Panindigan FCA more secure!

---

## 🔐 Security Best Practices

### For Library Users

#### 1. Credential Management
**❌ Never Do This:**
```javascript
// BAD: Hardcoded credentials in code
const client = new PanindiganClient();
await client.login({
  appState: {"cookies": [{"name": "c_user", "value": "123456789"}]}
});
```

**✅ Always Do This:**
```javascript
// GOOD: Use environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const client = new PanindiganClient();
await client.login({
  appState: JSON.parse(process.env.FB_APPSTATE!)
});
```

#### 2. AppState Security
- **Never commit** `appstate.json` to version control
- **Never share** your appstate publicly (GitHub, Discord, forums)
- **Always encrypt** appstate when storing in databases
- **Rotate credentials** regularly (every 30 days recommended)
- **Use `.gitignore`** to exclude sensitive files:
  ```
  # .gitignore
  appstate.json
  .env
  .env.local
  cookies.json
  *.pem
  *.key
  ```

#### 3. Environment Variables
```bash
# .env (never commit this file)
FB_APPSTATE='{"cookies":[...]}'
TWO_CAPTCHA_KEY='your_2captcha_api_key'
ANTI_CAPTCHA_KEY='your_anticaptcha_api_key'

# Use strong encryption for production
# Example with base64 encoding:
FB_APPSTATE_ENCRYPTED='U2FsdGVkX1...'
ENCRYPTION_KEY='your-32-char-encryption-key-here'
```

#### 4. Dependency Security
```bash
# Regularly check for vulnerabilities
npm audit
pnpm audit
yarn audit

# Automatically fix vulnerabilities
npm audit fix
pnpm audit --fix

# Update dependencies
npm update
pnpm update
```

#### 5. Anti-Detection Best Practices
```javascript
// Enable all security features
const client = new PanindiganClient({
  antiDetection: {
    autoRefresh: true,        // Auto-refresh cookies
    behavioralSim: true,      // Simulate human behavior
    fingerprint: true,        // Rotate fingerprints
    userAgent: true           // Rotate user agents
  },
  proxy: process.env.PROXY_URL  // Use rotating proxies
});
```

#### 6. Rate Limiting
```javascript
// Respect Facebook's rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

for (const user of users) {
  await client.sendMessage(user.id, message);
  await delay(2000); // 2 second delay between messages
}
```

#### 7. Error Handling
```javascript
// Always handle errors gracefully
try {
  await client.sendMessage(threadId, message);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Wait and retry
    await delay(60000);
  } else if (error.code === 'AUTH_FAILED') {
    // Refresh credentials
    await client.login();
  } else {
    // Log error securely (don't expose sensitive data)
    logger.error('Failed to send message', {
      error: error.message,
      threadId // OK to log
      // Never log: appState, cookies, tokens
    });
  }
}
```

#### 8. Production Deployment
```javascript
// Use secure configuration in production
const isProd = process.env.NODE_ENV === 'production';

const client = new PanindiganClient({
  logLevel: isProd ? 'error' : 'debug',  // Minimal logging in production
  antiDetection: {
    autoRefresh: isProd,                 // Always enable in production
    behavioralSim: isProd,
    fingerprint: isProd
  }
});
```

### For Contributors

#### 1. Code Security
- **Input Validation**: Always validate and sanitize user inputs
- **Output Encoding**: Properly encode outputs to prevent injection attacks
- **Secure Defaults**: Use secure default configurations
- **Principle of Least Privilege**: Request only necessary permissions

#### 2. Dependency Management
- **Vet Dependencies**: Review third-party libraries before adding
- **Pin Versions**: Use exact versions in `package.json` for reproducibility
- **Regular Updates**: Keep dependencies up-to-date
- **License Compliance**: Ensure dependencies have compatible licenses

#### 3. Code Review
- **Security Review**: All PRs must pass security review
- **Automated Scanning**: CI/CD pipeline includes security scans
- **Secrets Detection**: Check for accidentally committed secrets

---

## 🔍 Known Security Considerations

### Inherent Risks of Unofficial APIs

**⚠️ Important Disclaimer**: Panindigan FCA is an **unofficial** library that uses reverse-engineered Facebook APIs.

#### Risks
1. **Terms of Service Violations**: Using this library may violate Facebook's ToS
2. **Account Suspension**: Your Facebook account may be restricted or banned
3. **API Changes**: Facebook can change their API at any time, breaking functionality
4. **Data Privacy**: Be cautious about what data you collect and how you use it
5. **Legal Implications**: Ensure compliance with local laws (GDPR, CCPA, etc.)

#### Recommendations
- ✅ Use for educational and research purposes
- ✅ Obtain consent before automating actions on behalf of others
- ✅ Respect user privacy and data protection laws
- ✅ Implement rate limiting to avoid detection
- ✅ Use dedicated test accounts for development
- ❌ Do not use for spam, harassment, or malicious purposes
- ❌ Do not scrape or collect data without proper authorization
- ❌ Do not share user data with third parties without consent

---

## 🛠️ Security Features

### Built-In Protections

#### 1. Cookie Encryption
```javascript
// Cookies are automatically encrypted in memory
// Uses AES-256-GCM encryption
```

#### 2. Auto-Refresh System
- Refreshes session cookies every 20 minutes
- Prevents session expiration
- Automatic re-authentication on failure

#### 3. Fingerprint Rotation
- Canvas fingerprint randomization
- WebGL signature masking
- Audio context spoofing
- Font enumeration variation

#### 4. Behavioral Simulation
- Human-like typing speeds (40-120 WPM)
- Random idle times between actions
- Natural reading patterns

#### 5. Request Throttling
- Maximum 5 requests per second
- Prevents rate limiting
- Queue-based message delivery

---

## 📚 Additional Resources

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Scan for vulnerabilities
- [Snyk](https://snyk.io/) - Continuous security monitoring
- [Dependabot](https://github.com/dependabot) - Automated dependency updates
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common security risks

### Documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [README.md](README.md) - Getting started guide

### External References
- [Facebook Security](https://www.facebook.com/security) - Official Facebook security
- [Bug Bounty Program](https://www.facebook.com/whitehat) - Facebook's bug bounty
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1) - Severity scoring

---

## 📜 Disclosure Policy

### Coordinated Disclosure

We follow the principle of **coordinated vulnerability disclosure**:

1. **Reporter notifies us** privately
2. **We investigate and develop a fix**
3. **We release a patch** in a new version
4. **We publish a security advisory** after users have had time to update
5. **Reporter is credited** (if they wish) in the advisory

### Public Disclosure Timeline

- **Day 0**: Vulnerability reported privately
- **Day 1-7**: Investigation and patch development
- **Day 7-14**: Testing and validation
- **Day 14**: Security patch released
- **Day 21**: Public advisory published (gives users 7 days to update)

**Exception**: Critical vulnerabilities (CVSS 9.0+) may be disclosed sooner to protect users.

---

## ⚖️ Legal Notice

This security policy is part of the Panindigan FCA project, licensed under the MIT License. By reporting a vulnerability, you agree to:

- Allow us reasonable time to investigate and address the issue
- Not publicly disclose the vulnerability until we have released a fix
- Not exploit the vulnerability for malicious purposes
- Not demand payment or compensation for the vulnerability report

We reserve the right to determine the validity and severity of reported vulnerabilities.

---

## 🙏 Acknowledgments

We extend our gratitude to:

- Security researchers who responsibly disclose vulnerabilities
- The open-source security community
- GitHub Security Lab for their tools and resources
- All contributors who help improve Panindigan FCA's security

---

## 📞 Contact

- **Security Team**: security@panindigan.com
- **Website**: [panindigan.com](https://panindigan.com)
- **Developer**: [nazzelofficial.com](https://nazzelofficial.com)
- **GitHub Security Advisories**: [Report Vulnerability](https://github.com/nazzelofficial/panindigan-fca/security/advisories/new)
- **General Issues**: [GitHub Issues](https://github.com/nazzelofficial/panindigan-fca/issues) (non-security only)
- **Discussions**: [GitHub Discussions](https://github.com/nazzelofficial/panindigan-fca/discussions)

---

<p align="center">
  <strong>Security is a shared responsibility</strong>
  <br>
  <sub>Thank you for helping keep Panindigan FCA and its users safe</sub>
</p>

<p align="center">
  <em>Last Updated: February 8, 2025</em>
  <br>
  <em>Version: 1.0</em>
</p>