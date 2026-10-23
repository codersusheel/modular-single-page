
# Modular Single Page

A lightweight, reusable and modular single-page website starter built with HTML5, CSS3, JavaScript and JSON.

Developed by **Codersusheel (Susheel Kumar Prajapati)**.

## Overview

Modular Single Page helps developers build long websites without maintaining thousands of lines of HTML inside one file.

Each website section can be developed independently and dynamically loaded into the main page using JavaScript.

The project is designed for simplicity, flexibility and future expansion.

## Features

- Modular HTML sections
- Single-page website experience
- JSON-based section configuration (planned)
- Dynamic HTML section loading (planned)
- Responsive layout
- Reusable website components
- Section ordering and visibility controls (planned)
- Navigation system (planned)
- Light and dark mode support (planned)
- Fallback HTML content
- Vanilla JavaScript
- No frontend framework required

## Technologies

- HTML5
- CSS3
- JavaScript
- JSON

## Project Structure

```text id="im5vcg"
modular-single-page/
│
├── index.html
├── README.md
├── LICENSE
├── .gitignore
│
├── config/
│   ├── website.json
│   ├── sections.json
│   └── navigation.json
│
├── sections/
│   ├── header.html
│   ├── hero.html
│   ├── about.html
│   ├── skills.html
│   ├── services.html
│   ├── projects.html
│   ├── experience.html
│   ├── contact.html
│   └── footer.html
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── responsive.css
│   │   └── sections.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── section-loader.js
│   │   ├── navigation.js
│   │   └── theme.js
│   │
│   └── images/
│
└── docs/
    ├── getting-started.md
    ├── how-it-works.md
    ├── add-new-section.md
    ├── configuration.md
    └── deployment.md
```

The structure above represents the planned repository layout.
Some files will be implemented in upcoming development stages.

## How It Works

1. The browser opens `index.html`.
2. The main JavaScript loader reads section configuration.
3. Enabled HTML sections are fetched.
4. Successfully loaded sections replace matching fallback HTML.
5. The browser displays the assembled single-page website.
6. If a section fails to load, its fallback content remains visible.

The dynamic loading workflow will be implemented in a later development stage.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/codersusheel/modular-single-page.git
```

This command assumes the repository has been created under the specified GitHub account.

### Open the Project

```bash
cd modular-single-page
```

### Run Locally

Use VS Code with the Live Server extension.

Alternatively, run:

```bash
python -m http.server 8000
```

Open:

`http://localhost:8000/`

## Adding a New Section

For the planned JSON-based loader:

1. Create a new HTML file in `sections/`.
2. Add its configuration to `config/sections.json`.
3. Add optional CSS and JavaScript.
4. Configure navigation if needed.
5. Test the section in the browser.

Detailed documentation will be available in `docs/add-new-section.md`.

## Development Roadmap

### Version 1.0.0

- [x] Repository structure planning
- [x] Initial HTML template
- [x] README documentation
- [ ] CSS stylesheets
- [ ] Section HTML files
- [ ] JavaScript section loader
- [ ] JSON configuration
- [ ] Responsive navigation
- [ ] Theme management
- [ ] Deployment testing

## Use Cases

- Personal portfolio websites
- Landing pages
- Product showcases
- Educational websites
- Community websites
- Project documentation websites
- Small business websites

## Contributions

Contributions, suggestions and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your implementation.
5. Submit a pull request.

## Author

**Susheel Kumar Prajapati**

Brand: Codersusheel

GitHub: https://github.com/codersusheel

LinkedIn: https://www.linkedin.com/in/codersusheel/

## License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

Built with HTML, CSS and JavaScript.

© 2026 Susheel Kumar Prajapati.
