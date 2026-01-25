plugins {
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.6"
    java
}

group = "com.boardgamehub"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}
dependencies {

    // Javalin web server
    // Web (REST + serve static)
    implementation("org.springframework.boot:spring-boot-starter-web")

    // JPA (Hibernate)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // MySQL driver
    runtimeOnly("com.mysql:mysql-connector-j")

    // Password hashing (BCrypt)
    implementation("org.springframework.security:spring-security-crypto")

    testImplementation("org.springframework.boot:spring-boot-starter-test")

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")
}

tasks.test {
    useJUnitPlatform()
}
