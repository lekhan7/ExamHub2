import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.isReconnecting = false; // Add reconnection flag
  }

  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    // Use the current origin to dynamically determine the socket URL
    const socketUrl = process.env.NODE_ENV === 'development' 
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin;

    this.socket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      this.connected = true;
      window.socket = this.socket; // Expose for component access
      console.log('Connected to server:', this.socket.id);
      console.log('Socket URL:', socketUrl);
      
      // Rejoin room if we were in one AND this is a reconnection (not page refresh)
      const currentRoomId = localStorage.getItem('currentRoomId');
      
      // Better page refresh detection
      const isPageRefresh = (
        performance.getEntriesByType && 
        performance.getEntriesByType('navigation').length > 0
      ) ? (
        performance.getEntriesByType('navigation')[0].type === 'reload'
      ) : (
        // Fallback: Check if we have room data but no socket connection
        localStorage.getItem('currentRoomId') && !this.connected
      );
      
      if (currentRoomId && this.isReconnecting && !isPageRefresh) {
        console.log('Rejoining room after disconnect:', currentRoomId);
        this.socket.emit('room:join', {
          roomId: currentRoomId,
          displayName: localStorage.getItem('displayName') || 'User'
        });
        this.isReconnecting = false; // Reset flag after rejoining
      } else if (currentRoomId && isPageRefresh) {
        console.log('Page refresh detected, waiting for room state...');
        // Don't auto-rejoin on page refresh, let Room component handle it
        this.isReconnecting = false; // Reset flag
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.isReconnecting = true; // Set reconnection flag
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      this.connected = false;
      console.error('Connection error:', error);
      console.error('Connection details:', {
        url: socketUrl,
        connected: this.connected,
        socketId: this.socket?.id
      });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  emit(event, data) {
    console.log('SocketService emit called:', event, data);
    console.log('Socket state:', {
      socketExists: !!this.socket,
      connected: this.connected,
      socketId: this.socket?.id
    });
    
    if (this.socket && this.connected) {
      console.log('Emitting event:', event, 'with data:', data);
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
      console.warn('Connection state:', {
        socketExists: !!this.socket,
        connected: this.connected,
        socketId: this.socket?.id
      });
      
      // Try to reconnect if not connected
      if (!this.connected) {
        console.log('Attempting to reconnect...');
        this.connect();
        
        // Retry the emit after a short delay
        setTimeout(() => {
          if (this.connected) {
            console.log('Retrying emit for event:', event);
            this.socket.emit(event, data);
          } else {
            console.error('Still not connected after reconnection attempt');
          }
        }, 1000);
      }
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket || this.connect();
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('room:join', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('room:leave', roomId);
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
