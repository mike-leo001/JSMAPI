const axios = require('axios');

class JiraService {
  constructor() {
    this.initialized = false;
    this.configError = null;
    this.client = null;
  }

  // Initialize the service when first used
  initialize() {
    if (this.initialized) return;
    
    this.baseURL = process.env.JIRA_HOST;
    this.email = process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;
    
    // Validate configuration
    if (!this.baseURL || this.baseURL === 'https://your-domain.atlassian.net') {
      console.error('JIRA_HOST is not configured properly. Please update your .env file.');
      this.configError = 'JIRA_HOST is not configured. Please set your Jira domain in the .env file.';
    }
    if (!this.email || this.email === 'your-email@example.com') {
      console.error('JIRA_EMAIL is not configured properly. Please update your .env file.');
      this.configError = 'JIRA_EMAIL is not configured. Please set your email in the .env file.';
    }
    if (!this.apiToken || this.apiToken === 'your-jira-api-token') {
      console.error('JIRA_API_TOKEN is not configured properly. Please update your .env file.');
      this.configError = 'JIRA_API_TOKEN is not configured. Please set your API token in the .env file.';
    }
    
    // Only create client if configuration is valid
    if (!this.configError) {
      try {
        this.client = axios.create({
          baseURL: `${this.baseURL}/rest/api/3`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error creating Jira client:', error);
        this.configError = 'Invalid Jira configuration. Please check your .env file.';
      }
    }
    
    this.initialized = true;
  }

  // Check configuration before making requests
  checkConfig() {
    this.initialize(); // Ensure initialized
    if (this.configError) {
      throw new Error(this.configError);
    }
  }

  // Get all projects
  async getProjects() {
    try {
      this.checkConfig();
      const response = await this.client.get('/project');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get project details
  async getProject(projectKey) {
    try {
      this.checkConfig();
      const response = await this.client.get(`/project/${projectKey}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get issue types for a project
  async getIssueTypes(projectId) {
    try {
      this.checkConfig();
      const response = await this.client.get(`/project/${projectId}/statuses`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create a new issue/ticket
  async createIssue(issueData) {
    try {
      this.checkConfig();
      const payload = {
        fields: {
          project: {
            key: issueData.projectKey
          },
          summary: issueData.summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: issueData.description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: issueData.issueType || "Task"
          },
          priority: {
            name: issueData.priority || "Medium"
          }
        }
      };

      // Add custom fields if provided
      if (issueData.customFields) {
        Object.assign(payload.fields, issueData.customFields);
      }

      const response = await this.client.post('/issue', payload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get issues with JQL search
  async searchIssues(jql, startAt = 0, maxResults = 50) {
    try {
      this.checkConfig();
      const response = await this.client.get('/search', {
        params: {
          jql,
          startAt,
          maxResults,
          fields: 'summary,status,priority,issuetype,created,updated,assignee,reporter,description'
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get single issue
  async getIssue(issueKey) {
    try {
      this.checkConfig();
      const response = await this.client.get(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update issue
  async updateIssue(issueKey, updateData) {
    try {
      this.checkConfig();
      const payload = {
        fields: updateData
      };
      await this.client.put(`/issue/${issueKey}`, payload);
      return { success: true, message: 'Issue updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Add comment to issue
  async addComment(issueKey, comment) {
    try {
      this.checkConfig();
      const payload = {
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: comment
                }
              ]
            }
          ]
        }
      };
      const response = await this.client.post(`/issue/${issueKey}/comment`, payload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get issue transitions
  async getTransitions(issueKey) {
    try {
      this.checkConfig();
      const response = await this.client.get(`/issue/${issueKey}/transitions`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Transition issue (change status)
  async transitionIssue(issueKey, transitionId) {
    try {
      this.checkConfig();
      const payload = {
        transition: {
          id: transitionId
        }
      };
      await this.client.post(`/issue/${issueKey}/transitions`, payload);
      return { success: true, message: 'Issue transitioned successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get priorities
  async getPriorities() {
    try {
      this.checkConfig();
      const response = await this.client.get('/priority');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get users (for assignee selection)
  async getUsers(query = '') {
    try {
      this.checkConfig();
      const response = await this.client.get('/users/search', {
        params: {
          query,
          maxResults: 50
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.errorMessages 
        ? error.response.data.errorMessages.join(', ')
        : error.response.data.message || 'Unknown error occurred';
      
      throw new Error(`Jira API Error: ${errorMessage} (Status: ${error.response.status})`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from Jira API');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = new JiraService(); 