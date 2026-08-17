# Multi-stage Docker build for BlogVerse Microservices Deployment
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml files and backend source code
COPY backend/ ./backend/
RUN mvn clean package -DskipTests -f backend/pom.xml

# Runtime Stage with OpenJDK 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy all microservice JAR artifacts from build stage
COPY --from=build /app/backend/eureka-server/target/eureka-server-1.0.0.jar eureka-server.jar
COPY --from=build /app/backend/auth-service/target/auth-service-1.0.0.jar auth-service.jar
COPY --from=build /app/backend/user-service/target/user-service-1.0.0.jar user-service.jar
COPY --from=build /app/backend/post-service/target/post-service-1.0.0.jar post-service.jar
COPY --from=build /app/backend/interaction-service/target/interaction-service-1.0.0.jar interaction-service.jar
COPY --from=build /app/backend/media-service/target/media-service-1.0.0.jar media-service.jar
COPY --from=build /app/backend/notification-service/target/notification-service-1.0.0.jar notification-service.jar
COPY --from=build /app/backend/api-gateway/target/api-gateway-1.0.0.jar api-gateway.jar

# Copy entrypoint script
COPY scripts/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

ENV PORT 8080
EXPOSE 8080 8761 8081 8088 8083 8084 8085 8086

ENTRYPOINT ["/app/entrypoint.sh"]
