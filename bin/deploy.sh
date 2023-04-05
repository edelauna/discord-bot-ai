#!/bin/bash
docker stop discord-bot-ai
docker rm discord-bot-ai
docker run --name discord-bot-ai -d --env-file .env -v /app/logs:/app/logs ${DOCKER_IMAGE}
