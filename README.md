# Memory Stars ✦

A beautiful web app for collecting your happy memories in paper stars. Write one memory per day, fold it into a star, and watch your jar fill up throughout the year.

## Features

- **Daily Memory Entry** - Write a good memory on a dated piece of paper
- **Folding Animation** - Watch your memory transform into a beautiful star
- **Glass Jar Visualization** - See your stars accumulate in a glass jar
- **Year Recap** - Review all your memories in calendar, slideshow, or random "shake jar" mode
- **Share Memories** - Share individual stars via URL when they surface

## No Account Required

Your memories are stored locally in your browser. No sign-up needed - just start collecting stars!

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Framer Motion (animations)
- localStorage (persistence)

## How It Works

1. Click "Add Today's Star" to write a memory
2. Your memory folds into a star and drops into the jar
3. Come back each day to add another star (limit: one per day)
4. Click any star to read it and optionally share it
5. Use "View Year Recap" to browse all your memories

## Data Storage

All data is stored in your browser's localStorage:
- `star-memories-jar` - Current year's jar
- `star-memories-archive-{year}` - Previous years' jars

## License

MIT
