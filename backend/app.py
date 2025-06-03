from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
HF_API_KEY = os.getenv('HF_API_KEY')

# Dictionary of available models
OPEN_SOURCE_MODELS = {
    'facebook/bart-large-cnn': 'BART (Facebook)',
    'google/pegasus-xsum': 'PEGASUS (Google)',
    'mistralai/Mixtral-8x7B-Instruct-v0.1': 'Mixtral (Mistral AI)'
}

CLOSED_SOURCE_MODELS = {
    'gpt-3.5-turbo': 'GPT-3.5 (OpenAI)',
    'gpt-4': 'GPT-4 (OpenAI)',
    'claude-3-sonnet-20240229': 'Claude (Anthropic)'
}

@app.route('/api/models', methods=['GET'])
def get_models():
    """Return the list of available models"""
    return jsonify({
        'open_source': OPEN_SOURCE_MODELS,
        'closed_source': CLOSED_SOURCE_MODELS
    })

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """Generate summaries using the selected models"""
    data = request.json
    text = data.get('text', '')
    open_model = data.get('open_model', '')
    closed_model = data.get('closed_model', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if not open_model and not closed_model:
        return jsonify({'error': 'No models selected'}), 400
    
    results = {}
    
    # Process open source model if selected
    if open_model and open_model in OPEN_SOURCE_MODELS:
        try:
            results['open_source'] = summarize_with_huggingface_api(text, open_model)
        except Exception as e:
            results['open_source'] = {'error': str(e)}
    
    # Process closed source model if selected
    if closed_model and closed_model in CLOSED_SOURCE_MODELS:
        try:
            results['closed_source'] = summarize_with_closed_source(text, closed_model)
        except Exception as e:
            results['closed_source'] = {'error': str(e)}
    
    return jsonify(results)

def summarize_with_huggingface_api(text, model_name):
    """Generate summary using HuggingFace Inference API"""
    if not HF_API_KEY:
        return {'error': 'HuggingFace API key not found'}
    
    headers = {
        'Authorization': f'Bearer {HF_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    # For Mixtral, use a different approach as it's not a standard summarization model
    if 'mixtral' in model_name.lower():
        payload = {
            'inputs': f"Please summarize the following text:\n\n{text}\n\nSummary:",
            'parameters': {
                'max_new_tokens': 512,
                'temperature': 0.3,
                'top_p': 0.95,
                'do_sample': True
            }
        }
        api_url = f"https://api-inference.huggingface.co/models/{model_name}"
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            # Extract the summary from the generated text
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
                # Remove the prompt and extract just the summary
                summary = generated_text.split("Summary:")[-1].strip()
                return {'summary': summary}
            else:
                return {'summary': str(result)}
        else:
            return {'error': f'HuggingFace API error: {response.text}'}
    else:
        # For standard summarization models
        payload = {
            'inputs': text,
            'parameters': {
                'max_length': min(1024, len(text) // 4),  # Limit summary to 1/4 of original text
                'min_length': 30,
                'do_sample': False
            }
        }
        
        api_url = f"https://api-inference.huggingface.co/models/{model_name}"
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                summary = result[0].get('summary_text', '')
                return {'summary': summary}
            else:
                return {'summary': str(result)}
        else:
            return {'error': f'HuggingFace API error: {response.text}'}

def summarize_with_closed_source(text, model_name):
    """Generate summary using closed source APIs (OpenAI or Anthropic)"""
    if 'gpt' in model_name:
        return summarize_with_openai(text, model_name)
    elif 'claude' in model_name:
        return summarize_with_anthropic(text, model_name)
    else:
        return {'error': 'Unsupported closed source model'}

def summarize_with_openai(text, model_name):
    """Generate summary using OpenAI API"""
    if not OPENAI_API_KEY:
        return {'error': 'OpenAI API key not found'}
    
    try:
        # Initialize the OpenAI client - removed invalid parameters
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Create a chat completion
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text."},
                {"role": "user", "content": f"Please summarize the following text:\n\n{text}"}
            ],
            temperature=0.3,
            max_tokens=1024
        )
        
        # Extract the summary from the response
        summary = response.choices[0].message.content
        return {'summary': summary}
    except Exception as e:
        return {'error': f'OpenAI API error: {str(e)}'}

def summarize_with_anthropic(text, model_name):
    """Generate summary using Anthropic API"""
    if not ANTHROPIC_API_KEY:
        return {'error': 'Anthropic API key not found'}
    
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
    }
    
    data = {
        'model': model_name,
        'max_tokens': 1024,
        'temperature': 0.3,
        'messages': [
            {'role': 'user', 'content': f'Please summarize the following text:\n\n{text}'}
        ]
    }
    
    response = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        summary = result['content'][0]['text']
        return {'summary': summary}
    else:
        return {'error': f'Anthropic API error: {response.text}'}

@app.route('/api/save-rating', methods=['POST'])
def save_rating():
    """Save user ratings for model summaries"""
    data = request.json
    # In a real application, you would save this to a database
    # For this demo, we'll just return the data
    return jsonify({'status': 'success', 'data': data})

if __name__ == '__main__':
    app.run(debug=True, port=5000)