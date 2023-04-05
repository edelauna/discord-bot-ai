#!/bin/bash
docker stop discord-bot-ai
docker rm discord-bot-ai
docker run --name discord-bot-ai -d --env-file "${ENV_FILE}" -v /app/logs:/app/logs "${DOCKER_IMAGE}"
