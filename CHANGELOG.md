
### Fixed
- **alert**: Email consumer no longer leaves poison messages unacked or stuck in infinite requeue loops. Failed messages now retry with backoff (30s TTL, max 5 attempts) via a dead-letter exchange, then route to a terminal dead-letter queue for manual triage. (`22f35a6`)

### Changed
- **alert**: `auth-email-queue` and `order-email-queue` now declare `x-dead-letter-exchange` arguments. ⚠️ Existing queues created before this change must be deleted (once empty) prior to deploy, or the app will throw `PRECONDITION_FAILED` on startup. (`22f35a6`)
