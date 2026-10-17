# nanasuk3.github.io

Personal academic homepage of Jingpeng Yang, built with Jekyll and deployed on GitHub Pages. The homepage layout is adapted from the public structure of [Haoquan Zhang's homepage](https://github.com/HaoquanZhang/HaoquanZhang.github.io), while the site content and custom interactions remain specific to this site.

## Features

- Target-inspired single-page homepage with sections: About, News, Research, Experiences, Awards
- Light/dark theme switch with OS preference and persistent selection
- English/Chinese language switch with persistent selection
- Milk frog and DeepSeek companion interactions
- Responsive research filters and desktop/mobile publication cards
- Author profile with avatar, bio, and social links
- MathJax 3 support for LaTeX math (`$...$` inline, `$$...$$` display)
- Inline SVG icons with optional Font Awesome loading for additional social links
- Responsive design with mobile-friendly layout adjustments
- Atom feed and SEO support via Jekyll plugins

## Tech Stack

- **Jekyll** — static site generator
- **Minimal Mistakes** theme (heavily customized)
- **kramdown** with GFM input for Markdown processing
- **MathJax 3** for math rendering
- **Sass/SCSS** for styling
- **Native JavaScript** for navigation, responsive layout helpers, and small interactions

## Project Structure

```text
.
├── _config.yml              # Site configuration and author metadata
├── _data/
│   ├── authors.yml         # Publication author links
│   ├── publications.yml    # Research data rendered by the homepage JS
│   ├── i18n.yml            # Bilingual profile and page content
│   ├── ui-text.yml          # Theme UI text strings
├── _includes/               # Reusable Liquid partials
│   ├── head/custom.html     # Custom <head> snippets (FA, MathJax, favicon)
│   ├── icon.html            # Small inline SVG icons
│   ├── home-nav.html        # Homepage navigation
│   ├── home-footer.html     # Homepage footer
│   ├── milk-frog-pet.html   # Homepage companions
│   └── ...                  # SEO and script includes
├── _layouts/                # Page layout templates
│   ├── home.html             # Homepage shell
│   └── compress.html        # HTML compression wrapper
├── _pages/                  # All site pages (unified management)
│   ├── about.md             # Homepage (single-page with all sections)
│   └── 404.md               # Error page
├── _sass/                   # Theme Sass source files
│   ├── vendor/              # Vendor libraries (breakpoint, susy)
│   └── _*.scss              # Theme component styles
├── assets/
│   ├── css/
│   │   ├── home-template.css # Target-inspired homepage styles
│   │   ├── main.scss        # Main stylesheet entry (imports theme + custom)
│   │   ├── dark.css         # Dark theme overrides
│   │   ├── milk-frog.css    # Companion interactions
│   │   └── theme-transition.css # Theme transition effects
│   ├── js/
│   │   ├── home-template.js  # Homepage navigation and publication renderer
│   │   ├── main.min.js      # Built native JS bundle (run `npm run build:js`)
│   │   ├── milk-frog.js      # Milk frog and DeepSeek interactions
│   │   └── something-new.js  # Publication placeholder interaction
├── images/                  # Avatar, logos, publication images, favicon
├── Gemfile                  # Ruby/Jekyll dependencies
├── package.json             # JS build dependencies and scripts
└── LICENSE
```

## Getting Started

### Prerequisites

- Ruby and Bundler
- Node.js and npm
- Git

### Installation

```bash
git clone https://github.com/NANASUK3/NANASUK3.github.io.git
cd NANASUK3.github.io
bundle install
npm install
```

### Run Locally

```bash
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/` in your browser.

### Build

```bash
bundle exec jekyll build
```

Output is written to `_site/`.

## Customization

### Site Configuration

Edit `_config.yml` to update:

```yaml
title: "Your Name"
name: "Your Name"
description: "Your description."
author:
  avatar: "avatar-256.webp"
  name: "Your Name"
  bio: "Your bio."
  location: "City, Country"
  email: "you@example.com"
  github: yourusername
```

### Homepage

The homepage uses `_layouts/home.html` and `_pages/about.md`. Edit `_data/i18n.yml` for bilingual profile, news, experiences, and awards text. Edit `_data/publications.yml` for research entries and topic filters.

### Navigation

Edit `_includes/home-nav.html`:

```yaml
main:
  - title: "News"
    url: "/#news"
  - title: "Experience"
    url: "/#experience"
  - title: "Pub"
    url: "/#publications"
  - title: "Awards"
    url: "/#awards"
```

### Styling

- Homepage shell styles: `assets/css/home-template.css`
- Main theme styles: `assets/css/main.scss` (imports Sass partials from `_sass/`)
- Custom `<head>` snippets (favicon, CDN links, MathJax config): `_includes/head/custom.html`

### JavaScript

Rebuild the bundled JS after modifying `assets/js/_main.js` or any plugin:

```bash
npm run build:js
```

## Deployment

This site is deployed via GitHub Pages.

1. Push to the `gh-pages` or `main` branch of your `username.github.io` repository.
2. In GitHub repository settings, enable Pages and select the branch.
3. Set `url` in `_config.yml` if using a custom domain:

```yaml
url: "https://yourdomain.com"
```

## License

MIT License. See `LICENSE` for details.

See `THIRD_PARTY_NOTICES.md` for the target-template source and the existing milk-frog/DeepSeek asset notices. The target repository README welcomes reuse; personal information and private tracking metadata from the reference site were not copied.

## Acknowledgements

- Theme adapted from [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes)
- Template originated from [selen-suyue.github.io](https://selen-suyue.github.io/)
