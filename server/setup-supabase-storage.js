// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🔧 Setting up Supabase Storage...\n');

  try {
    // Check if bucket exists
    console.log('📋 Checking if "pdfs" bucket exists...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const pdfsBucket = buckets.find(bucket => bucket.name === 'pdfs');
    
    if (pdfsBucket) {
      console.log('✅ "pdfs" bucket already exists');
    } else {
      console.log('📦 Creating "pdfs" bucket...');
      const { data, error } = await supabaseAdmin.storage.createBucket('pdfs', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('❌ Error creating bucket:', error.message);
        console.log('\n📝 Manual Setup Required:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Storage');
        console.log('3. Click "New bucket"');
        console.log('4. Name it "pdfs"');
        console.log('5. Set it as public');
        console.log('6. Allow PDF file types');
        return;
      }

      console.log('✅ "pdfs" bucket created successfully');
    }

    // Set up bucket policies
    console.log('\n🔒 Setting up bucket policies...');
    
    // Public read policy
    const { error: policyError } = await supabaseAdmin.storage.from('pdfs').createPolicy(
      'Public Access',
      {
        roles: ['anon', 'authenticated'],
        permissions: {
          read: true,
          write: false
        }
      }
    );

    if (policyError) {
      console.log('⚠️  Policy setup may need manual configuration in dashboard');
    } else {
      console.log('✅ Bucket policies configured');
    }

    console.log('\n🎉 Supabase Storage setup complete!');
    console.log('📄 PDF uploads should now work correctly.');

  } catch (error) {
    console.error('❌ Storage setup error:', error.message);
    console.log('\n📝 Manual Setup Required:');
    console.log('1. Go to your Supabase dashboard > Storage');
    console.log('2. Create a bucket named "pdfs"');
    console.log('3. Set it as public');
    console.log('4. Configure access policies if needed');
  }
}

setupStorage();
