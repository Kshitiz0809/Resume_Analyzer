#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ResumeProcessor } from './services/resumeProcessor';
import { JobFetcher } from './services/jobFetcher';
import { z } from 'zod';

class ResumeMCPServer {
  private server: Server;
  private resumeProcessor: ResumeProcessor;
  private jobFetcher: JobFetcher;

  constructor() {
    this.server = new Server(
      {
        name: 'resume-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.resumeProcessor = new ResumeProcessor();
    this.jobFetcher = new JobFetcher();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'extract_resume_text',
            description: 'Extract text content from PDF or DOCX resume files',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the resume file (PDF or DOCX)',
                },
                fileBuffer: {
                  type: 'string',
                  description: 'Base64 encoded file buffer (alternative to filePath)',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'fetch_job_postings',
            description: 'Fetch job postings from various sources',
            inputSchema: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                  enum: ['linkedin', 'indeed', 'csv', 'mock'],
                  description: 'Source to fetch job postings from',
                },
                query: {
                  type: 'string',
                  description: 'Job search query (keywords, location, etc.)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of jobs to fetch',
                  default: 10,
                },
              },
              required: ['source'],
            },
          },
          {
            name: 'get_skills_dataset',
            description: 'Get skills and job requirements dataset',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Skill category to filter by (optional)',
                },
                level: {
                  type: 'string',
                  enum: ['entry', 'intermediate', 'senior'],
                  description: 'Experience level to filter by (optional)',
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'extract_resume_text':
            const extractArgs = z.object({
              filePath: z.string().optional(),
              fileBuffer: z.string().optional(),
            }).parse(args);
            
            const extractedText = await this.resumeProcessor.extractText(extractArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    text: extractedText,
                  }),
                },
              ],
            };

          case 'fetch_job_postings':
            const jobArgs = z.object({
              source: z.enum(['linkedin', 'indeed', 'csv', 'mock']),
              query: z.string().optional(),
              limit: z.number().default(10),
            }).parse(args);
            
            const jobs = await this.jobFetcher.fetchJobs(jobArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    jobs,
                  }),
                },
              ],
            };

          case 'get_skills_dataset':
            const skillsArgs = z.object({
              category: z.string().optional(),
              level: z.enum(['entry', 'intermediate', 'senior']).optional(),
            }).parse(args);
            
            const skills = await this.getSkillsDataset(skillsArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    skills,
                  }),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            },
          ],
        };
      }
    });
  }

  private async getSkillsDataset(args: { category?: string; level?: string }) {
    // Mock skills dataset - in production, this would come from a real dataset
    const skills = [
      { name: 'JavaScript', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'React', category: 'Frontend', level: 'intermediate', demand: 'high' },
      { name: 'Node.js', category: 'Backend', level: 'intermediate', demand: 'high' },
      { name: 'Python', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'SQL', category: 'Database', level: 'entry', demand: 'high' },
      { name: 'MongoDB', category: 'Database', level: 'intermediate', demand: 'medium' },
      { name: 'Docker', category: 'DevOps', level: 'intermediate', demand: 'high' },
      { name: 'AWS', category: 'Cloud', level: 'intermediate', demand: 'high' },
    ];

    let filteredSkills = skills;

    if (args.category) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.category.toLowerCase().includes(args.category!.toLowerCase())
      );
    }

    if (args.level) {
      filteredSkills = filteredSkills.filter(skill => skill.level === args.level);
    }

    return filteredSkills;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Resume MCP server running on stdio');
  }
}

const server = new ResumeMCPServer();
server.run().catch(console.error);
