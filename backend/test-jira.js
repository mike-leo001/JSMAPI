require('dotenv').config();
const axios = require('axios');

async function testJiraConnection() {
  const baseURL = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  console.log('Testing Jira API connection...\n');

  try {
    const client = axios.create({
      baseURL: `${baseURL}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Get myself (user info)
    console.log('1. Testing authentication...');
    try {
      const myselfResponse = await client.get('/myself');
      console.log('✅ Authentication successful!');
      console.log(`   Logged in as: ${myselfResponse.data.displayName} (${myselfResponse.data.emailAddress})`);
    } catch (error) {
      console.log('❌ Authentication failed!');
      console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.status === 401) {
        console.log('   Check your email and API token');
      }
      return;
    }

    // Test 2: Get projects
    console.log('\n2. Fetching projects...');
    try {
      const projectsResponse = await client.get('/project');
      console.log(`✅ Found ${projectsResponse.data.length} projects:`);
      projectsResponse.data.slice(0, 5).forEach(project => {
        console.log(`   - ${project.key}: ${project.name}`);
      });
      if (projectsResponse.data.length > 5) {
        console.log(`   ... and ${projectsResponse.data.length - 5} more`);
      }
    } catch (error) {
      console.log('❌ Failed to fetch projects!');
      console.log(`   Error: ${error.response?.status} - ${error.message}`);
    }

    // Test 3: Get priorities
    console.log('\n3. Fetching priorities...');
    try {
      const prioritiesResponse = await client.get('/priority');
      console.log(`✅ Found ${prioritiesResponse.data.length} priorities:`);
      prioritiesResponse.data.forEach(priority => {
        console.log(`   - ${priority.name}`);
      });
    } catch (error) {
      console.log('❌ Failed to fetch priorities!');
      console.log(`   Error: ${error.response?.status} - ${error.message}`);
    }

  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`   Error: ${error.message}`);
    if (error.code === 'ENOTFOUND') {
      console.log('   The Jira host URL might be incorrect');
    }
  }
}

testJiraConnection(); 