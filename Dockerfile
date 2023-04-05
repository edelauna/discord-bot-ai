FROM node:18
# app
##############
WORKDIR /app

COPY . .
RUN npm install
RUN npm run tsc

# supervisord
##############
RUN apt-get update && \
    apt-get install -y --no-install-recommends supervisor

RUN mv conf/supervisord.conf /etc/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
