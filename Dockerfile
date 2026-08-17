# ─── Stage 1: Build blogverse-app monolith ───────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/blogverse-app/pom.xml ./pom.xml
COPY backend/blogverse-app/src ./src
RUN mvn clean package -DskipTests

# ─── Stage 2: Runtime (lean JRE) ─────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/blogverse-app-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xms128m", "-Xmx384m", "-jar", "app.jar"]
