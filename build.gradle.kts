plugins {
    id("java")
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {

    // Javalin web server
    implementation("io.javalin:javalin:6.3.0")

    // JSON (Jackson) - Javalin го ползва за ctx.json()
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")
    implementation("org.slf4j:slf4j-simple:2.0.13")

    implementation("org.hibernate.orm:hibernate-core:7.1.0.Final")
    implementation("com.mysql:mysql-connector-j:9.4.0")
    implementation ("org.apache.logging.log4j:log4j-core:2.17.1")
    implementation ("org.hibernate.validator:hibernate-validator:9.1.0.Final")
    implementation("org.hibernate.validator:hibernate-validator-annotation-processor:9.1.0.Final")
    implementation("org.glassfish.expressly:expressly:6.0.0")
    // Annotation processor for metamodel
    annotationProcessor("org.hibernate.orm:hibernate-processor:7.1.0.Final")

    compileOnly("org.projectlombok:lombok:1.18.38")
    annotationProcessor("org.projectlombok:lombok:1.18.38")
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}
