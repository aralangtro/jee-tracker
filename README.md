# JEE Tracker

JEE & CBSE Prep Tracker powered by your choice of AI API (OpenAI, Google Gemini, Anthropic, or NVIDIA NIM).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Clone or Download the Repository:**
   Download the project and extract it to a folder.

2. **Set up your AI API Configuration:**
   - Rename the file `.env.example` to `.env`.
   - Open `.env` in a text editor (like Notepad).
   - The app supports **OpenAI, Google Gemini, Anthropic, or NVIDIA NIM**.
   - Simply uncomment the block for your preferred provider and insert your API key where it says `put_your_api_key_here`.
   - *Tip: We highly recommend using lighter/faster models (like gpt-4o-mini, gemini-2.5-flash, claude-3-haiku) for the best performance.*

3. **Start the Server:**
   - Double-click the `start.bat` file (or `JEE Tracker - Start Server.bat`).
   - The script will automatically install the necessary dependencies and start the local server.
   - The app will automatically open in your default browser at `http://localhost:5714`.

## Features & Precision Tracking

This application is designed to be a highly granular, dual-focus academic tracker, balancing the rigorous demands of **JEE (Mains & Advanced)** with **CBSE Board exams**.

### 🎯 What it Tracks
- **Dual-Curriculum Support:** Automatically separates and tracks core JEE subjects (Physics, Chemistry, Mathematics) alongside CBSE-exclusive subjects (English, Physical Education, etc.).
- **Granular Syllabus Management:** Break down massive syllabi into micro-topics. Track your readiness on a scale from "Not Started" to "Mastered".
- **Daily Performance & Revisions:** Log daily study hours, mock test scores, and track how many times you've revised specific topics.
- **Smart Analytics:** The dashboard calculates precise percentage-based readiness for each subject, factoring in completed topics vs. total topics, weighting your confidence levels to give you a true statistical view of your preparation.

### 🤖 AI-Powered Automation
- **Syllabus Ingestion:** Instead of typing out topics manually, simply upload a PDF or image of your syllabus. The integrated AI Vision and Text models will instantly read the document, categorize the topics by subject, and populate your tracker automatically.
- **AI Study Coach:** An embedded chat interface allows you to ask the AI for study strategies, schedule planning, or specific academic doubts, utilizing the exact models you configured.

### 📊 Precision & Insights
- **Target Countdowns:** Dynamic countdowns calibrated for upcoming exam dates (e.g., April 2025 targets).
- **Data Visualizations:** Visual progress bars, charts, and calendar-based heatmaps allow you to see exactly where you are lagging behind and where your strengths lie.

### Data Privacy
All your data and tasks are stored locally in your browser's `localStorage`. This app does not use a cloud database, so your data belongs entirely to you.
