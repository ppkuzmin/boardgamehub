package org.example.configuration;

import org.example.entity.*;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;

import java.io.InputStream;
import java.util.Properties;

public class SessionFactoryUtil {

    private static SessionFactory sessionFactory;

    private SessionFactoryUtil() {
        // utility class
    }

    public static SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            try {
                Configuration configuration = new Configuration();

                // 1) Load hibernate.properties
                Properties properties = new Properties();
                try (InputStream inputStream =
                             SessionFactoryUtil.class
                                     .getClassLoader()
                                     .getResourceAsStream("hibernate.properties")) {

                    if (inputStream == null) {
                        throw new RuntimeException("hibernate.properties not found");
                    }
                    properties.load(inputStream);
                }

                configuration.setProperties(properties);

                // 2) Register Entity classes
                configuration.addAnnotatedClass(Person.class);

                // 3) Build ServiceRegistry & SessionFactory
                ServiceRegistry serviceRegistry =
                        new StandardServiceRegistryBuilder()
                                .applySettings(configuration.getProperties())
                                .build();

                sessionFactory = configuration.buildSessionFactory(serviceRegistry);

            } catch (Exception e) {
                System.err.println("❌ SessionFactory creation failed");
                e.printStackTrace();
                throw new ExceptionInInitializerError(e);
            }
        }
        return sessionFactory;
    }

    public static void shutdown() {
        if (sessionFactory != null) {
            sessionFactory.close();
            sessionFactory = null;
        }
    }
}
