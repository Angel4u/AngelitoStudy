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

- All page content (ramos, PDFs, featured video, social links) lives in
  `src/data/catalog.ts` behind typed interfaces. Why: it is the single seam to
  swap for a CMS or database later — components must never hardcode content, so
  replacing the literal arrays with a fetch is the only change a CMS needs.
- Styles come only from the semantic tokens in `src/styles.css` (`bg-panel`,
  `text-halo`, `border-line`, `shadow-halo`). Why: the dark lo-fi theme stays
  consistent and a future light theme or brand change touches one file.
