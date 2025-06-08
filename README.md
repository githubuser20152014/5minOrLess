# 5 mins or less

A serene task management web application designed to bring calm under chaos. Built with a zen aesthetic that promotes focused productivity through intuitive project organization and mindful task management.

![Task Management App Screenshot](https://img.shields.io/badge/Status-Ready_for_Production-brightgreen)

## ✨ Features

### 🎯 Core Functionality
- **3-Level Hierarchy**: Projects → Milestones → Tasks
- **Drag & Drop**: Reorder projects and move tasks between milestones
- **Collapsible Milestones**: Reduce visual clutter with expandable sections
- **Due Date Management**: Set and track deadlines at all levels
- **Progress Tracking**: Visual progress bars showing completion status
- **Task Completion**: Mark tasks as done with smooth animations

### 🧘 Zen Design Philosophy
- **Calm Color Palette**: Sage greens, soft lavenders, and stone tones
- **Glass Morphism**: Semi-transparent elements with subtle backdrop blur
- **Smooth Transitions**: Gentle cubic-bezier animations throughout
- **Breathing Room**: Generous spacing and rounded corners
- **Soft Shadows**: Diffused shadows for depth without harshness

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Keyboard Navigation**: Full accessibility support
- **Real-time Updates**: Instant feedback for all interactions
- **Persistent State**: All changes are automatically saved

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/5-mins-or-less.git
   cd 5-mins-or-less
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 📖 How to Use

### Creating Your First Project

1. Click the **"New Project"** button in the header
2. Enter your project name and optional due date
3. Your project card will appear on the dashboard

### Managing Milestones

1. **Add Milestone**: Click the "+" button within a project card
2. **Expand/Collapse**: Click the chevron arrow next to milestone names
3. **Set Due Dates**: Click "Add due date" or existing date to modify
4. **Delete**: Use the three-dot menu for deletion options

### Working with Tasks

1. **Add Tasks**: Click "Add a task" in an expanded milestone
2. **Mark Complete**: Click the checkbox next to any task
3. **Edit Names**: Click on task text to edit inline
4. **Move Tasks**: Drag tasks between different milestones
5. **Set Due Dates**: Add deadlines to individual tasks
6. **Delete**: Use the task menu for removal

### Organizing Projects

- **Reorder Projects**: Drag project cards to rearrange them
- **Track Progress**: View completion percentage in project headers
- **Monitor Deadlines**: Color-coded due date indicators show urgency

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Beautiful DnD** - Drag and drop functionality
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management

### Backend
- **Express.js** - Web server framework
- **Node.js** - Runtime environment
- **In-Memory Storage** - Development data persistence
- **TypeScript** - End-to-end type safety

### Build Tools
- **Vite** - Fast development and build tool
- **ESBuild** - Lightning-fast bundling
- **PostCSS** - CSS processing

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Application pages
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage layer
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Data models and validation
└── components.json        # UI component configuration
```

## 🎨 Design System

### Color Palette
- **Zen Sage**: `hsl(140, 25%, 85%)` - Primary accent color
- **Zen Lavender**: `hsl(240, 20%, 88%)` - Secondary backgrounds
- **Zen Stone**: `hsl(210, 15%, 65%)` - Muted text and borders
- **Zen Mist**: `hsl(200, 25%, 95%)` - Light backgrounds
- **Zen Accent**: `hsl(180, 35%, 70%)` - Interactive elements

### Typography
- **Font**: System font stack with fallbacks
- **Weights**: Light (300) for headers, regular (400) for body
- **Tracking**: Increased letter spacing for calm readability

### Spacing Scale
- **Base Unit**: 0.25rem (4px)
- **Component Padding**: 1rem - 1.5rem
- **Section Margins**: 2rem - 3rem

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality. All configuration is handled through the TypeScript files.

### Customization
- **Colors**: Modify CSS variables in `client/src/index.css`
- **Components**: Update component styles in respective files
- **Data Models**: Extend schemas in `shared/schema.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain the zen design philosophy
- Add tests for new functionality
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by mindful productivity principles
- Built with modern web technologies
- Designed for developers who value both function and form

---

**Made with 🧘 for developers seeking calm productivity**