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

### Usage
- Manage your JEE syllabus tracking.
- Track daily performance.
- Use the AI features securely via your local server setup.

### Data Privacy
All your data and tasks are stored locally in your browser's `localStorage`. This app does not use a cloud database, so your data belongs entirely to you.
