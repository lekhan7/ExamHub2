const DatabaseServices = require('./databaseServices');

class RoomManager {
  constructor() {
    // Keep in-memory cache for performance, but use database as source of truth
    this.cache = new Map();
  }

  // These methods are now handled by DatabaseServices
  // Keeping for backward compatibility during transition

  async createRoom(roomName, examTag, isPublic, creatorName) {
    try {
      const room = await DatabaseServices.createRoom(roomName, examTag, isPublic, creatorName);
      // Update cache
      this.cache.set(room.id, room);
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async getRoom(roomId) {
    try {
      // Check cache first
      if (this.cache.has(roomId)) {
        return this.cache.get(roomId);
      }
      
      const room = await DatabaseServices.getRoom(roomId);
      if (room) {
        this.cache.set(roomId, room);
      }
      return room;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  async getPublicRooms() {
    try {
      const rooms = await DatabaseServices.getPublicRooms();
      return rooms;
    } catch (error) {
      console.error('Error getting public rooms:', error);
      return [];
    }
  }

  async addMember(roomId, member) {
    try {
      // Create or update user
      const user = await DatabaseServices.createOrUpdateUser(member.displayName, member.socketId);
      
      // Add member to room (handles duplicates internally)
      const roomMember = await DatabaseServices.addMemberToRoom(roomId, user.id, member.isCreator, member.socketId);
      
      // Update cache with fresh room data
      const room = await this.getRoom(roomId);
      if (room && roomMember) {
        // Check if member already exists in cache (prevent duplicates)
        const existingMemberIndex = room.members.findIndex(m => 
          m.displayName === roomMember.displayName
        );
        
        if (existingMemberIndex !== -1) {
          // Update existing member (refresh/reconnect case)
          room.members[existingMemberIndex] = roomMember;
          console.log('🔄 Updated existing member in cache:', roomMember.displayName);
        } else {
          // Add new member
          room.members.push(roomMember);
          console.log('➕ Added new member to cache:', roomMember.displayName);
        }
        
        this.cache.set(roomId, room);
        console.log('📊 Updated room members count:', room.members.length);
      }
      
      return roomMember;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  async updateMemberPDF(roomId, userId, pdfName, pdfData) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Update or add member PDF data
      if (!room.memberData) {
        room.memberData = {};
      }
      
      room.memberData[userId] = {
        ...room.memberData[userId],
        pdf: { name: pdfName, data: pdfData },
        updatedAt: new Date()
      };

      // Update cache
      this.cache.set(roomId, room);
      
      // Update database if configured
      if (require('./databaseServices').isSupabaseConfigured) {
        await require('./databaseServices').updateMemberData(roomId, userId, room.memberData[userId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating member PDF:', error);
      return false;
    }
  }

  async updateMemberNotes(roomId, userId, notes) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Update or add member notes data
      if (!room.memberData) {
        room.memberData = {};
      }
      
      room.memberData[userId] = {
        ...room.memberData[userId],
        notes,
        updatedAt: new Date()
      };

      // Update cache
      this.cache.set(roomId, room);
      
      // Update database if configured
      if (require('./databaseServices').isSupabaseConfigured) {
        await require('./databaseServices').updateMemberData(roomId, userId, room.memberData[userId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating member notes:', error);
      return false;
    }
  }

  async updateMemberCanvas(roomId, userId, canvasHistory) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Update or add member canvas data
      if (!room.memberData) {
        room.memberData = {};
      }
      
      room.memberData[userId] = {
        ...room.memberData[userId],
        canvasHistory,
        updatedAt: new Date()
      };

      // Update cache
      this.cache.set(roomId, room);
      
      // Update database if configured
      if (require('./databaseServices').isSupabaseConfigured) {
        await require('./databaseServices').updateMemberData(roomId, userId, room.memberData[userId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating member canvas:', error);
      return false;
    }
  }

  async removeMember(roomId, socketId) {
    try {
      const removedMember = await DatabaseServices.removeMemberFromRoom(roomId, socketId);
      
      // Update cache
      const room = this.cache.get(roomId);
      if (room && removedMember) {
        const memberIndex = room.members.findIndex(m => m.socketId === socketId);
        if (memberIndex !== -1) {
          room.members.splice(memberIndex, 1);
          this.cache.set(roomId, room);
        }
      }
      
      return removedMember;
    } catch (error) {
      console.error('Error removing member:', error);
      return null;
    }
  }

  async updateRoomState(roomId, updates) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return null;

      // Update cache
      Object.assign(room, updates);
      this.cache.set(roomId, room);
      return room;
    } catch (error) {
      console.error('Error updating room state:', error);
      return null;
    }
  }

  async addMessage(roomId, messageData) {
    try {
      const supabase = require('./supabase');
      
      // Get user by display name
      let user = null;
      if (supabase && supabase.supabase) {
        const { data: userData } = await supabase.supabase
          .from('users')
          .select('id')
          .eq('display_name', messageData.displayName)
          .single();
        user = userData;
      } else {
        // Fallback: find user in DatabaseServices.fallbackStorage by display name
        const DatabaseServices = require('./databaseServices');
        const userFromStorage = DatabaseServices.fallbackStorage.users.get(messageData.displayName);
        if (userFromStorage) {
          user = { id: userFromStorage.id };
        }
      }

      if (!user) throw new Error('User not found');

      const message = await DatabaseServices.addMessage(
        roomId, 
        user.id, 
        messageData.message, 
        messageData.timestamp
      );

      // Update cache
      const room = await this.getRoom(roomId);
      if (room) {
        room.messages.push(message);
        // Keep only last 100 messages
        if (room.messages.length > 100) {
          room.messages = room.messages.slice(-100);
        }
        this.cache.set(roomId, room);
      }
      
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }

  async addCanvasStroke(roomId, strokeData) {
    try {
      const supabase = require('./supabase');
      
      // Get user by display name from stroke data
      let user = null;
      if (supabase && supabase.supabase) {
        const { data: userData } = await supabase.supabase
          .from('users')
          .select('id')
          .eq('display_name', strokeData.displayName)
          .single();
        user = userData;
      } else {
        // Fallback: find user in DatabaseServices.fallbackStorage by display name
        const DatabaseServices = require('./databaseServices');
        const userFromStorage = DatabaseServices.fallbackStorage.users.get(strokeData.displayName);
        if (userFromStorage) {
          user = { id: userFromStorage.id };
        }
      }

      if (!user) throw new Error('User not found');

      const stroke = await DatabaseServices.addCanvasStroke(roomId, strokeData, user.id);

      // Update cache
      const room = await this.getRoom(roomId);
      if (room) {
        room.canvasHistory.push(stroke);
        // Keep only last 500 strokes to prevent memory issues
        if (room.canvasHistory.length > 500) {
          room.canvasHistory = room.canvasHistory.slice(-500);
        }
        this.cache.set(roomId, room);
      }
      
      return stroke;
    } catch (error) {
      console.error('Error adding canvas stroke:', error);
      return null;
    }
  }

  async clearCanvas(roomId) {
    try {
      const success = await DatabaseServices.clearCanvas(roomId);
      
      // Update cache
      const room = this.cache.get(roomId);
      if (room && success) {
        room.canvasHistory = [];
        this.cache.set(roomId, room);
      }
      
      return room;
    } catch (error) {
      console.error('Error clearing canvas:', error);
      return null;
    }
  }

  async updateRoomCreator(roomId, newCreatorName) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Update creator in database
      const success = await DatabaseServices.updateRoomCreator(roomId, newCreatorName);
      
      if (success) {
        // Update cache
        room.creator = newCreatorName;
        
        // Update isCreator flag for all members
        room.members = room.members.map(member => ({
          ...member,
          isCreator: member.displayName === newCreatorName
        }));
        
        this.cache.set(roomId, room);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating room creator:', error);
      return false;
    }
  }

  async deleteRoom(roomId) {
    try {
      // Delete from database (cascade will handle related records)
      const supabase = require('./supabase');
      if (supabase && supabase.supabase) {
        const { error } = await supabase.supabase
          .from('rooms')
          .delete()
          .eq('id', roomId);

        if (error) throw error;
      }

      // Remove from cache
      this.cache.delete(roomId);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  }

  // New methods for database integration
  async updateNotes(roomId, content, editedBy) {
    try {
      const notes = await DatabaseServices.updateRoomNotes(roomId, content, editedBy);
      
      // Update cache
      const room = this.cache.get(roomId);
      if (room) {
        room.notes = content;
        this.cache.set(roomId, room);
      }
      
      return notes;
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  }

  async updatePDF(roomId, pdfUrl, fileName, uploadedBy) {
    try {
      const pdf = await DatabaseServices.updateRoomPDF(roomId, pdfUrl, fileName, uploadedBy);
      
      // Update cache
      const room = this.cache.get(roomId);
      if (room) {
        room.pdf = pdf;
        this.cache.set(roomId, room);
      }
      
      return pdf;
    } catch (error) {
      console.error('Error updating PDF:', error);
      throw error;
    }
  }
}

module.exports = new RoomManager();
