from flask import Flask, request, jsonify
import whisper
import os
import tempfile
from pathlib import Path

app = Flask(__name__)

# Load Whisper model (you can change to different model sizes)
model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe_video():
    try:
        data = request.json
        file_path = data.get('file_path')
        job_id = data.get('job_id')
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 400
        
        # Transcribe the video
        result = model.transcribe(file_path)
        
        # Segment the transcript into 5-minute chunks
        segments = segment_transcript(result['segments'])
        
        return jsonify({
            'job_id': job_id,
            'segments': segments,
            'full_text': result['text']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def segment_transcript(whisper_segments, chunk_duration=300):  # 5 minutes = 300 seconds
    """Segment transcript into 5-minute chunks"""
    segments = []
    current_segment = {
        'id': '',
        'startTime': 0,
        'endTime': 0,
        'text': '',
        'duration': 0
    }
    
    segment_count = 0
    current_start = 0
    current_text = []
    
    for segment in whisper_segments:
        segment_start = segment['start']
        segment_end = segment['end']
        segment_text = segment['text']
        
        # If this segment would exceed the chunk duration, finalize current chunk
        if segment_end > current_start + chunk_duration:
            if current_text:  # Only create segment if there's text
                segments.append({
                    'id': str(segment_count + 1),
                    'startTime': current_start,
                    'endTime': min(current_start + chunk_duration, segment_start),
                    'text': ' '.join(current_text).strip(),
                    'duration': chunk_duration
                })
                segment_count += 1
            
            # Start new chunk
            current_start = current_start + chunk_duration
            current_text = []
        
        current_text.append(segment_text)
    
    # Add final segment if there's remaining text
    if current_text:
        segments.append({
            'id': str(segment_count + 1),
            'startTime': current_start,
            'endTime': current_start + chunk_duration,
            'text': ' '.join(current_text).strip(),
            'duration': chunk_duration
        })
    
    return segments

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
