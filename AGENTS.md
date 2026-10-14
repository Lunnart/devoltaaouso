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
- Keep demonstration lot data and pure filtering in `src/lib/marketplace.ts`; this stage is frontend-only and must never imply a real proposal was sent.
- Use dedicated catalog, lot-detail, and how-it-works routes, with route-level social metadata for independent navigation and sharing.
