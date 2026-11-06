<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Use the root route for the shared marketplace header and footer so all content pages keep consistent navigation.
- Keep demonstration lot data and pure filtering in `src/lib/marketplace.ts`; lots stay fictional and labeled as such.
- Store proposals, listings and unanswered questions as rows in the team's Google Sheet via `src/lib/sheets.server.ts` (gateway, RAW input), called only from server functions; no database yet, so the sheet is the team inbox.
- Validate contact forms with the shared schema in `src/lib/contact.ts` on both browser and server so limits never drift.
- Use dedicated catalog, lot-detail, and how-it-works routes, with route-level social metadata for independent navigation and sharing.
- Roles live only in `public.user_roles` (checked via `has_role`/`manages_hub` security-definer functions); never on profiles, to prevent privilege escalation.
- Weights use numeric(12,3) and money numeric(12,2); never floats, so financial math stays exact.
