# JEE Tracker

JEE & CBSE Prep Tracker powered by NVIDIA NIM (Llama 3.3 70B & Vision models).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Clone or Download the Repository:**
   Download the project and extract it to a folder.

2. **Set up your API Keys:**
   - Rename the file `.env.example` to `.env`.
   - Open `.env` in a text editor (like Notepad).
   - Get your free API keys from [NVIDIA NIM](https://build.nvidia.com/) for `meta/llama-3.3-70b-instruct` and `meta/llama-3.2-90b-vision-instruct`.
   - Paste your keys into the `.env` file where it says `put_your_api_key_here`.

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
