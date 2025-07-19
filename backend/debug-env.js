console.log('=== Environment Debug ===');
console.log('Before dotenv:', {
  JIRA_HOST: process.env.JIRA_HOST,
  JIRA_EMAIL: process.env.JIRA_EMAIL,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN ? 'SET' : 'NOT SET'
});

require('dotenv').config();

console.log('\nAfter dotenv:', {
  JIRA_HOST: process.env.JIRA_HOST,
  JIRA_EMAIL: process.env.JIRA_EMAIL,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN ? 'SET' : 'NOT SET'
});

// Now test loading jiraService
console.log('\n=== Loading JiraService ===');
const jiraService = require('./services/jiraService');
console.log('JiraService loaded'); 