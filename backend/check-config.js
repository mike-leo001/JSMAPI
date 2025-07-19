require('dotenv').config();

console.log('=== Jira Configuration Check ===\n');

// Check JIRA_HOST
if (!process.env.JIRA_HOST) {
  console.log('❌ JIRA_HOST is not set');
} else if (process.env.JIRA_HOST === 'https://your-domain.atlassian.net') {
  console.log('❌ JIRA_HOST is still set to the example value');
  console.log('   Please update it to your actual Jira domain');
} else {
  console.log('✅ JIRA_HOST is set to:', process.env.JIRA_HOST);
}

// Check JIRA_EMAIL
if (!process.env.JIRA_EMAIL) {
  console.log('❌ JIRA_EMAIL is not set');
} else if (process.env.JIRA_EMAIL === 'your-email@example.com') {
  console.log('❌ JIRA_EMAIL is still set to the example value');
  console.log('   Please update it to your actual email');
} else {
  console.log('✅ JIRA_EMAIL is set to:', process.env.JIRA_EMAIL);
}

// Check JIRA_API_TOKEN
if (!process.env.JIRA_API_TOKEN) {
  console.log('❌ JIRA_API_TOKEN is not set');
} else if (process.env.JIRA_API_TOKEN === 'your-jira-api-token') {
  console.log('❌ JIRA_API_TOKEN is still set to the example value');
  console.log('   Please update it to your actual API token');
} else {
  console.log('✅ JIRA_API_TOKEN is set (hidden for security)');
}

console.log('\n=== Instructions ===');
console.log('1. Edit the .env file in the backend directory');
console.log('2. Replace all example values with your actual Jira credentials');
console.log('3. Save the file and restart the backend server');
console.log('\nExample .env content:');
console.log('JIRA_HOST=https://mycompany.atlassian.net');
console.log('JIRA_EMAIL=john.doe@mycompany.com');
console.log('JIRA_API_TOKEN=ATATT3xFfGF0...(your actual token)'); 