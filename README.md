# flyflyang.github.io

Personal academic homepage of Jingpeng Yang, built with Jekyll and deployed on GitHub Pages.

## Features

- Single-page homepage with sections: News, Experience, Publications, Projects, Blog, Awards
- Author profile sidebar with avatar, bio, and social links
- Blog system with a card-style listing page and MathJax-rendered articles
- Homepage blog section auto-populates the 3 latest posts via Liquid
- MathJax 3 support for LaTeX math (`$...$` inline, `$$...$$` display)
- Font Awesome 6 icons via CDN
- Responsive design with mobile-friendly layout adjustments
- Sitemap, Atom feed, and SEO support via Jekyll plugins

## Tech Stack

- **Jekyll** — static site generator
- **Minimal Mistakes** theme (heavily customized)
- **kramdown** with GFM input for Markdown processing
- **MathJax 3** for math rendering
- **Sass/SCSS** for styling
- **jQuery + plugins** for interactive features (greedy navigation, magnific popup, etc.)

## Project Structure

```text
.
├── _config.yml              # Site configuration and author metadata
├── _data/
│   ├── navigation.yml       # Header navigation links
│   └── ui-text.yml          # Theme UI text strings
├── _includes/               # Reusable Liquid partials
│   ├── head/custom.html     # Custom <head> snippets (FA, MathJax, favicon)
│   ├── footer/custom.html   # Custom footer (sitemap link)
│   └── ...                  # Other theme includes
├── _layouts/                # Page layout templates
│   ├── default.html         # Base HTML wrapper
│   ├── single.html          # Single page/article layout
│   ├── archive.html         # Archive listing layout
│   └── compress.html        # HTML compression wrapper
├── _pages/                  # All site pages (unified management)
│   ├── about.md             # Homepage (single-page with all sections)
│   ├── 404.md               # Error page
│   ├── sitemap.md           # Sitemap page
│   ├── category-archive.html
│   ├── tag-archive.html
│   ├── year-archive.html
│   └── blog/                # Blog section
│       ├── index.md         # Blog listing page
│       └── 2026-07-21-N-Transformer.md  # Blog articles
├── _sass/                   # Theme Sass source files
│   ├── vendor/              # Vendor libraries (breakpoint, susy, magnific-popup)
│   └── _*.scss              # Theme component styles
├── assets/
│   ├── css/
│   │   ├── home.css         # Custom homepage styles
│   │   ├── main.scss        # Main stylesheet entry (imports theme + custom)
│   │   └── academicons.css  # Academic icons
│   ├── js/
│   │   ├── main.min.js      # Built JS (jQuery + plugins, run `npm run build:js`)
│   │   ├── show_publications.js
│   │   └── pub_media_rotator.js
│   └── fonts/               # Academicons font files
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
git clone https://github.com/flyflyang/flyflyang.github.io.git
cd flyflyang.github.io
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
  avatar: "avatar.png"
  name: "Your Name"
  bio: "Your bio."
  location: "City, Country"
  email: "you@example.com"
  github: yourusername
```

### Homepage

The homepage is a single-page layout in `_pages/about.md`. Edit it to update all sections: News, Experience, Publications, Projects, Blog, Awards. The Blog section auto-populates the 3 latest posts from `_pages/blog/`.

### Navigation

Edit `_data/navigation.yml`:

```yaml
main:
  - title: "News"
    url: "/#news"
  - title: "Experience"
    url: "/#experience"
  - title: "Pub"
    url: "/#publications"
  - title: "Blog"
    url: "/#blog"
  - title: "Awards"
    url: "/#awards"
```

### Adding Blog Posts

1. Create a new file in `_pages/blog/` named `YYYY-MM-DD-title.md`
2. Add front matter:

```yaml
---
layout: single
title: "Your Post Title"
date: YYYY-MM-DD
permalink: /blog/YYYY/MM/DD/title/
---
```

3. Write your content in Markdown. MathJax is enabled by default.
4. The blog listing page (`_pages/blog/index.md`) and homepage blog section update automatically.

### Styling

- Homepage custom styles: `assets/css/home.css`
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

## Acknowledgements

- Theme adapted from [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes)
- Template originated from [selen-suyue.github.io](https://selen-suyue.github.io/)
- Blog listing design inspired by [lilianweng.github.io](https://lilianweng.github.io/)
