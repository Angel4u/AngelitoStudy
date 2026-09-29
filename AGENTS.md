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

## Rules

- Page content (malla ramos, units with video/pdf links, schedule, social links) lives in
  Lovable Cloud tables and is read through `catalogQuery()` / `subjectQuery(id)` in
  `src/data/catalog.ts` (public server fn `getCatalog`). Why: one typed read
  path for every page; components never hardcode content.
- Edits happen in `/admin` (under `_authenticated`) with the browser client;
  RLS allows writes only for `has_role(auth.uid(),'admin')`, and the first
  account created claims admin via trigger. Why: security lives in the
  database, not the UI.
- Styles come only from the semantic tokens in `src/styles.css` (`bg-panel`,
  `text-halo`, `border-line`, `shadow-halo`). Why: the dark lo-fi theme stays
  consistent and a future light theme or brand change touches one file.
