const express = require('express');
const router = express.Router();
const jiraService = require('../services/jiraService');

// Middleware to check if Jira credentials are configured
const checkJiraConfig = (req, res, next) => {
  if (!process.env.JIRA_HOST || !process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
    return res.status(500).json({
      error: 'Jira configuration is missing. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN in your environment variables.'
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkJiraConfig);

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await jiraService.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific project
router.get('/projects/:projectKey', async (req, res) => {
  try {
    const project = await jiraService.getProject(req.params.projectKey);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issue types for a project
router.get('/projects/:projectId/issuetypes', async (req, res) => {
  try {
    const issueTypes = await jiraService.getIssueTypes(req.params.projectId);
    res.json(issueTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new issue/ticket
router.post('/issues', async (req, res) => {
  try {
    const issue = await jiraService.createIssue(req.body);
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search issues
router.get('/issues/search', async (req, res) => {
  try {
    const { jql, startAt = 0, maxResults = 50 } = req.query;
    if (!jql) {
      return res.status(400).json({ error: 'JQL query parameter is required' });
    }
    const results = await jiraService.searchIssues(jql, startAt, maxResults);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single issue
router.get('/issues/:issueKey', async (req, res) => {
  try {
    const issue = await jiraService.getIssue(req.params.issueKey);
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update issue
router.put('/issues/:issueKey', async (req, res) => {
  try {
    const result = await jiraService.updateIssue(req.params.issueKey, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to issue
router.post('/issues/:issueKey/comments', async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }
    const result = await jiraService.addComment(req.params.issueKey, comment);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issue transitions
router.get('/issues/:issueKey/transitions', async (req, res) => {
  try {
    const transitions = await jiraService.getTransitions(req.params.issueKey);
    res.json(transitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transition issue
router.post('/issues/:issueKey/transitions', async (req, res) => {
  try {
    const { transitionId } = req.body;
    if (!transitionId) {
      return res.status(400).json({ error: 'Transition ID is required' });
    }
    const result = await jiraService.transitionIssue(req.params.issueKey, transitionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get priorities
router.get('/priorities', async (req, res) => {
  try {
    const priorities = await jiraService.getPriorities();
    res.json(priorities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users
router.get('/users', async (req, res) => {
  try {
    const { query = '' } = req.query;
    const users = await jiraService.getUsers(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard statistics endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { projectKey } = req.query;
    if (!projectKey) {
      return res.status(400).json({ error: 'Project key is required' });
    }

    // Get various statistics
    const [openIssues, inProgressIssues, doneIssues, recentIssues] = await Promise.all([
      jiraService.searchIssues(`project = ${projectKey} AND status = "Open"`, 0, 100),
      jiraService.searchIssues(`project = ${projectKey} AND status = "In Progress"`, 0, 100),
      jiraService.searchIssues(`project = ${projectKey} AND status = "Done" AND updated >= -7d`, 0, 100),
      jiraService.searchIssues(`project = ${projectKey} ORDER BY created DESC`, 0, 10)
    ]);

    res.json({
      openCount: openIssues.total,
      inProgressCount: inProgressIssues.total,
      doneThisWeek: doneIssues.total,
      recentIssues: recentIssues.issues,
      totalIssues: openIssues.total + inProgressIssues.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 