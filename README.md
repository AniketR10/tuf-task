# Wall Calendar

An interactive wall calendar built with Next.js and Tailwind CSS that looks and feels like a real physical calendar hanging on a wall.

## Features

- **Tear-off pages** - drag the photo section downward to tear off the current month and reveal the next one, just like a real wall calendar
- **Month navigation** - arrow buttons to flip between months with the same tear animation
- **Notes per date** - click any day to add a pinned sticky note; saved notes appear in the top-right corner
- **Monthly memo** - a notes section on the left of each month for general purpose
- **Realistic UI** - metal hook, hanging wire, spiral coil binding, wall background, and an offset shadow to show depth

## Tech choices

| What | Why |
|------|-----|
| Next.js (App Router) | Simple file-based routing, `next/image` for optimised Unsplash photos |
| Tailwind CSS | Utility classes keep all styling co-located with the component |
| Plain React state | No external state library needed for a single-page UI |
| localStorage | Persists notes across page refreshes without a backend |

## Run locally

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).


## Project structure

```
app/
  page.tsx          # Root pag
components/
  Calendar.tsx      # All calendar logic and UI lives here
```
