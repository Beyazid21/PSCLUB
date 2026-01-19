# Traffic Scene Editor

A professional, production-ready tool for building complex traffic intersections and driving license preparation scenarios. Modeled after Icograms with a focus on polished UX and aesthetics.

## Features

- **Isometric/Grid Workspace**: 2D canvas with snap-to-grid functionality (20px grid).
- **Asset Library**:
  - Vehicles, Roads, and Signs categories.
  - **Drag and Drop**: Easily drag assets from sidebar to canvas.
  - **Custom Upload**: Upload your own PNG/SVG assets.
- **Canvas Tools**:
  - **Transformation**: Select, resize, and rotate objects with transformer handles.
  - **Layer Management**: Bring to Front / Send to Back controls.
  - **Zoom & Pan**: Scroll to zoom, click and drag to pan the canvas.
- **State Persistence**: Your scene is automatically saved to local storage.
- **Export**: Download high-resolution PNGs of your scene (grid-free).
- **Theming**: Toggle between Light and Dark mode.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Canvas**: [React-Konva](https://konvajs.org/docs/react/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run locally**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Keyboard Shortcuts

- `Delete` / `Backspace`: Remove selected object.
- `Ctrl + C`: Copy selected object.
- `Ctrl + V`: Paste copied object.
