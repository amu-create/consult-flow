# ConsultFlow Design

Reference slug: `linear-dashboard`
Reason: ConsultFlow is an operational admissions CRM where dense scanability, fast status comparison, and quiet task focus matter more than marketing flourish.

## Product Feel

ConsultFlow should feel like a focused admissions command center for academy operators. The interface should be practical, calm, and information-dense, with clear hierarchy for lead state, next actions, and conversion risk.

## Visual Direction

- Use restrained neutrals for the base UI with sparing status color.
- Keep cards compact with an 8px maximum radius unless inherited components require otherwise.
- Favor tables, kanban columns, timelines, and compact metric panels over decorative layouts.
- Reserve stronger color for funnel status, urgency, risk, and action feedback.
- Typography should prioritize legibility and fast scanning; avoid oversized display text inside dashboards and forms.

## Interaction Rules

- Primary workflows should keep the next action visible without forcing users through explanatory screens.
- Use icons for repeated operational actions where the meaning is familiar.
- Keep forms stable while users edit; validation and loading states should not shift the layout.
- Mobile views should preserve task completion paths first: lead lookup, status update, consultation note, and follow-up creation.

## Demo And Portfolio Readiness

- Demo screens should be populated enough to show the conversion workflow without requiring external service keys.
- AI, Kakao, SMS, and Blob features may degrade to clear setup or mock states when env vars are missing.
- Public documentation should explain required environment variables without exposing any real secret values.
