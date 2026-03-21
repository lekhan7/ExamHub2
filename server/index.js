const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');

const roomManager = require('./roomManager');
const socketHandlers = require('./socketHandlers');
const DatabaseServices = require('./databaseServices');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for PDF uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('📁 Multer file filter received:');
    console.log('  - Originalname:', file.originalname);
    console.log('  - Mimetype:', file.mimetype);
    console.log('  - Fieldname:', file.fieldname);
    console.log('  - Size:', file.size || 'unknown yet');
    
    if (file.mimetype === 'application/pdf') {
      console.log('✅ PDF mimetype accepted');
      cb(null, true);
    } else {
      console.log('❌ Non-PDF mimetype rejected:', file.mimetype);
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
app.get('/api/rooms', async (req, res) => {
  try {
    const publicRooms = await roomManager.getPublicRooms();
    res.json(publicRooms);
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// PDF Upload Route
const { createClient } = require('@supabase/supabase-js');

app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📄 PDF upload request received');
    console.log('📁 File info:', {
      originalname: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    });
    console.log('📊 Room ID:', req.body.roomId);
    
    const { roomId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file' });
    }

    console.log('🔑 Supabase URL:', process.env.SUPABASE_URL);
    console.log('🔑 Using SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `pdfs/${roomId}/${fileName}`;

    console.log('📤 Uploading to path:', filePath);
    console.log('📤 File buffer size:', file.buffer?.length);

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file.buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return res.status(500).json({ success: false, error: uploadError.message });
    }

    console.log('✅ Upload successful, getting public URL');

    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('✅ PDF uploaded to Supabase:', publicUrl);

    return res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('Upload route error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socketHandlers(io, socket);
  


  

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Exam Hub server running on port ${PORT}`);
});
