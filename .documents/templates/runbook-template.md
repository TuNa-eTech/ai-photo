# Runbook — <Operation/Incident>

Status: Draft  
Updated: YYYY-MM-DD  
Owner: @you

Context
- What system/feature this pertains to, and when to use this runbook.
- Links to service ownership/on-call rotation.

Prerequisites
- Access requirements (VPN, IAM roles, SSH keys).
- Environment variables, secrets, and tools.
- Safety checks (read-only vs write actions).

Detection
- How this issue is detected (alerts, dashboards, logs, user reports).
- Runbooks/queries to confirm the problem.

Triage
- Impact assessment (users affected, SLAs).
- Scope (components/services impacted).
- Decide: mitigate vs investigate first.

Mitigation (Safe Defaults)
1) Immediate safe action (disable feature flag, rollback, scale up, etc.).
2) Verification (metrics/logs return to normal).
3) Communication (status page, Slack, stakeholders).

Root Cause Investigation
- Hypotheses list and how to test each.
- Logs/queries/dashboards (copy/paste snippets).
- Reproduction steps if applicable.

Remediation
- Fix description (code/config/infrastructure).
- Risks and rollback plan.
- Change steps with commands (clearly marked).

Verification
- Post-fix checks (metrics, logs, synthetic checks, E2E tests).
- User acceptance validation if needed.

Postmortem / Follow-ups
- Summary (timeline, impact).
- Preventative actions (tests, alerts, circuit breakers).
- Tickets for long-term improvements.

References
- Related specs: link to .documents/features/* or architecture/*.
- Dashboards/alerts JIT links.
- External systems runbooks if any.
