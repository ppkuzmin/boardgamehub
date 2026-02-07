# ---- build stage ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts* ./
COPY src src

RUN chmod +x gradlew && ./gradlew clean bootJar

# ---- runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java","-jar","/app/app.jar"]
