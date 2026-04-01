# NextSelf Pro

AI-powered video transcription and analysis platform for psychotherapists.

NextSelf Pro is a professional tool designed to help therapists analyze their sessions, identify cognitive distortions, suggest therapeutic interventions (CBT, ACT, DBT, etc.), and provide professional, empathetic, and scientifically-backed insights.

## Features

- **Secure Session Upload**: Upload video or audio recordings of therapy sessions.
- **AI Transcription**: Highly accurate, verbatim transcripts with speaker identification.
- **Clinical Analysis**: Identify cognitive distortions, suggest interventions, and gain professional insights.
- **Session Management**: Organize, review, and manage past therapy sessions.

## Technology Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Motion.
- **Backend**: Express.js (for server-side logic).
- **AI**: Powered by Google Gemini models via `@google/genai` SDK.
- **Storage**: IndexedDB for local session storage.
- **CI/CD**: GitHub Actions pipeline for automated testing and Docker image deployment.

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- **Linting**: `npm run lint`
- **Testing**: `npm test`
- **Build**: `npm run build`

## License

This project is proprietary.
