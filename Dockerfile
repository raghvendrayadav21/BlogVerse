# Multi-stage Docker build optimized for Render 512MB RAM Free Tier
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml files and backend source code
COPY backend/ ./backend/
RUN mvn clean package -DskipTests -f backend/pom.xml

# Runtime Stage with OpenJDK 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy unified single-JVM artifact
COPY --from=build /app/backend/blogverse-unified/target/blogverse-unified-1.0.0.jar app.jar

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
