# TypingApp - Real-time Multiplayer Typing Race

A modern, full-stack typing test application with real-time multiplayer racing capabilities built with React, Node.js, and Socket.IO.

## 🚀 Features

### Solo Typing
- **Clean, focused typing interface** with real-time character highlighting
- **Live statistics tracking** including WPM, accuracy, and errors
- **Configurable test options** with various text lengths and difficulties
- **Detailed results analysis** with performance metrics
- **User authentication** with progress tracking

### Multiplayer Racing
- **Real-time multiplayer races** with up to multiple players
- **Live player rankings** with progress indicators
- **Three-column layout** for optimal race viewing:
  - **Left**: Your live statistics (WPM, accuracy, progress)
  - **Center**: Text display with synchronized typing area
  - **Right**: Real-time player leaderboard with rankings
- **Race countdown system** with synchronized start
- **Live progress tracking** for all participants
- **Final race results** with comprehensive statistics

## 🎨 UI/UX Features

- **Unified text display** with consistent 3-line view and smart auto-scroll
- **Modern dark theme** optimized for extended typing sessions
- **Responsive design** that works on desktop and mobile devices
- **Real-time visual feedback** with character-by-character highlighting
- **Smooth animations** and transitions throughout the interface
- **Current player highlighting** in multiplayer races

## 🛠 Tech Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Vite** for fast development and optimized builds
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **CSS3** with modern layouts (Grid, Flexbox)
- **ESLint** for code quality

### Backend
- **Node.js** with Express.js framework
- **Socket.IO** for real-time multiplayer functionality
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** for authentication
- **CORS** for cross-origin resource sharing
- **Nodemon** for development auto-restart

## 📁 Project Structure

```
TypingApp/
├── Frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── common/      # Shared components
│   │   │   ├── multiplayer/ # Multiplayer-specific components
│   │   │   └── typing/      # Solo typing components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Main page components
│   │   ├── services/        # API and Socket services
│   │   ├── utils/           # Helper functions
│   │   └── contexts/        # React contexts
│   ├── package.json
│   └── vite.config.js
│
└── Backend/                 # Node.js backend server
    ├── config/              # Configuration files
    ├── middleware/          # Express middleware
    ├── models/              # MongoDB/Mongoose models
    ├── routes/              # API route handlers
    ├── services/            # Business logic services
    ├── server.js            # Main server file
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TypingApp
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Create `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/typingapp
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

   Create `.env.local` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   Server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

3. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Use

### Solo Typing Test
1. Navigate to the main typing page
2. Configure your test settings (time, difficulty)
3. Click in the text area to start typing
4. Type the displayed text as accurately and quickly as possible
5. View your results including WPM, accuracy, and detailed statistics

### Multiplayer Racing
1. Click "Multiplayer Race" from the main menu
2. Enter your username to join or create a race
3. Wait for other players to join
4. Race starts automatically with a countdown
5. Type the same text as other players in real-time
6. Watch live rankings and your progress in the three-column layout
7. View final race results when finished

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Key Features Implementation

#### Real-time Multiplayer
- Socket.IO handles real-time communication between players
- Race state synchronization across all connected clients
- Live progress updates and ranking calculations

#### Unified Text Display
- Intelligent auto-scroll that activates when approaching line completion
- Character-by-character highlighting for typing feedback

#### Three-Column Multiplayer Layout
- **Responsive grid layout** that adapts to screen sizes
- **Left column**: Personal statistics with live updates
- **Center column**: Text display and typing input
- **Right column**: Live player rankings with progress bars

## 🎯 Performance Optimizations

- **Efficient re-rendering** with React hooks and memoization
- **Optimized text processing** for large texts
- **Smart scroll management** to reduce unnecessary DOM updates
- **WebSocket connection management** for stable multiplayer experience
- **CSS-based animations** for smooth UI transitions

## 🔐 Security Features

- JWT-based authentication for user sessions
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Environment-based configuration management
