# Website maintenance

Before changing this website, read [`docs/requirements.md`](docs/requirements.md).
Treat it as the accepted baseline: when an intentional change affects a requirement,
update the requirement, its related Playwright test, and any affected screenshot
baseline in the same change. Run `npm test` before declaring work complete.

Use `docs/testing.md` for commands and failure investigation. Do not add tests that
create bookings or rely on third-party services; the shared test fixture supplies
controlled local stand-ins.
