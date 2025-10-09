# SaranOS 🌌

A modern desktop environment that runs entirely in your web browser, built by Sai Saran Rangisetti.

## About

SaranOS recreates the familiar desktop computing experience using web technologies. It features a complete file system, multiple applications, games, and a fully functional desktop environment - all running in your browser.

## Technologies Used

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Styled Components, CSS-in-JS
- **File System**: BrowserFS (IndexedDB backend)
- **Apps & Games**: 
  - Monaco Editor (code editor)
  - Terminal (xterm.js)
  - PDF Viewer (PDF.js)
  - Video Player (Video.js)
  - Paint (jsPaint)
  - Games (Quake III, Pinball, DX-Ball)
  - And many more...
- **Build Tools**: Webpack, Yarn
- **Deployment**: Vercel

## Features

- 🖥️ **Complete Desktop Environment** - Windows, taskbar, start menu
- 📁 **File System** - Drag & drop, ZIP support, file operations
- 🎮 **Games** - Classic games like Quake III, Pinball, DX-Ball
- 📝 **Apps** - Code editor, terminal, PDF viewer, paint, and more
- 🎨 **Customizable** - Wallpapers, themes, window management
- 🌐 **Web-based** - No installation required, runs in any modern browser

## How to Run

### Prerequisites
- Node.js 18+ 
- Yarn package manager

### Development
```bash
# Install dependencies
yarn install

# Run prebuild scripts
yarn build:prebuild

# Start development server
yarn dev
```

### Production
```bash
# Build for production
yarn build

# Serve the built files
yarn serve
```

### Docker
```bash
# Build Docker image
docker build -t saranos .

# Run container
docker run -dp 3000:3000 --rm --name saranos saranos
```

## Live Demo

Visit the live demo at: [https://saran-os.vercel.app](https://saran-os.vercel.app)

## Author

**Sai Saran Rangisetti**  
GitHub: [@saranRangisetti](https://github.com/saranRangisetti)  
Email: saisaran6527@gmail.com

---

*Experience the future of desktop computing in your browser* 🚀