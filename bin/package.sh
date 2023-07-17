#!/bin/bash
docker system prune -f
docker pull "${DOCKER_IMAGE}":latest

