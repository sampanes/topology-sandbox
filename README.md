# Topological Sandbox Suite

A collection of interactive experiments exploring **Topology**, **Genus (g)**, and **Hand-drawn Numerals**.

## How to Build and Run Locally

Follow these steps to get the project running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/topology-sandbox.git
    cd topology-sandbox
    ```

2.  **Install dependencies:**
    (Requires [Node.js](https://nodejs.org/))
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. The landing page allows you to select between the available sandboxes.

4.  **Build for production:**
    ```bash
    npm run build
    ```
    This generates an optimized static build in the `dist/` folder.

---

## Available Sandboxes

### 1. Topological Manifold Sandbox (`draw_canvas`)
A "2D Liquid Clay" sculpting sandbox for exploring topology and **Genus (g)**.
- **The "Pill" Brush:** Calculates vectors between mouse events to generate capsule shapes, ensuring a continuous manifold without gaps.
- **Real-time Genus (g) Count:** Uses the **Non-Zero Winding Rule** and boolean union operations to identify internal boundaries (holes).
- **Topological Surgery:** Perform boolean subtraction to "open" loops and instantly modify the manifold's genus count.
- **Canonical Morphing:** Transform complex hand-drawn shapes into their mathematically ideal "lowest energy" states (e.g., a perfect Circle for $g=0$).

### 2. Number Rankings (`number_rankings`)
A hand-drawn numeral tier list for ranking numbers 0-11 based on aesthetic or topological qualities.
- **Hand-drawn Numerals:** Unique SVG styles for each numeral.
- **Interactive Tier List:** Smooth drag-and-drop mechanics to categorize numerals into S, A, or B tiers.
- **Custom Aesthetic:** Modern, polished UI with interactive feedback and glowing gradients.

---

## How to Deploy to GitHub Pages

The project is now a single Vite app. Both sandboxes live inside one static build and are switched inside the app instead of being deployed as separate entry pages.

### Option A: GitHub Pages Workflow
Use a GitHub Actions workflow to run `npm ci`, build the app, and deploy the generated `dist/` folder.

### Option B: Manual Static Upload
1.  Run `npm run build`.
2.  Publish the contents of `dist/` to GitHub Pages.

---

## Core Mechanics

### Blueprint Aesthetic
The project utilizes a consistent "Technical Blueprint" aesthetic across the suite:
- **Background:** `#05050a` (Deep Space)
- **Grid:** `#1a1a2e` (Technical Blueprint Grid)
- **Geometry:** Neon accents (e.g., `#64daff` for Manifolds) with custom glow effects.

### Technology Stack
- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Graphics:** [Paper.js](http://paperjs.org/) (for complex vector math and boolean operations)


## How to just use it online:

[Sampanes Topology Page](https://sampanes.github.io/topology-sandbox/)