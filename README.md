# Video Transcription & MCQ Generator

A full-stack application that automatically transcribes lecture videos and generates multiple-choice questions using AI.

## Features

- **Video Upload**: Drag-and-drop interface for MP4 files (up to 2GB)
- **Automatic Transcription**: Uses Whisper for speech-to-text conversion
- **Smart Segmentation**: Divides content into 5-minute segments
- **AI Question Generation**: Creates MCQs using local LLM (Ollama)
- **Real-time Progress**: Live updates during processing
- **Export Functionality**: Download transcripts and questions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Query** for data fetching

### Backend
- **Next.js API Routes** for REST endpoints
- **Node.js** with TypeScript
- **MongoDB** for data storage
- **File system** for video storage

### AI/ML Services
- **Whisper** for transcription (Python/Flask)
- **Ollama** for local LLM hosting
- **LLaMA/Mistral** models for question generation

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- 8GB+ RAM (for AI models)

### 1. Clone Repository
\`\`\`bash
git clone (https://github.com/themohesh/Annam-ai.git)
cd video-transcription-mcq-generator
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Frontend dependencies
npm install

# Python dependencies
cd python-services
pip install -r requirements.txt
cd ..
\`\`\`

### 3. Start Services with Docker
\`\`\`bash
# Start MongoDB and AI services
docker-compose up -d

# Pull and run Ollama model
docker exec -it ollama_llm ollama pull llama2
\`\`\`

### 4. Environment Variables
Create `.env.local`:
\`\`\`env
MONGODB_URI=mongodb://admin:password123@localhost:27017/video_transcription?authSource=admin
TRANSCRIPTION_SERVICE_URL=http://localhost:5000
QUESTION_SERVICE_URL=http://localhost:5001
\`\`\`

### 5. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to use the application.

## Usage

1. **Upload Video**: Drag and drop an MP4 lecture file
2. **Monitor Progress**: Watch real-time transcription and question generation
3. **Review Results**: Browse segmented transcripts and generated MCQs
4. **Export Data**: Download transcripts and questions as text files

## API Endpoints

- `POST /api/upload` - Upload video file
- `GET /api/status/[id]` - Check processing status
- `POST /api/transcribe` - Trigger transcription
- `POST /api/generate-questions` - Generate MCQs

## Python Services

### Transcription Service (Port 5000)
- Processes video files with Whisper
- Segments audio into 5-minute chunks
- Returns structured transcript data

### Question Generation Service (Port 5001)
- Integrates with local LLM (Ollama)
- Generates contextual MCQs
- Provides explanations for answers

## Configuration

### Whisper Model Options
- `tiny`: Fastest, least accurate
- `base`: Balanced (default)
- `small`: Better accuracy
- `medium`: High accuracy
- `large`: Best accuracy, slowest

### LLM Model Options
- `llama2`: General purpose (default)
- `mistral`: Fast and efficient
- `codellama`: Code-focused
- `gemma`: Google's model

## Performance Optimization

- **Chunked Processing**: Videos processed in segments
- **Background Jobs**: Non-blocking transcription
- **Caching**: Results stored in MongoDB
- **Progress Tracking**: Real-time status updates

## Troubleshooting

### Common Issues

1. **Out of Memory**: Reduce model size or increase RAM
2. **Slow Processing**: Use smaller Whisper model
3. **LLM Errors**: Check Ollama service status
4. **Upload Fails**: Verify file size and format

### Logs
\`\`\`bash
# Check service logs
docker-compose logs ai-services
docker-compose logs ollama

# Check Next.js logs
npm run dev
\`\`\`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details.
