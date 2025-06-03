# Battle of the LLMs: Summarizer Showdown

A web application that allows users to compare text summarization capabilities of different language models, both open-source and closed-source.

## Overview

This application enables users to:

1. Select two different LLMs (one open-source, one closed-source)
2. Input a long-form text (news article, blog, transcript, etc.)
3. Get summaries from both models side-by-side
4. Rate and compare results based on clarity, conciseness, and accuracy

## Project Structure

- **Frontend**: React application with Material-UI components
- **Backend**: Flask API server that interfaces with LLM APIs

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys for OpenAI, Anthropic, and HuggingFace

6. Run the backend server:
   ```
   python app.py
   ```
   The server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:5173

## Features

### Model Selection
- **Closed-source APIs**:
  - OpenAI GPT-3.5 / GPT-4
  - Anthropic Claude (optional)
- **Open-source (via HuggingFace)**:
  - facebook/bart-large-cnn
  - google/pegasus-xsum
  - mistralai/Mixtral (if available with text summarization pipeline)

### Input Options
- Text input box for pasting long articles
- Sample text available for quick testing

### Rating System
- Rate each model on:
  - Clarity (1-5)
  - Accuracy (1-5)
  - Conciseness (1-5)
- Select preferred model overall
- View comparison chart of ratings

## Technologies Used

### Frontend
- React
- Material-UI
- Axios
- Recharts
- React Markdown

### Backend
- Flask
- HuggingFace Transformers
- OpenAI API
- Anthropic API (optional)

## License

MIT