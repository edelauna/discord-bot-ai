#!/bin/bash
docker stop discord-bot-ai
docker rm discord-bot-ai
docker run --name discord-bot-ai -d --env-file "${ENV_FILE}" -v /app/logs:/app/logs -v /app/db:/app/db "${DOCKER_IMAGE}"
