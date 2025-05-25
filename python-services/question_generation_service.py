from flask import Flask, request, jsonify
import requests
import json
import uuid

app = Flask(__name__)

# Configure your local LLM endpoint (e.g., Ollama)
LLM_ENDPOINT = "http://localhost:11434/api/generate"  # Ollama default endpoint
MODEL_NAME = "llama2"  # Change to your preferred model

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        segments = data.get('segments', [])
        job_id = data.get('job_id')
        num_questions = data.get('num_questions_per_segment', 2)
        
        question_sets = []
        
        for segment in segments:
            questions = generate_mcqs_for_segment(segment['text'], num_questions)
            
            question_set = {
                'segmentId': segment['id'],
                'startTime': segment['startTime'],
                'endTime': segment['endTime'],
                'questions': questions
            }
            question_sets.append(question_set)
        
        return jsonify({
            'job_id': job_id,
            'question_sets': question_sets
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_mcqs_for_segment(text, num_questions=2):
    """Generate MCQs for a text segment using local LLM"""
    
    prompt = f"""
    Based on the following lecture transcript segment, generate {num_questions} multiple-choice questions.
    Each question should have 4 options (A, B, C, D) with only one correct answer.
    
    Transcript:
    {text}
    
    Please format your response as JSON with the following structure:
    {{
        "questions": [
            {{
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,
                "explanation": "Brief explanation of why this is correct"
            }}
        ]
    }}
    
    Make sure the questions test understanding of key concepts mentioned in the transcript.
    """
    
    try:
        # Call local LLM (Ollama example)
        response = requests.post(LLM_ENDPOINT, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9
            }
        })
        
        if response.status_code == 200:
            llm_response = response.json()
            generated_text = llm_response.get('response', '')
            
            # Parse the JSON response from LLM
            try:
                # Extract JSON from the response
                start_idx = generated_text.find('{')
                end_idx = generated_text.rfind('}') + 1
                json_str = generated_text[start_idx:end_idx]
                
                parsed_response = json.loads(json_str)
                questions = parsed_response.get('questions', [])
                
                # Format questions with unique IDs
                formatted_questions = []
                for q in questions:
                    formatted_questions.append({
                        'id': str(uuid.uuid4()),
                        'question': q.get('question', ''),
                        'options': q.get('options', []),
                        'correctAnswer': q.get('correct_answer', 0),
                        'explanation': q.get('explanation', '')
                    })
                
                return formatted_questions
                
            except json.JSONDecodeError:
                # Fallback: create mock questions if parsing fails
                return create_fallback_questions(text, num_questions)
        
        else:
            # Fallback if LLM service fails
            return create_fallback_questions(text, num_questions)
            
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return create_fallback_questions(text, num_questions)

def create_fallback_questions(text, num_questions):
    """Create fallback questions when LLM fails"""
    questions = []
    
    # Simple keyword-based question generation as fallback
    words = text.split()
    key_terms = [word for word in words if len(word) > 6 and word.isalpha()]
    
    for i in range(min(num_questions, len(key_terms))):
        term = key_terms[i] if i < len(key_terms) else "concept"
        
        question = {
            'id': str(uuid.uuid4()),
            'question': f"What is mentioned about {term} in this segment?",
            'options': [
                f"{term} is the main topic",
                f"{term} is briefly mentioned",
                f"{term} is not discussed",
                f"{term} is explained in detail"
            ],
            'correctAnswer': 1,
            'explanation': f"Based on the transcript, {term} is mentioned in the context of the lecture content."
        }
        questions.append(question)
    
    return questions

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
