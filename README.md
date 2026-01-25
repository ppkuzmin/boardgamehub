# 🎲 BoardGameHub

BoardGameHub е full-stack уеб приложение за настолни игри, разработено със **Spring Boot (Java)** и **vanilla HTML/CSS/JavaScript**.

Приложението позволява:
- разглеждане на колекция от настолни игри
- регистрация и вход на потребители
- писане на ревюта за игри
- записване и проследяване на изиграни игри (Game Tracker)
- визуализация на статистики
- управление на игри чрез REST CRUD API

---

## 🚀 Основни функционалности

### 🎮 Games
- REST API CRUD:
    - `GET /api/games`
    - `GET /api/games/{id}`
    - `POST /api/games`
    - `PUT /api/games/{id}`
    - `DELETE /api/games/{id}`
- DTO-based архитектура (не се връщат entity обекти)
- Поддръжка на изображения чрез static ресурси (`/static/images`)

### ⭐ Reviews
- Всеки вписан потребител може да добавя ревю
- Рейтинг (1–5) + текст
- Ревютата се пазят в базата данни

### 📊 Game Tracker
- Записване на изиграни игри
- Участници + класиране
- История на игрите
- Статистика и класации (Chart.js)

### 🔐 Authentication
- Регистрация с email и парола
- Login / Logout
- Сесийно удостоверяване (HttpSession)

---

## 🛠 Технологии

### Backend
- Java 17+
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Hibernate
- DTO Pattern
- REST API

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js

---

## 🗂 Структура на проекта

src/main/java/com/boardgamehub

├── configuration

├── controller

├── dto

├── entity

├── repo

└── service

src/main/resources

├── static

│ ├── css

│ ├── js

│ └── images

└── application.properties


---

## ▶️ Стартиране на проекта

### 1. База данни
Създай MySQL база:
```sql
CREATE DATABASE boardgamehub;
2. Конфигурация
В application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/boardgamehub
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD
3. Стартиране
Стартирай:

BoardGameHubApplication
Приложението ще е достъпно на:

http://localhost:8080
🧪 Тестване на API (пример)
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -d '{"name":"Azul","description":"Tile drafting game","tags":"abstract,family"}'
📸 Изображения
Изображенията на игрите се намират в:

src/main/resources/static/images
И се използват от frontend-а чрез относителни пътища:

images/azul_1.jpg
📚 Бъдещи подобрения
- Роли (admin/user)
- Upload на изображения
- Spring Security
- Docker + docker-compose
- Unit тестове

👤 Автор
Petar Kuzmin
BoardGameHub – 2025