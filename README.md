# AI-Powered Resume Uploader

An intelligent resume analysis and job matching platform that helps users optimize their resumes and find suitable job opportunities.

## 🚀 Features

- **Resume Upload & Analysis**: Upload PDF/DOCX resumes and extract text content
- **AI-Powered Job Matching**: Analyze resume against job postings with fit scores
- **Experience Level Classification**: Automatically categorize candidates (Fresher/Intermediate/Professional)
- **Skill Gap Analysis**: Identify missing skills and provide improvement recommendations
- **Job Recommendations**: Suggest jobs where resume is most likely to succeed

## 🏗️ Architecture

### Core Components

1. **MCP Server** (`/mcp-server`)
   - Document text extraction (PDF/DOCX)
   - Job posting data fetching (APIs/CSV)
   - Skills dataset integration

2. **Backend** (`/backend`)
   - Node.js/Express API server
   - Gemini API integration for AI analysis
   - MongoDB data management
   - Resume analysis and job matching logic

3. **Frontend** (`/frontend`)
   - React application
   - Resume upload interface
   - Job matches with AI Fit Score percentages
   - Experience level badges
   - Skill gap visualization

4. **Database**
   - MongoDB for storing resumes, job postings, and user data
   - Tracking user improvements over time

## 🛠️ Technology Stack

- **AI/ML**: Google Gemini API (free tier)
- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Database**: MongoDB
- **Protocol**: Model Context Protocol (MCP)
- **Document Processing**: PDF/DOCX parsing libraries

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Gemini API key (free from Google AI Studio)

### Installation

1. Clone the repository and install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both `backend` and `mcp-server` directories
   - Add your Gemini API key and MongoDB connection string

3. Start all services:
```bash
npm run dev
```

This will start:
- MCP Server on port 3001
- Backend API on port 3000
- Frontend on port 3002

## 🔧 Development

- **MCP Server**: Handles document processing and external data fetching
- **Backend**: API endpoints and AI analysis
- **Frontend**: User interface and experience
- **Shared**: Common types and utilities

## 📈 Workflow

1. User uploads resume (PDF/DOCX)
2. MCP Server extracts text and fetches job data
3. Backend calls Gemini API to analyze resume vs jobs
4. AI classifies experience level and suggests matches
5. Frontend displays results with fit scores and skill gaps
6. User can track improvements over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
