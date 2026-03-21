const { v4: uuidv4 } = require('uuid');
const supabaseConfig = require('./supabase');

// Check if Supabase is available
const isSupabaseConfigured = supabaseConfig !== null;
const supabase = isSupabaseConfigured ? supabaseConfig.supabase : null;
const supabaseAdmin = isSupabaseConfigured ? supabaseConfig.supabaseAdmin : null;

// Log Supabase status
if (isSupabaseConfigured) {
  console.log('📊 DatabaseServices: Supabase integration enabled');
} else {
  console.log('💾 DatabaseServices: Using in-memory fallback storage');
}

class DatabaseServices {
  // Fallback in-memory storage when Supabase is not configured
  static fallbackStorage = {
    users: new Map(),
    rooms: new Map(),
    roomMembers: new Map(),
    notes: new Map(),
    canvasStrokes: new Map(),
    messages: new Map(),
    pdfFiles: new Map()
  };
  // User operations
  static async createOrUpdateUser(displayName, socketId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const existingUser = this.fallbackStorage.users.get(displayName);
      const user = existingUser || {
        id: uuidv4(),
        display_name: displayName,
        socket_id: socketId,
        created_at: new Date().toISOString()
      };
      user.socket_id = socketId;
      user.last_seen = new Date().toISOString();
      this.fallbackStorage.users.set(displayName, user);
      return user;
    }

    try {
      // First try to find user by display name
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('display_name', displayName)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        // Update socket_id and last_seen
        const { data, error } = await supabase
          .from('users')
          .update({ 
            socket_id: socketId,
            last_seen: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            display_name: displayName,
            socket_id: socketId
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Room operations
  static async createRoom(roomName, examTag, isPublic, creatorName) {
    if (!isSupabaseConfigured) {
      console.log('🏠 Creating room in memory:', roomName);
      // Fallback to in-memory storage
      const creator = await this.createOrUpdateUser(creatorName, null);
      const roomCode = isPublic ? null : this.generateRoomCode(); // Only generate room code for private rooms
      
      const room = {
        id: uuidv4(),
        name: roomName,
        exam_tag: examTag,
        is_public: isPublic,
        isPublic: isPublic, // Add camelCase version for server
        room_code: roomCode || null, // Ensure null for public rooms
        roomCode: roomCode || null, // Ensure null for public rooms
        creator_id: creator.id,
        creator: creatorName,
        created_at: new Date().toISOString(),
        members: [{ 
          socketId: creator.socket_id,
          displayName: creatorName,
          isCreator: true,
          joinedAt: new Date()
        }],
        notes: '',
        canvasHistory: [],
        pdf: null,
        messages: []
      };
      
      this.fallbackStorage.rooms.set(room.id, room);
      return room;
    }

    try {
      console.log('🏠 Creating room in Supabase:', roomName);
      // Create or get creator user
      const creator = await this.createOrUpdateUser(creatorName, null);

      // Create room
      const roomCode = isPublic ? null : this.generateRoomCode(); // Only generate room code for private rooms
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomName,
          exam_tag: examTag,
          is_public: isPublic,
          room_code: roomCode,
          creator_id: creator.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      console.log('✅ Room created in Supabase:', room.id);
      // Add creator as room member
      await this.addMemberToRoom(room.id, creator.id, true);

      return {
        ...room,
        roomCode: room.room_code, // Add camelCase version for frontend
        isPublic: room.is_public, // Add camelCase version for server
        creator: creator.display_name,
        members: [{ 
          socketId: creator.socket_id,
          displayName: creatorName,
          isCreator: true,
          joinedAt: new Date()
        }],
        notes: '',
        canvasHistory: [],
        pdf: null,
        messages: []
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  static async getRoom(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return this.fallbackStorage.rooms.get(roomId) || null;
    }

    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select(`
          *,
          creator:users(display_name),
          members:room_members(
            user:users(display_name, socket_id),
            is_creator,
            joined_at
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;

      // Get additional room data
      const [notes, pdfFiles, canvasStrokes, messages] = await Promise.all([
        this.getRoomNotes(roomId),
        this.getRoomPDF(roomId),
        this.getRoomCanvasHistory(roomId),
        this.getRoomMessages(roomId)
      ]);

      return {
        ...room,
        roomCode: room.room_code, // Add camelCase version for frontend
        isPublic: room.is_public, // Add camelCase version for server
        creator: room.creator.display_name,
        members: room.members.map(member => ({
          socketId: member.user.socket_id,
          displayName: member.user.display_name,
          isCreator: member.is_creator,
          joinedAt: member.joined_at
        })),
        notes: notes?.content || '',
        pdf: pdfFiles,
        canvasHistory: canvasStrokes,
        messages: messages
      };
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  static async getPublicRooms() {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return Array.from(this.fallbackStorage.rooms.values())
        .filter(room => room.is_public)
        .map(room => ({
          id: room.id,
          name: room.name,
          examTag: room.exam_tag,
          creator: room.creator,
          is_public: room.is_public,
          isPublic: room.isPublic, // Add camelCase version
          roomCode: room.roomCode || null, // Ensure roomCode is included
          memberCount: room.members.length,
          createdAt: room.created_at
        }));
    }

    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          exam_tag,
          creator:users(display_name),
          members:room_members(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return rooms.map(room => ({
        id: room.id,
        name: room.name,
        examTag: room.exam_tag,
        creator: room.creator.display_name,
        is_public: room.is_public,
        isPublic: room.is_public, // Add camelCase version for frontend
        roomCode: room.room_code || null, // Include roomCode for frontend
        memberCount: room.members.length,
        createdAt: room.created_at
      }));
    } catch (error) {
      console.error('Error getting public rooms:', error);
      return [];
    }
  }

  static async addMemberToRoom(roomId, userId, isCreator = false, socketId = null) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      const user = this.fallbackStorage.users.get(userId) || 
                   Array.from(this.fallbackStorage.users.values()).find(u => u.id === userId);
      
      if (!room || !user) return null;
      
      // Check for existing member by display name (to handle refresh/reconnect)
      const existingMemberIndex = room.members.findIndex(m => m.displayName === user.display_name);
      
      const member = {
        socketId: socketId || user.socket_id,
        displayName: user.display_name,
        isCreator: isCreator,
        joinedAt: new Date()
      };
      
      if (existingMemberIndex !== -1) {
        // Update existing member (reconnect/refresh case)
        room.members[existingMemberIndex] = member;
        console.log('🔄 Updated existing member in room (in-memory):', member.displayName);
      } else {
        // Add new member
        room.members.push(member);
        console.log('➕ Added new member to room (in-memory):', member.displayName);
      }
      
      return member;
    }

    try {
      // Check if member already exists in this room
      const { data: existingMember, error: checkError } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      
      if (existingMember) {
        // Member exists - this is a reconnect/refresh
        // Update socket_id in users table
        if (socketId) {
          await supabase
            .from('users')
            .update({ socket_id: socketId, last_seen: new Date().toISOString() })
            .eq('id', userId);
        }
        
        // Get updated user data
        const { data: userData } = await supabase
          .from('users')
          .select('display_name, socket_id')
          .eq('id', userId)
          .single();
        
        result = {
          socketId: userData.socket_id,
          displayName: userData.display_name,
          isCreator: existingMember.is_creator,
          joinedAt: existingMember.joined_at
        };
        console.log('🔄 Reconnected existing member:', result.displayName);
      } else {
        // New member - insert
        const { data, error } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: userId,
            is_creator: isCreator
          })
          .select(`
            user:users(display_name, socket_id),
            is_creator,
            joined_at
          `)
          .single();

        if (error) throw error;

        result = {
          socketId: data.user.socket_id,
          displayName: data.user.display_name,
          isCreator: data.is_creator,
          joinedAt: data.joined_at
        };
        console.log('➕ Added new member to room:', result.displayName);
      }

      return result;
    } catch (error) {
      console.error('Error adding member to room:', error);
      throw error;
    }
  }

  static async removeMemberFromRoom(roomId, socketId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return null;
      
      const memberIndex = room.members.findIndex(m => m.socketId === socketId);
      if (memberIndex !== -1) {
        const removedMember = room.members.splice(memberIndex, 1)[0];
        return removedMember;
      }
      return null;
    }

    try {
      // Find user by socket_id
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('socket_id', socketId)
        .single();

      if (userError) throw userError;

      // Remove from room_members
      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        socketId: socketId,
        displayName: user.display_name
      };
    } catch (error) {
      console.error('Error removing member from room:', error);
      return null;
    }
  }

  static async updateRoomCreator(roomId, newCreatorName) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return false;
      
      // Update room creator
      room.creator = newCreatorName;
      
      // Update isCreator flag for all members
      room.members = room.members.map(member => ({
        ...member,
        isCreator: member.displayName === newCreatorName
      }));
      
      return true;
    }

    try {
      // Get user ID for new creator
      const { data: newCreatorUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('display_name', newCreatorName)
        .single();

      if (userError) throw userError;

      // Update room creator
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ creator: newCreatorName })
        .eq('id', roomId);

      if (roomError) throw roomError;

      // Update room_members table - set old creator is_creator to false, new creator to true
      await supabase
        .from('room_members')
        .update({ is_creator: false })
        .eq('room_id', roomId);

      await supabase
        .from('room_members')
        .update({ is_creator: true })
        .eq('room_id', roomId)
        .eq('user_id', newCreatorUser.id);

      return true;
    } catch (error) {
      console.error('Error updating room creator:', error);
      return false;
    }
  }

  // Notes operations
  static async getRoomNotes(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      return room ? { content: room.notes || '' } : null;
    }
    
    try {
      const { data, error } = await supabase
        .from('shared_notes')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting room notes:', error);
      return null;
    }
  }

  static async updateRoomNotes(roomId, content, editedBy) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return null;
      
      room.notes = content;
      return { content: content };
    }

    try {
      const { data, error } = await supabase
        .from('shared_notes')
        .upsert({
          room_id: roomId,
          content: content,
          last_edited_by: editedBy,
          last_edited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating room notes:', error);
      throw error;
    }
  }

  // Canvas operations
  static async getRoomCanvasHistory(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      return room ? room.canvasHistory || [] : [];
    }
    
    try {
      const { data, error } = await supabase
        .from('canvas_strokes')
        .select('stroke_data, created_by, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data.map(stroke => stroke.stroke_data);
    } catch (error) {
      console.error('Error getting canvas history:', error);
      return [];
    }
  }

  static async addCanvasStroke(roomId, strokeData, createdBy) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return null;
      
      if (!room.canvasHistory) room.canvasHistory = [];
      room.canvasHistory.push(strokeData);
      return strokeData;
    }

    try {
      const { data, error } = await supabase
        .from('canvas_strokes')
        .insert({
          room_id: roomId,
          stroke_data: strokeData,
          created_by: createdBy
        })
        .select('stroke_data')
        .single();

      if (error) throw error;
      return data.stroke_data;
    } catch (error) {
      console.error('Error adding canvas stroke:', error);
      throw error;
    }
  }

  static async clearCanvas(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return false;
      
      room.canvasHistory = [];
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('canvas_strokes')
        .delete()
        .eq('room_id', roomId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing canvas:', error);
      return false;
    }
  }

  // Message operations
  static async getRoomMessages(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      return room ? room.messages || [] : [];
    }
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          message,
          timestamp,
          user:users(display_name)
        `)
        .eq('room_id', roomId)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data.map(msg => ({
        displayName: msg.user.display_name,
        message: msg.message,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('Error getting room messages:', error);
      return [];
    }
  }

  static async addMessage(roomId, userId, message, timestamp) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      const user = Array.from(this.fallbackStorage.users.values()).find(u => u.id === userId);
      
      if (!room || !user) return null;
      
      const messageObj = {
        displayName: user.display_name,
        message: message,
        timestamp: timestamp
      };
      
      if (!room.messages) room.messages = [];
      room.messages.push(messageObj);
      
      return messageObj;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          message: message,
          timestamp: timestamp
        })
        .select(`
          message,
          timestamp,
          user:users(display_name)
        `)
        .single();

      if (error) throw error;

      return {
        displayName: data.user.display_name,
        message: data.message,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // PDF operations (metadata only)
  static async getRoomPDF(roomId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      return room ? room.pdf : null;
    }
    
    try {
      const { data, error } = await supabase
        .from('pdf_files')
        .select('*')
        .eq('room_id', roomId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      // Get additional user data for display name
      let uploadedBy = data.uploaded_by;
      if (data.uploaded_by) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', data.uploaded_by)
            .single();
          uploadedBy = userData?.display_name || data.uploaded_by;
        } catch (userError) {
          console.warn('Could not fetch user display name:', userError);
        }
      }

      return data ? {
        data: data.storage_path,
        name: data.original_name,  // Changed from fileName to name
        uploadedBy: uploadedBy
      } : null;
    } catch (error) {
      console.error('Error getting room PDF:', error);
      return null;
    }
  }

  static async updateRoomPDF(roomId, pdfUrl, fileName, uploadedBy) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return null;
      
      const pdf = {
        data: pdfUrl, // Store URL directly
        name: fileName,
        uploadedBy: uploadedBy
      };
      
      room.pdf = pdf;
      console.log('✅ PDF URL stored in memory:', fileName);
      return pdf;
    }

    try {
      console.log('📄 Storing PDF URL in database:', fileName);
      console.log('📊 PDF URL:', pdfUrl);
      
      // Store PDF metadata in database (URL is already uploaded to Supabase Storage)
      const { data, error } = await supabase
        .from('pdf_files')
        .insert({
          room_id: roomId,
          filename: fileName,
          original_name: fileName,
          storage_path: pdfUrl, // Store the URL directly
          uploaded_by: uploadedBy,
          file_size: 0 // We don't have file size at this point
        })
        .select()
        .single();

      if (error) throw error;
      
      // Get user display name for frontend
      const { data: userData } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', data.uploaded_by)
        .single();
      
      return {
        data: data.storage_path, // This is the URL
        name: data.original_name,
        uploadedBy: userData?.display_name || data.uploaded_by,
        fileSize: data.file_size
      };
    } catch (error) {
      console.error('Error updating room PDF:', error);
      throw error;
    }
  }

  // Utility functions
  static generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  // Member-specific data operations
  static async updateMemberData(roomId, userId, memberData) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const room = this.fallbackStorage.rooms.get(roomId);
      if (!room) return null;
      
      if (!room.memberData) {
        room.memberData = {};
      }
      
      room.memberData[userId] = memberData;
      return memberData;
    }

    try {
      // For Supabase, you would typically have a separate table for member-specific data
      // For now, we'll store it as JSON in a hypothetical member_data table
      const { data, error } = await supabase
        .from('member_data')
        .upsert({
          room_id: roomId,
          user_id: userId,
          data: memberData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating member data:', error);
      throw error;
    }
  }
}

module.exports = DatabaseServices;
