# AppTutor Master Design Document

## 1. Overview

AppTutor is an interactive web application designed to help students learn Spanish. It provides a comprehensive learning experience through structured lessons, pronunciation practice, AI-powered conversational role-playing, and grammar analysis. The platform is designed to be dynamic, secure, and scalable, leveraging a modern technology stack.

## 2. System Architecture

The application follows a client-server architecture, with a React single-page application (SPA) for the frontend and a Node.js/Express server for the backend. In production, the system is containerized using Docker and fronted by an Nginx reverse proxy for SSL termination and serving static assets.

```
+----------------+      +------------------+      +-------------------+
|   User's       |      |  Nginx           |      |  Node.js/Express  |
|   Browser      <----->|  Reverse Proxy   <----->|  Backend Server   |
+----------------+      |  (SSL)           |      +-------------------+
       |                +------------------+             |
       |                                                 |
       |                               +-----------------v-+
       |                               | External Services |
       |                               | (Firebase, AI APIs)|
       +------------------------------>+-------------------+
```

## 3. Frontend (Client-side)

The frontend is a modern React application built with Vite for a fast development experience.

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, with some plain CSS (`App.css`, `index.css`)
*   **Key Components:**
    *   `App.jsx`: The root component of the application, responsible for routing and layout.
    *   `ConversationMode.jsx`: A component for the AI tutor conversational interface.
    *   `DialogueGenerator.jsx`: Generates dialogues for practice.
    *   `DialogueViewer.jsx`: Displays dialogues.
    *   `Flashcard.jsx`: A component for interactive flashcards.
    *   `GrammarReport.jsx`: Displays grammar analysis results.
    *   `auth/`: Components related to user authentication (Login, Signup).
    *   `profile/`: Components for user profile management.
*   **State Management:** While a specific library isn't listed, state management is likely handled through a combination of React's built-in hooks (`useState`, `useContext`, `useReducer`) and custom hooks (`useAuth.js`, `useTTS.js`).
*   **Routing:** React Router is likely used for client-side routing, although not explicitly mentioned in `package.json`. The presence of `LoginPage.jsx` and `Profile.jsx` in `src/pages` suggests a multi-page structure handled by a router.

## 4. Backend (Server-side)

The backend is a Node.js application using the Express framework to provide a RESTful API for the frontend.

*   **Framework:** Express.js
*   **File:** `server.js`
*   **Key Services:**
    *   `ConversationService.js`: Manages the logic for the AI tutor conversations.
    *   `DialogueGenerator.js`: Service for generating dialogues.
    *   `GrammarService.js`: Handles grammar analysis requests.
    *   `LessonService.js`: Fetches lesson content from Firestore.
    *   `StorageService.js`: Interacts with Cloudinary (for user-uploaded content).
    *   `TTSService.js`: Manages text-to-speech generation with external providers.
    *   `UserService.js`: Handles user-related operations.
*   **Middleware:**
    *   `rateLimit.js`: Provides protection against DoS attacks by limiting the number of requests from a single IP.
    *   `validate.js`: Likely contains middleware for validating incoming request data, possibly using a library like Zod (as hinted by `src/schemas/api.js`).
*   **API Endpoints:** The server exposes API endpoints for features like fetching lessons, generating dialogues, analyzing grammar, and handling user authentication. These are defined in `server.js` and organized using Express routers.

## 5. AI and External Services

AppTutor integrates with several external services to provide its core features:

*   **Firebase:**
    *   **Firestore:** A NoSQL database used to store lesson content, user progress, and other application data.
    *   **Firebase Authentication:** Used for user registration and login.
*   **Media Storage:**
    *   **Cloudinary:** Used for storing user-uploaded content like profile pictures.
*   **AI Services:**
    *   **OpenAI:** The core of the AI Tutor and Grammar Doctor features.
    *   **LangChain:** Used as a framework to orchestrate interactions with AI models and other data sources.
*   **Text-to-Speech (TTS) Services:**
    *   **Amazon Polly, ElevenLabs, Google Cloud TTS:** Premium TTS services used to generate high-quality, natural-sounding audio for pronunciation practice. The system has a fallback mechanism to ensure availability.
    *   **Web Speech API:** A browser-based API used as a fallback for TTS.

## 6. Database

*   **Database:** Firebase Firestore
*   **Data Models:**
    *   **Lessons:** Lessons are likely stored in collections, organized by level (e.g., `beginner`, `intermediate`, `advanced`) and topic (e.g., `greetings`, `food`). The `scripts/seedLessons.js` script provides the initial schema.
    *   **Users:** User data, including authentication information and progress, is managed by Firebase Authentication and Firestore.
    *   **User Progress:** A collection to track which lessons a user has completed and their performance.
*   **Data Seeding:** The `scripts/seedLessons.js` script is used to populate the Firestore database with initial lesson content from local JSON files (`src/lessons`).

## 7. Infrastructure and Deployment

The application is designed to be deployed using Docker for consistency across development and production environments.

*   **Containerization:** Docker is used to containerize the Node.js application and the Nginx reverse proxy.
    *   `Dockerfile`: Defines the image for the Node.js application.
    *   `docker-compose.yml`: For local development.
    *   `docker-compose.prod.yml`: For production deployments.
*   **Reverse Proxy:** Nginx is used as a reverse proxy in production to:
    *   Handle SSL/TLS termination.
    *   Serve the static frontend assets.
    *   Proxy API requests to the Node.js server.
*   **HTTPS:**
    *   **Let's Encrypt:** Used to obtain free SSL certificates.
    *   **Certbot:** The tool used to automate the process of obtaining and renewing Let's Encrypt certificates.
    *   `init-letsencrypt.sh`: A script to initialize the SSL certificates.
    *   `init-local-https.sh`: A script to generate self-signed certificates for local HTTPS development.

## 8. Security

Security is a key consideration in the AppTutor project.

*   **Helmet.js:** A collection of middleware that sets various HTTP headers to protect against common web vulnerabilities (e.g., Cross-Site Scripting (XSS), clickjacking).
*   **Rate Limiting:** Protects against brute-force and Denial-of-Service (DoS) attacks.
*   **Input Validation:** The backend validates and sanitizes all incoming data to prevent XSS and other injection attacks. The use of Zod (`src/schemas/api.js`) provides a structured way to define and enforce data schemas.
*   **HTTPS:** All communication in production is encrypted using SSL/TLS.
*   **Dependabot:** Automatically keeps project dependencies up-to-date, patching known vulnerabilities.

## 9. Testing and Quality Assurance

The project has a comprehensive testing and quality assurance strategy.

*   **Unit and Integration Testing:**
    *   **Framework:** Vitest
    *   **Tests:** Located in `src/tests`, covering components, services, and utility functions.
*   **End-to-End (E2E) Testing:**
    *   **Framework:** Playwright
    *   **Tests:** Located in `src/tests/e2e`, simulating user flows through the application.
*   **Linting:**
    *   **Tool:** ESLint
    *   **Configuration:** `eslint.config.js`
    *   **Command:** `npm run lint`
*   **Performance Monitoring:**
    *   **Tool:** Lighthouse
    *   **Configuration:** `.lighthouserc.json`

## 10. Project Structure

```
/
├───.github/          # GitHub Actions workflows (CI/CD)
├───.husky/           # Git hooks
├───certbot/          # SSL certificate files
├───dist/             # Build output
├───docs/             # Project documentation
├───firebase/         # Firebase configuration
├───nginx/            # Nginx configuration
├───node_modules/     # Project dependencies
├───public/           # Static assets
├───scripts/          # Node.js scripts (e.g., database seeding)
├───src/              # Application source code
│   ├───assets/       # Static assets like images
│   ├───components/   # Reusable React components
│   ├───config/       # Application configuration
│   ├───data/         # Static data
│   ├───hooks/        # Custom React hooks
│   ├───lessons/      # Lesson content in JSON format
│   ├───middleware/   # Express middleware
│   ├───pages/        # Top-level page components
│   ├───schemas/      # Data validation schemas (Zod)
│   ├───services/     # Backend service modules
│   ├───tests/        # Automated tests
│   └───utils/        # Utility functions
├───test/             # Test setup and configuration
├───.env.example      # Example environment variables
├───docker-compose.yml # Docker Compose for development
├───Dockerfile        # Docker configuration for the app
├───package.json      # Project metadata and dependencies
├───server.js         # Backend Express server entry point
└───vite.config.js    # Vite configuration
```
