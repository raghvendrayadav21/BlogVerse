# Multi-stage Docker build for BlogVerse Backend Deployment on Render / Cloud
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy all maven configuration & modules
COPY backend/ ./backend/
RUN mvn clean package -DskipTests -f backend/pom.xml

# Runtime Stage with Java 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/api-gateway/target/api-gateway-1.0.0.jar app.jar

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
