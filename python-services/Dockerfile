FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy the rest of the application
COPY . .

# Make ports available for both services
EXPOSE 5000 5001

# Create a startup script to run both services
RUN printf '#!/bin/bash\npython transcription_service.py &\npython question_generation_service.py &\nwait\n' > /app/start_services.sh \
    && chmod +x /app/start_services.sh

# Define default command
CMD ["bash", "./start_services.sh"]
