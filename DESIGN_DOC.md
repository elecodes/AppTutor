# Master Design Document: AppTutor (Tutor de Idiomas)

## 1. Project Overview

**AppTutor** is a comprehensive language learning application designed to help users learn Spanish through a variety of interactive methods. It combines traditional learning techniques (flashcards, quizzes) with advanced AI-powered features (conversation roleplay, dynamic dialogue generation, grammar analysis) to provide a holistic learning experience.

### Core Objectives
-   Provide structured lessons for different proficiency levels (Beginner, Intermediate, Advanced).
-   Enable realistic conversation practice using AI agents.
-   Offer instant feedback on grammar and pronunciation.
-   Track user progress and mastery of vocabulary.

## 2. Architecture & Technology Stack

The application follows a **Client-Server** architecture, leveraging modern web technologies and cloud services.

### 2.1 Frontend
-   **Framework**: React (v18) with Vite (v7).
-   **Language**: JavaScript (ES Modules).
-   **Styling**: TailwindCSS (v4).
-   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`).
-   **Routing**: Single Page Application (SPA) handled by React (conditional rendering in `App.jsx`).
-   **Build Tool**: Vite.

### 2.2 Backend
-   **Server**: Node.js with Express (v4).
-   **Security**: Helmet (CSP), CORS, Rate Limiting.
-   **API**: RESTful endpoints for AI and TTS services.
-   **Hosting**: Serves static frontend assets (`dist`) and API routes.

### 2.3 Database & Authentication
-   **Platform**: Firebase.
-   **Authentication**: Firebase Auth (Email/Password).
-   **Database**: Cloud Firestore (NoSQL) for user profiles, progress tracking, and learned phrases.
-   **Storage**: Cloudinary (for profile pictures and media).

### 2.4 AI & Machine Learning Services
-   **LLM Orchestration**: LangChain.
-   **AI Provider**: OpenAI (via LangChain) for conversation and grammar analysis.
-   **Text-to-Speech (TTS)**: Multi-provider support with fallback strategy:
    1.  **ElevenLabs** (Premium quality).
    2.  **Google Cloud TTS** (High quality).
    3.  **AWS Polly** (Standard quality).
    4.  **Web Speech API** (Browser fallback).

### 2.5 Testing & Quality
-   **Unit/Integration**: Vitest.
-   **E2E Testing**: Playwright.
-   **Accessibility**: Pa11y CI.
-   **Performance**: Lighthouse CI.
-   **Linting**: ESLint.

## 3. Features & Implementation Details

### 3.1 Study Mode
-   **Description**: Structured weekly lessons based on proficiency level.
-   **Implementation**:
    -   Lessons loaded from `src/utils/loadLessons.js`.
    -   Progressive unlocking system based on user progress (`UserService.getUnlockedWeeks`).
    -   Flashcard-style interface with audio pronunciation.

### 3.2 Conversation Mode (AI Roleplay)
-   **Description**: Interactive chat with an AI tutor.
-   **Implementation**:
    -   **Frontend**: `ConversationMode.jsx` handles UI and speech input.
    -   **Backend**: `/api/chat/start` and `/api/chat/message` endpoints.
    -   **Logic**: `ConversationService.js` manages session state and prompts OpenAI via LangChain.

### 3.3 Dialogue Mode
-   **Description**: View pre-written dialogues or generate new ones on specific topics.
-   **Implementation**:
    -   **Static**: Loaded from `src/lessons/dialogues.js`.
    -   **Dynamic**: `/api/generate-dialogue` endpoint uses `DialogueGenerator.js` to create custom scenarios.

### 3.4 Quiz Mode
-   **Description**: Multiple-choice tests to reinforce vocabulary.
-   **Implementation**:
    -   Dynamic option generation from current lesson vocabulary.
    -   Score tracking and history saved to Firestore (`UserService.recordSession`).

### 3.5 Grammar Analysis
-   **Description**: Analyze user text for grammatical correctness.
-   **Implementation**:
    -   **Backend**: `/api/grammar/analyze` endpoint.
    -   **Service**: `GrammarService.js` uses LLM to provide detailed feedback and corrections.

### 3.6 User Profile
-   **Description**: Manage account and view progress.
-   **Implementation**:
    -   `Profile.jsx` displays stats, level, and allows profile picture upload.
    -   Data persisted in Firestore `users` collection.

## 4. Data Models (Firestore)

### `users` Collection
Document ID: `uid`
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://...",
  "level": "beginner", // beginner, intermediate, advanced
  "createdAt": Timestamp,
  "lastLogin": Timestamp,
  "learnedPhrases": [
    { "text": "Hola", "translation": "Hello", "learnedAt": Timestamp }
  ],
  "progress": {
    "completedWeeks": 2,
    "totalPoints": 150
  }
}
```

### `study_sessions` Sub-collection (under `users/{uid}`)
```json
{
  "type": "quiz", // or conversation, dialogue
  "score": 8,
  "total": 10,
  "timestamp": Timestamp,
  "topic": "Week 1: Greetings"
}
```

## 5. API Endpoints

| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/start` | Start new AI chat | `topic`, `level`, `sessionId` |
| `POST` | `/api/chat/message` | Send message to AI | `message`, `sessionId`, `topic`, `level` |
| `POST` | `/api/grammar/analyze` | Analyze grammar | `text`, `context` |
| `POST` | `/api/generate-dialogue` | Generate dialogue | `topic`, `level` |
| `POST` | `/tts` | Generate speech | `text`, `language`, `options` |
| `GET` | `/tts/status` | Check TTS providers | - |

## 6. Security Measures

-   **Helmet**: Configures HTTP headers for security (CSP, HSTS, etc.).
-   **CORS**: Restricts cross-origin requests to allowed domains.
-   **Rate Limiting**: Prevents abuse (DoS protection) on API endpoints.
-   **Input Validation**: `zod` schemas used to validate API request bodies.
-   **Environment Variables**: Sensitive keys (API keys, DB config) stored in `.env` (not committed).

## 7. Directory Structure

```
/
├── .github/            # GitHub Actions workflows
├── firebase/           # Firebase configuration
├── src/
│   ├── components/     # React components
│   ├── config/         # Configuration (env, agents)
│   ├── hooks/          # Custom React hooks (useAuth, useTTS)
│   ├── lessons/        # Static lesson content
│   ├── pages/          # Main page components
│   ├── services/       # Frontend API services
│   ├── tests/          # Unit and integration tests
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── server.js           # Express backend server
└── package.json        # Dependencies and scripts
```
