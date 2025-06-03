# Battle of the LLMs - Backend

This is the backend service for the Battle of the LLMs application. It provides API endpoints for summarizing text using both open-source and closed-source language models.

## Setup

1. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys for OpenAI, Anthropic, and HuggingFace

5. Run the application:
   ```
   python app.py
   ```

## API Endpoints

### GET /api/models
Returns the list of available models for summarization.

### POST /api/summarize
Generates summaries using the selected models.

Request body:
```json
{
  "text": "Long text to summarize...",
  "open_model": "facebook/bart-large-cnn",
  "closed_model": "gpt-3.5-turbo"
}
```

### POST /api/save-rating
Saves user ratings for model summaries.

Request body:
```json
{
  "open_model": "facebook/bart-large-cnn",
  "closed_model": "gpt-3.5-turbo",
  "ratings": {
    "open_model": {
      "clarity": 4,
      "accuracy": 5,
      "conciseness": 3
    },
    "closed_model": {
      "clarity": 5,
      "accuracy": 4,
      "conciseness": 5
    }
  },
  "preferred": "closed_model"
}
```