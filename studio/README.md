# Lumid Studio site (React + Vite)

An original studio website: sticky header with mobile menu, hero, services, selected work,
process, FAQ and a contact form. All copy lives in `src/content.js`; styles in `src/styles.css`.

```sh
cd studio
npm install
npm run dev      # local preview
npm run build    # output in studio/dist
```

Deploy on Vercel as a separate project with **Root Directory = `studio`** (framework: Vite).
Replace the placeholder projects in `content.js` with real work and swap the generated covers
in `src/components.jsx` (`Cover`) for your own images.
