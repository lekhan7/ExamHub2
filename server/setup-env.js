const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Supabase environment configuration...');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('Please update it with your Supabase credentials:');
  console.log('');
  console.log('SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  console.log('PORT=3001');
} else {
  console.log('📝 Creating .env file template...');
  const envTemplate = `# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('⚠️  IMPORTANT: Please update the .env file with your actual Supabase credentials:');
  console.log('');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Find your Project URL and API keys under Settings > API');
  console.log('3. Replace the placeholder values in the .env file');
  console.log('');
  console.log('After updating the .env file, restart your server to use Supabase.');
}
