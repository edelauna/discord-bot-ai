#!/bin/bash
docker rmi $(docker images -f dangling=true -q)
docker rmi $(docker images -q ${DOCKER_IMAGE})
docker pull ${DOCKER_IMAGE}:latest
