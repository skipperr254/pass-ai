# PassAI Development Plan

## Phase 1: Foundation & Setup (Steps 1-3)

### Step 1: Project Setup & Configuration

- [ ] Configure Supabase project (create account, get API keys)
- [ ] Set up environment variables (.env file)
- [ ] Configure Supabase client in React
- [ ] Set up basic folder structure and TypeScript types
- [ ] Install necessary dependencies (Supabase client, OpenAI SDK, etc.)

### Step 2: Authentication System

- [ ] Create Supabase authentication tables (if needed)
- [ ] Build Login page with email/password
- [ ] Build Sign Up page with email/password
- [ ] Implement email confirmation flow
- [ ] Create protected route wrapper component
- [ ] Build basic navigation/header with logout

### Step 3: Database Schema Design

- [ ] Design and create Supabase tables:
  - `profiles` - User profiles
  - `subjects` - User subjects/courses
  - `materials` - Uploaded study materials
  - `quizzes` - Generated quizzes
  - `quiz_attempts` - Quiz results and scores
  - `study_plans` - AI-generated study plans
  - `progress_tracking` - User progress data
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create necessary indexes for performance

## Phase 2: Core Features (Steps 4-8)

### Step 4: Dashboard & Subject Management

- [ ] Create main dashboard layout
- [ ] Build subject card component with progress circle
- [ ] Implement "Create Subject" modal/form
- [ ] Add subject test date functionality
- [ ] Display subject list from database
- [ ] Subject selection and routing

### Step 5: File Upload System

- [ ] Create upload page UI
- [ ] Implement file upload to Supabase Storage
- [ ] Add support for multiple file types (PDF, DOCX, PPTX, images)
- [ ] Build file preview component
- [ ] Show upload progress and status
- [ ] Store file metadata in database

### Step 6: OpenAI Integration & Content Analysis

- [ ] Set up OpenAI API configuration
- [ ] Create Supabase Edge Function for content analysis
- [ ] Extract text from different file formats:
  - PDF text extraction
  - DOCX text extraction
  - PPTX text extraction
  - Image OCR using Tesseract.js
- [ ] Send extracted text to OpenAI for analysis
- [ ] Store analyzed content (key concepts, summaries)
- [ ] Display analysis results to user

### Step 7: AI Quiz Generation

- [ ] Create quiz generation page/interface
- [ ] Build quiz configuration UI (difficulty, question count, type)
- [ ] Create Supabase Edge Function for quiz generation
- [ ] Use OpenAI to generate questions from analyzed content
- [ ] Store generated quizzes in database
- [ ] Display quiz to user

### Step 8: Quiz Taking & Results

- [ ] Build quiz interface component
- [ ] Implement different question types (multiple choice, true/false)
- [ ] Add quiz timer (optional)
- [ ] Calculate and display quiz results
- [ ] Store quiz attempts and scores
- [ ] Show correct/incorrect answers with explanations

## Phase 3: Advanced Features (Steps 9-12)

### Step 9: Progress Tracking System

- [ ] Create progress calculation logic
- [ ] Build progress visualization components
- [ ] Track metrics:
  - Quiz scores over time
  - Material coverage
  - Study time
  - Subject-specific progress
- [ ] Display progress on dashboard and subject pages

### Step 10: AI Study Plan Generation

- [ ] Create study plan page
- [ ] Build Supabase Edge Function for plan generation
- [ ] Use OpenAI to generate personalized study schedules
- [ ] Consider test dates and current progress
- [ ] Store and display study plans
- [ ] Allow plan updates and adjustments

### Step 11: Pass Chance Prediction

- [ ] Implement Bayesian prediction algorithm
- [ ] Calculate pass probability based on:
  - Quiz performance
  - Progress completion
  - Time until test
  - Material coverage
- [ ] Display pass chance on dashboard
- [ ] Update predictions dynamically

### Step 12: Storage Management

- [ ] Implement storage quota system
- [ ] Display storage usage
- [ ] Add file deletion functionality
- [ ] Implement storage limits per user
- [ ] Show storage warnings

## Phase 4: Polish & Optimization (Steps 13-15)

### Step 13: UI/UX Enhancement

- [ ] Refine all page designs
- [ ] Add loading states and skeletons
- [ ] Implement error handling and user feedback
- [ ] Add animations and transitions
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

### Step 14: Performance Optimization

- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Lazy loading for components
- [ ] Image optimization
- [ ] Code splitting

### Step 15: Testing & Deployment

- [ ] Test all user flows
- [ ] Fix bugs and edge cases
- [ ] Set up production Supabase project
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Configure production environment variables
- [ ] Final testing in production

## Key Dependencies to Install

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install openai
npm install tesseract.js

# File processing
npm install pdfjs-dist
npm install mammoth  # for DOCX
npm install jszip    # for PPTX

# UI components (if not already installed)
npm install lucide-react
npm install recharts  # for charts/graphs

# Utilities
npm install date-fns
npm install clsx
```

## Environment Variables Needed

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Notes

- We'll build each step incrementally
- Test each feature before moving to the next
- Focus on getting core functionality working before polish
- We can adjust the plan as needed based on challenges or new requirements
- OpenAI API calls will be made from Supabase Edge Functions for security (never expose API key in frontend)

## Current Status

**Starting Point:** Step 1 - Project Setup & Configuration

**Next Step:** Configure Supabase and set up the development environment
