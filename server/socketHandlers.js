const roomManager = require('./roomManager');

module.exports = (io, socket) => {
  // Room creation
  socket.on('room:create', async (data) => {
    const { roomName, examTag, isPublic, creatorName } = data;
    
    try {
      const room = await roomManager.createRoom(roomName, examTag, isPublic, creatorName);
      const member = {
        socketId: socket.id,
        displayName: creatorName,
        isCreator: true,
        joinedAt: new Date()
      };
      
      // Update user's socket ID
      await require('./databaseServices').createOrUpdateUser(creatorName, socket.id);
      
      socket.join(room.id);
      
      socket.emit('room:created', { room, member });
      
      if (room.isPublic) {
        const publicRooms = await roomManager.getPublicRooms();
        io.emit('publicRooms:update', publicRooms);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Room joining
  socket.on('room:join', async (data) => {
    console.log('🔥 Room join request received:', data);
    const { roomId, displayName, roomCode } = data;
    
    try {
      console.log('🔍 Looking for room:', roomId);
      const room = await roomManager.getRoom(roomId);
      
      if (!room) {
        console.log('❌ Room not found:', roomId);
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      console.log('✅ Room found:', room);
      console.log('🔍 Room details:', {
        isPublic: room.isPublic,
        roomCode: room.roomCode,
        providedCode: roomCode
      });
      
      // Check room user limit (max 10 users)
      const currentMembers = room.members || [];
      if (currentMembers.length >= 10) {
        console.log('❌ Room is full:', { roomId, currentCount: currentMembers.length, maxCount: 10 });
        socket.emit('room_full', { message: 'Room is full' });
        return;
      }
      
      // Only validate room code for private rooms
      if (!room.isPublic && room.roomCode !== roomCode) {
        console.log('❌ Invalid room code:', { expected: room.roomCode, provided: roomCode });
        socket.emit('error', { message: 'Invalid room code' });
        return;
      }
      
      const member = {
        socketId: socket.id,
        displayName,
        isCreator: room.creator === displayName,
        joinedAt: new Date()
      };
      
      console.log('👤 Adding member:', member);
      await roomManager.addMember(roomId, member);
      socket.join(roomId);
      
      // Get fresh room data after adding member
      const updatedRoom = await roomManager.getRoom(roomId);
      console.log('📡 Updated room data:', updatedRoom);
      
      console.log('📡 Sending room:state to new member');
      console.log('📊 PDF data being sent:', updatedRoom.pdf);
      console.log('📊 Full room data keys:', Object.keys(updatedRoom));
      console.log('📊 PDF data type:', typeof updatedRoom.pdf);
      
      // Send room state to the new member with fresh data
      socket.emit('room:state', {
        room: updatedRoom,
        members: updatedRoom.members || [],
        notes: updatedRoom.notes || '',
        canvasHistory: updatedRoom.canvasHistory || [],
        pdf: updatedRoom.pdf || null,  // Fixed: was currentPdf
        messages: updatedRoom.messages || []
      });

      console.log('📡 Broadcasting room:joined to room');
      // Notify other room members
      socket.to(roomId).emit('room:memberJoined', { 
        room: updatedRoom, 
        member,
        members: updatedRoom.members || []
      });
      
      // Also send room:joined to the new member for consistency
      console.log('📤 Sending room:joined to new member:', socket.id);
      socket.emit('room:joined', { 
        room: updatedRoom, 
        member,
        members: updatedRoom.members || []
      });
      
      console.log('✅ Room join completed for:', displayName);
      
      // Update public rooms list if it's a public room
      if (room.isPublic) {
        const publicRooms = await roomManager.getPublicRooms();
        io.emit('publicRooms:update', publicRooms);
      }
    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room: ' + error.message });
    }
  });

  // Handle leaving a room
  socket.on('room:leave', async (data) => {
    const { roomId, displayName } = data;
    
    try {
      const room = await roomManager.getRoom(roomId);
      if (!room) return;

      const removedMember = await roomManager.removeMember(roomId, socket.id);
      
      if (removedMember) {
        socket.leave(roomId);
        
        // Check if the leaving member was the creator
        const wasCreator = room.creator === displayName;
        
        if (wasCreator && room.members && room.members.length > 0) {
          // Transfer creator role to the next member (first in list)
          const newCreator = room.members[0];
          const oldCreator = room.creator;
          
          // Update room creator in database
          await roomManager.updateRoomCreator(roomId, newCreator.displayName);
          
          // Broadcast creator change to all members
          io.to(roomId).emit('room:creatorChanged', {
            newCreator: newCreator.displayName,
            oldCreator: oldCreator,
            members: (await roomManager.getRoom(roomId))?.members || []
          });
          
          console.log(`👑 Creator transferred from ${oldCreator} to ${newCreator.displayName}`);
        }
        
        socket.to(roomId).emit('room:memberLeft', { 
          displayName: removedMember.displayName, 
          members: (await roomManager.getRoom(roomId))?.members || [] 
        });
        
        // Update public rooms list
        if (room.isPublic) {
          const publicRooms = await roomManager.getPublicRooms();
          io.emit('publicRooms:update', publicRooms);
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Handle ending room for everyone (creator only)
  socket.on('room:end', async (data) => {
    const { roomId, displayName } = data;
    
    try {
      const room = await roomManager.getRoom(roomId);
      if (!room) return;
      
      // Verify the requester is the creator
      if (room.creator !== displayName) {
        socket.emit('error', { message: 'Only the room creator can end the room' });
        return;
      }
      
      // Broadcast room ended event to all members
      io.to(roomId).emit('room:ended', {
        message: 'The creator has ended this room.',
        endedBy: displayName
      });
      
      // Delete the room from database
      await roomManager.deleteRoom(roomId);
      
      // Make all members leave the room
      const members = room.members || [];
      members.forEach(member => {
        if (member.socketId) {
          io.sockets.sockets.get(member.socketId)?.leave(roomId);
        }
      });
      
      // Update public rooms list if it was public
      if (room.isPublic) {
        const publicRooms = await roomManager.getPublicRooms();
        io.emit('publicRooms:update', publicRooms);
      }
      
      console.log(`💥 Room ${roomId} ended by creator ${displayName}`);
    } catch (error) {
      console.error('Error ending room:', error);
      socket.emit('error', { message: 'Failed to end room' });
    }
  });

  // Member-specific notes update
  socket.on('member:notes:update', async (data) => {
    console.log('🔥 Server received member:notes:update event:', data);
    const { roomId, userId, notes } = data;
    
    try {
      await roomManager.updateMemberNotes(roomId, userId, notes);
      
      // Broadcast to entire room
      const broadcastData = {
        roomId,
        userId,
        notes
      };
      
      console.log('📡 Broadcasting member:notes:updated to room:', roomId, broadcastData);
      io.to(roomId).emit('member:notes:updated', broadcastData);
      
      console.log('✅ Member notes updated and broadcasted');
    } catch (error) {
      console.error('❌ Error updating member notes:', error);
      socket.emit('error', { message: 'Failed to update notes' });
    }
  });

  // Member-specific canvas update
  socket.on('member:canvas:update', async (data) => {
    console.log('🔥 Server received member:canvas:update event:', data);
    const { roomId, userId, canvasHistory } = data;
    
    try {
      await roomManager.updateMemberCanvas(roomId, userId, canvasHistory);
      
      // Broadcast to entire room
      const broadcastData = {
        roomId,
        userId,
        canvasHistory
      };
      
      console.log('📡 Broadcasting member:canvas:updated to room:', roomId, broadcastData);
      io.to(roomId).emit('member:canvas:updated', broadcastData);
      
      console.log('✅ Member canvas updated and broadcasted');
    } catch (error) {
      console.error('❌ Error updating member canvas:', error);
      socket.emit('error', { message: 'Failed to update canvas' });
    }
  });

  // Shared notes updates
  socket.on('notes:update', async (data) => {
    const { roomId, content, editedBy } = data;
    
    try {
      // Get user by display name to get proper user ID
      const DatabaseServices = require('./databaseServices');
      const user = await DatabaseServices.createOrUpdateUser(editedBy, socket.id);
      
      if (!user) {
        socket.emit('error', { message: 'Invalid user' });
        return;
      }
      
      await roomManager.updateNotes(roomId, content, user.id);
      
      // Broadcast to entire room INCLUDING sender (io.to instead of socket.to)
      io.to(roomId).emit('notes:updated', { 
        content, 
        editedBy: user.display_name
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      socket.emit('error', { message: 'Failed to update notes' });
    }
  });

  // PDF upload handler
  socket.on('pdf:upload', async ({ roomId, pdf }) => {
    try {
      // Get room to ensure it exists
      const room = await roomManager.getRoom(roomId);
      if (!room) return;

      // Get the actual user ID for the creator (since pdf.uploadedBy is just "creator")
      const DatabaseServices = require('./databaseServices');
      const user = await DatabaseServices.createOrUpdateUser(room.creator, null);
      
      if (!user) {
        console.error('❌ Creator user not found:', room.creator);
        socket.emit('error', { message: 'Creator user not found' });
        return;
      }

      console.log('📄 PDF upload - storing URL:', pdf.data);
      console.log('📄 PDF name:', pdf.name);
      console.log('📄 PDF uploadedBy:', pdf.uploadedBy);

      // Update PDF in room with URL (pdf.data is the Supabase URL from upload API)
      await roomManager.updatePDF(roomId, pdf.data, pdf.name, user.id);

      console.log('📄 PDF URL stored for room:', roomId, pdf.name, 'by user:', user.id);

      // Broadcast to ALL members in the room including creator
      io.to(roomId).emit('pdf:updated', { pdf });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      socket.emit('error', { message: 'Failed to upload PDF' });
    }
  });

  // Notes save (with lock)
  socket.on('notes:save', async (data) => {
    console.log('🔥 Server received notes:save event:', data);
    const { roomId, content, savedBy, savedAt } = data;
    
    try {
      // Get user by display name to get proper user ID
      const DatabaseServices = require('./databaseServices');
      const user = await DatabaseServices.createOrUpdateUser(savedBy, socket.id);
      
      if (!user) {
        socket.emit('error', { message: 'Invalid user' });
        return;
      }
      
      await roomManager.updateNotes(roomId, content, user.id);
      
      // Broadcast to entire room INCLUDING sender with save info
      const broadcastData = {
        content,
        savedBy: user.display_name,
        savedAt,
        editedBy: user.display_name,
        isSaved: true
      };
      
      console.log('📡 Broadcasting notes:updated (saved) to room:', roomId, broadcastData);
      io.to(roomId).emit('notes:updated', broadcastData);
      
      console.log('✅ Notes saved and broadcasted by:', user.display_name);
    } catch (error) {
      console.error('❌ Error saving notes:', error);
      socket.emit('error', { message: 'Failed to save notes' });
    }
  });

  // Canvas drawing
  socket.on('canvas:draw', async (data) => {
    const { roomId, strokeData } = data;
    
    try {
      await roomManager.addCanvasStroke(roomId, strokeData);
      // Broadcast to entire room INCLUDING sender
      io.to(roomId).emit('canvas:stroke', strokeData);
    } catch (error) {
      console.error('Error drawing on canvas:', error);
    }
  });

  // Canvas text
  socket.on('canvas:text', async (data) => {
    const { roomId, textData } = data;
    
    try {
      await roomManager.addCanvasStroke(roomId, textData);
      // Broadcast to entire room INCLUDING sender
      io.to(roomId).emit('canvas:text', textData);
    } catch (error) {
      console.error('Error adding text to canvas:', error);
    }
  });

  // Canvas clear
  socket.on('canvas:clear', async (data) => {
    const { roomId, clearedBy } = data;
    
    try {
      await roomManager.clearCanvas(roomId);
      // Broadcast to entire room INCLUDING sender
      io.to(roomId).emit('canvas:cleared', { clearedBy });
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  });

  // Chat messages
  socket.on('chat:message', async (data) => {
    const { roomId, displayName, message, timestamp } = data;
    
    try {
      const messageData = { displayName, message, timestamp };
      const savedMessage = await roomManager.addMessage(roomId, messageData);
      
      if (savedMessage) {
        // Ensure displayName is included in the broadcast
        const broadcastMessage = {
          ...savedMessage,
          displayName: displayName || savedMessage.displayName
        };
        io.to(roomId).emit('chat:newMessage', broadcastMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('chat:typing', (data) => {
    const { roomId, displayName } = data;
    socket.to(roomId).emit('chat:userTyping', { displayName });
  });

  // Handle disconnect with delay to prevent duplicate removal on refresh
  socket.on('disconnect', async () => {
    const disconnectedSocketId = socket.id;
    
    // Delay disconnect handling to allow for refresh reconnection
    setTimeout(async () => {
      try {
        console.log('🔌 Processing disconnect for socket:', disconnectedSocketId);
        const DatabaseServices = require('./databaseServices');
        const supabase = require('./supabase');
        
        // Only try database operations if Supabase is configured
        if (supabase && supabase.supabase) {
          // Get user by socket ID to find their rooms
          const { data: user, error: userError } = await supabase.supabase
            .from('users')
            .select('id, display_name, socket_id')
            .eq('socket_id', disconnectedSocketId)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user on disconnect:', userError);
          }

          if (user && user.socket_id === disconnectedSocketId) {
            // Only remove if socket_id hasn't changed (user didn't reconnect)
            console.log('👤 User did not reconnect, removing:', user.display_name);
            
            // Get all rooms for this user
            const { data: userRooms, error: roomsError } = await supabase.supabase
              .from('room_members')
              .select('room_id, is_creator')
              .eq('user_id', user.id);

            if (roomsError) {
              console.error('Error fetching user rooms:', roomsError);
            }

            if (userRooms) {
              for (const roomMember of userRooms) {
                const roomId = roomMember.room_id;
                const isCreator = roomMember.is_creator;
                
                console.log(`🚪 Removing user ${user.display_name} from room ${roomId}`);
                
                // Remove member from room
                const removedMember = await roomManager.removeMember(roomId, disconnectedSocketId);
                
                if (removedMember) {
                  // Notify other room members
                  io.to(roomId).emit('room:memberLeft', { 
                    displayName: removedMember.displayName,
                    members: (await roomManager.getRoom(roomId))?.members || []
                  });
                  
                  // Update public rooms list if it's a public room
                  const room = await roomManager.getRoom(roomId);
                  if (room && room.isPublic) {
                    const publicRooms = await roomManager.getPublicRooms();
                    io.emit('publicRooms:update', publicRooms);
                  }
                }
              }
            }
            
            // Clear socket ID when disconnected
            await DatabaseServices.createOrUpdateUser(user.display_name, null);
          } else {
            console.log('✅ User reconnected with new socket, skipping removal');
          }
        } else {
          // Fallback: In-memory mode - find and remove from all rooms
          console.log('🔄 Processing disconnect (in-memory mode):', disconnectedSocketId);
          
          // Get all rooms and check if this socket is still the current one for the user
          const allRooms = await roomManager.getPublicRooms();
          for (const room of allRooms) {
            const member = room.members?.find(m => m.socketId === disconnectedSocketId);
            if (member) {
              // Check if user has reconnected with different socket
              const currentRoom = await roomManager.getRoom(room.id);
              const stillConnected = currentRoom?.members?.find(m => 
                m.displayName === member.displayName && m.socketId !== disconnectedSocketId
              );
              
              if (!stillConnected) {
                const removedMember = await roomManager.removeMember(room.id, disconnectedSocketId);
                if (removedMember) {
                  io.to(room.id).emit('room:memberLeft', { 
                    displayName: removedMember.displayName,
                    members: (await roomManager.getRoom(room.id))?.members || []
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
    }, 3000); // 3 second delay to allow for refresh reconnection
  });
};
