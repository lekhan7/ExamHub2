# Exam Hub - Real-time Collaborative Study Platform

A modern, real-time collaborative study platform designed specifically for competitive exam aspirants. Think of it as a fusion of Google Meet (without audio/video), Notion, and a collaborative whiteboard — purely focused on group study.

## 🚀 Features

### 🏠 Study Rooms
- **Public & Private Rooms**: Create public rooms visible on homepage or private rooms with invite codes
- **Real-time Collaboration**: All features sync instantly across all room members
- **Member Presence**: See who's online with live indicators
- **Room Management**: Create, join, and leave rooms seamlessly

### 📄 PDF Collaboration
- **Shared PDF Viewer**: Upload and study PDFs together in real-time
- **Page Synchronization**: Follow other members' navigation or browse freely
- **Zoom Controls**: Zoom in/out for better readability
- **Multiple PDFs**: Support for multiple PDF uploads with history

### 📝 Shared Notes
- **Real-time Editing**: Every keystroke synced instantly with 300ms debounce
- **Rich Text Formatting**: Bold, italic, underline, headings, lists, highlights, code
- **Live Editing Indicators**: See who's currently editing
- **Export Functionality**: Download notes as .txt files

### ✏️ Collaborative Whiteboard
- **Drawing Tools**: Pen, line, rectangle, circle tools
- **Text Tool**: Add text annotations anywhere on canvas
- **Style Controls**: Color picker and stroke width adjustment
- **Real-time Sync**: Every stroke broadcast instantly to all members
- **Canvas Actions**: Undo, redo, clear board, download as PNG

### 💬 Text Chat
- **Real-time Messaging**: Instant text communication
- **Typing Indicators**: See when others are typing
- **Message History**: Persistent chat within each room
- **Clean Interface**: Text-only focus for distraction-free studying

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Framer Motion** for beautiful animations
- **Tailwind CSS** for dark-mode styling
- **Socket.IO Client** for real-time features
- **React PDF** for PDF viewing
- **Konva.js** for canvas drawing

### Backend
- **Node.js + Express** server
- **Socket.IO** for real-time communication
- **Multer** for file uploads
- **In-memory storage** (no database required)

## 📁 Project Structure

```
/exam-hub
  /client                    # React + Vite frontend
    /src
      /pages                 # Main pages
        Home.jsx             # Landing + public rooms
        MyExams.jsx          # User's rooms
        Room.jsx             # Study room experience
      /components
        /layout             # Layout components
        /home               # Home page components
        /modals             # Create/Join room modals
        /room               # Room components
      /socket               # Socket.IO client
      /context              # Global state
      /hooks                # Custom React hooks
      /animations           # Framer Motion variants
  /server                    # Node.js + Express backend
    index.js                # Server entry point
    roomManager.js          # Room state management
    socketHandlers.js       # Socket event handlers
    utils.js               # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-hub
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server** (from server directory)
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

2. **Start the client** (from client directory)
   ```bash
   npm run dev
   ```
   Client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🎯 Usage Guide

### Creating a Study Room
1. Click "Create a Study Room" on the home page
2. Fill in room details:
   - Room name (e.g., "UPSC Prelims 2025 – History Focus")
   - Exam tag (UPSC, JEE, NEET, etc.)
   - Visibility (Public/Private)
   - Your display name
3. Get your invite link and share with study partners

### Joining a Study Room
1. Browse public rooms on the home page
2. Click "Join Room" on any room card
3. Enter your display name
4. For private rooms, also enter the room code

### Using Study Tools
- **PDF Viewer**: Upload PDFs, navigate pages, sync with others
- **Shared Notes**: Collaborate on notes in real-time with formatting
- **Whiteboard**: Draw diagrams, add text, collaborate visually
- **Chat**: Communicate via text with typing indicators

## 🔌 Socket.IO Events

### Client → Server
- `room:create` - Create new room
- `room:join` - Join existing room
- `room:leave` - Leave room
- `pdf:upload` - Upload PDF to room
- `pdf:changePage` - Change PDF page
- `notes:update` - Update shared notes
- `canvas:draw` - Draw on whiteboard
- `canvas:text` - Add text to whiteboard
- `canvas:clear` - Clear whiteboard
- `chat:message` - Send chat message
- `chat:typing` - Typing indicator

### Server → Client
- `room:created` - Room created successfully
- `room:state` - Initial room state
- `room:memberJoined` - Member joined room
- `room:memberLeft` - Member left room
- `pdf:uploaded` - PDF uploaded to room
- `pdf:pageChanged` - PDF page changed
- `notes:updated` - Notes updated
- `canvas:stroke` - Canvas stroke added
- `canvas:text` - Canvas text added
- `canvas:cleared` - Canvas cleared
- `chat:newMessage` - New chat message
- `chat:userTyping` - User typing indicator

## 🎨 Design System

### Color Palette
- **Background**: `#0A0A0F` (near-black)
- **Surface**: `#111118` / `#1A1A2E`
- **Primary**: `#6366F1` (indigo)
- **Accent**: `#8B5CF6` (violet) / `#06B6D4` (cyan)
- **Success**: `#10B981`
- **Text**: `#F8FAFC` / `#94A3B8`
- **Border**: `rgba(255,255,255,0.08)`

### Animations
- Page transitions with fade + slide
- Modal spring animations
- Staggered list animations
- Button hover states
- Live indicator pulses
- Smooth tab switching

## 🌟 Key Features

### Real-time Collaboration
- All features powered by Socket.IO for instant sync
- No polling - true real-time updates
- Optimistic updates for responsive UX

### No Authentication Required
- Simple display name entry
- Focus on learning, not account management
- Privacy through room codes

### Mobile Responsive
- Responsive design for all screen sizes
- Touch-friendly interactions
- Collapsible sidebar on mobile

### Performance Optimized
- Efficient canvas rendering
- Debounced text updates
- Optimized Socket.IO events
- Memory-efficient room management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Screen sharing integration
- [ ] Voice channels (optional)
- [ ] Room recording
- [ ] Advanced whiteboard tools
- [ ] Study timer integration
- [ ] Progress tracking
- [ ] Room templates
- [ ] Integration with study resources

## 🐛 Troubleshooting

### Common Issues

1. **Socket connection issues**
   - Ensure server is running on port 3001
   - Check CORS configuration
   - Verify network connectivity

2. **PDF upload issues**
   - Check file size (max 10MB)
   - Ensure PDF format only
   - Verify server upload directory permissions

3. **Canvas drawing issues**
   - Check browser compatibility
   - Ensure canvas element is properly sized
   - Verify mouse event handling

For more issues, please check the browser console and server logs.

---

Built with ❤️ for competitive exam aspirants worldwide.
