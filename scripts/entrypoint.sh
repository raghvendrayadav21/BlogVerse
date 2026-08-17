#!/bin/bash
set -e

echo "=== Starting BlogVerse Microservices Ecosystem ==="

# Set default heap limits to stay light on RAM
JAVA_OPTS_MICRO="-Xms64m -Xmx128m"
JAVA_OPTS_GATEWAY="-Xms128m -Xmx256m"

# DB Password fallback
if [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then
    export SPRING_DATASOURCE_PASSWORD="sa"
fi

echo "1. Starting Eureka Discovery Server (Port 8761)..."
java $JAVA_OPTS_MICRO -jar eureka-server.jar > eureka.log 2>&1 &
sleep 8

echo "2. Starting Auth Service (Port 8081)..."
java $JAVA_OPTS_MICRO -jar auth-service.jar > auth.log 2>&1 &

echo "3. Starting User Service (Port 8088)..."
java $JAVA_OPTS_MICRO -DUSER_SERVICE_PORT=8088 -jar user-service.jar > user.log 2>&1 &

echo "4. Starting Post Service (Port 8083)..."
java $JAVA_OPTS_MICRO -jar post-service.jar > post.log 2>&1 &

echo "5. Starting Interaction Service (Port 8084)..."
java $JAVA_OPTS_MICRO -jar interaction-service.jar > interaction.log 2>&1 &

echo "6. Starting Media Service (Port 8085)..."
java $JAVA_OPTS_MICRO -jar media-service.jar > media.log 2>&1 &

echo "7. Starting Notification Service (Port 8086)..."
java $JAVA_OPTS_MICRO -jar notification-service.jar > notification.log 2>&1 &

sleep 6

echo "8. Starting API Gateway (Port 8080)..."
exec java $JAVA_OPTS_GATEWAY -jar api-gateway.jar
