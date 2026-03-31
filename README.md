<div align="center">


# 🧠 NextSelfPro: AI-Powered Therapy Workspace

**Advanced clinical analysis, transcription, and patient management powered by Gemini 3.1.**

[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.1-orange?style=flat-square&logo=google)](https://aistudio.google.com/)

[View App in Google AI Studio](https://ai.studio/apps/f98bc0d9-22c9-4d10-a166-72bf9768e6f7)

</div>

## 📖 About The Project

**NextSelfPro** is a next-generation SaaS platform designed specifically for behavioral psychologists and psychotherapists. It transforms raw therapy session recordings (audio/video) into structured, actionable clinical insights. 

Instead of spending hours re-watching sessions and taking manual notes, therapists can use NextSelfPro to transcribe conversations, identify behavioral patterns, and interact with an AI co-therapist that remembers the entire history of a patient.

### ✨ Key Features

* 🗂 **Patient Case Management:** Strict hierarchy (`Workspace -> Patient -> Sessions`) to keep clinical data organized and isolated.
* 🎙 **Automated Transcription:** Seamlessly upload session media for highly accurate text transcription.
* 🔬 **Micro-Analysis (Session Level):** Chat with the AI using the context of a *single* session with strict temperature control for factual accuracy.
* 🔭 **Macro-Analysis (Project Level):** RAG-inspired architecture that synthesizes automated session summaries to find hidden patterns, emotional shifts, and deep insights across dozens of past sessions.
* 💎 **Premium "Sapphire UI":** A custom-designed dark mode interface utilizing an advanced Elevation System (Nested Windows, Glassmorphism) for reduced cognitive load.

## 🛠 Tech Stack & Architecture

Built with modern web standards and focused on scalability, performance, and UI/UX best practices:

* **Frontend:** React (Vite) + TypeScript
* **Styling:** Tailwind CSS (Strict semantic design tokens for Elevation UI)
* **State Management:** Zustand (Modular stores for Projects, Sessions, and UI state)
* **Data Validation:** Zod
* **AI Engine:** Google Gemini 3.1 Pro (via Google AI Studio)
* **Local DB (MVP):** IndexedDB (via `fake-indexeddb` for robust local testing and storage)

## 🚀 Getting Started

Follow these instructions to run the NextSelfPro environment locally.

### Prerequisites
* Node.js (v18 or higher recommended)
* A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/next-self-pro.git](https://github.com/your-username/next-self-pro.git)
    cd next-self-pro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` (or `.env`) file in the root directory and add your API keys:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📂 Project Structure

The project follows a modular, feature-sliced architecture for maximum maintainability:

```text
src/
├── components/      # Reusable UI elements (dumb components)
│   └── features/    # Feature-specific components (Sessions, Uploads)
├── layouts/         # Global structural wrappers (MainLayout with Nested Window)
├── pages/           # Route-level components (Dashboard, PatientProfile)
├── services/        # External logic (ai.service.ts, db.service.ts)
├── store/           # Zustand state management (useProjectStore, useSessionStore)
├── schemas/         # Zod validation schemas
├── types/           # Global TypeScript interfaces
└── index.css        # Tailwind directives and semantic design tokens
