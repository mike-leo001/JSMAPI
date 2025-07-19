# Jira Ticket Intake Dashboard

A modern, full-featured ticket intake dashboard that connects to your Jira board using the JIRA API. This application provides a beautiful interface for creating, viewing, and managing Jira tickets.

## Features

- 🎯 **Dashboard Overview**: Real-time statistics and recent issues
- 📝 **Create Tickets**: User-friendly form for creating new Jira issues
- 📋 **View All Tickets**: Searchable, filterable table of all issues
- 🔐 **Secure API Integration**: Backend proxy for secure Jira API access
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Material-UI for a beautiful interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Jira account with API access
- Jira API token

## Project Structure

```
JSMAPI/
├── backend/          # Node.js/Express backend
│   ├── server.js     # Main server file
│   ├── routes/       # API routes
│   └── services/     # Business logic
└── frontend/         # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API services
    │   └── types/        # TypeScript types
    └── public/
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (copy from `env.example`):

```
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Getting Your Jira API Token

1. Log in to your Atlassian account
2. Go to [API tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click "Create API token"
4. Give it a name and copy the token
5. Add the token to your `.env` file

## Usage

1. **Select a Project**: Use the dropdown in the header to select a Jira project
2. **View Dashboard**: See statistics and recent issues
3. **Create Tickets**: Go to the "Create Ticket" tab to submit new issues
4. **View All Tickets**: Browse, search, and filter all project issues

## API Endpoints

The backend provides the following endpoints:

- `GET /api/health` - Health check
- `GET /api/jira/projects` - Get all projects
- `POST /api/jira/issues` - Create a new issue
- `GET /api/jira/issues/search` - Search issues
- `GET /api/jira/dashboard/stats` - Get dashboard statistics

## Security

- API credentials are stored securely in environment variables
- All Jira API calls are proxied through the backend
- Rate limiting is implemented to prevent abuse
- CORS is configured for the frontend URL only

## Troubleshooting

### Backend won't start
- Check that all environment variables are set correctly
- Verify your Jira API token is valid
- Ensure port 5000 is not in use

### Can't see projects
- Verify your Jira email and API token are correct
- Check that your account has access to the Jira instance
- Look for error messages in the browser console

### Issues not loading
- Check the browser console for errors
- Verify the project key is correct
- Ensure your Jira account has permission to view issues

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT 