import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoomProvider } from './context/RoomContext';
import { SocketProvider } from './context/SocketContext';
import './i18n';

// Pages
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import Room from './pages/Room';

function App() {
  const { i18n } = useTranslation();
  
  return (
    <SocketProvider>
      <RoomProvider>
        <div key={i18n.language} className="min-h-screen bg-primary text-primary">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </div>
      </RoomProvider>
    </SocketProvider>
  );
}

export default App;
