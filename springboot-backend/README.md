# Kaamgar Connect — Spring Boot Backend

Java Spring Boot version of the Kaamgar Connect API. Same MongoDB Atlas database as the MERN backend.

## Tech Stack
- **Java 17** + **Spring Boot 3.2**
- **Spring Data MongoDB** (Atlas)
- **Spring Security** + **JWT** (JJWT 0.12)
- **JavaMailSender** (Gmail SMTP)
- **Lombok**

## Prerequisites
- Java 17+ installed (`java -version`)
- Maven 3.8+ installed (`mvn -version`)

## Run
```bash
cd springboot-backend
mvn spring-boot:run
```
API will start at **http://localhost:8080**

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register (worker/employer) |
| POST | `/verify-otp` | ❌ | Verify OTP from email |
| POST | `/resend-otp` | ❌ | Resend OTP |
| POST | `/login` | ❌ | Login → get JWT |
| POST | `/forgot-password` | ❌ | Send reset OTP |
| POST | `/reset-password` | ❌ | Set new password |
| GET | `/me` | ✅ | Get current user |

### Jobs (`/api/jobs`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Browse jobs (filter: category, location, job_type, search, page) |
| GET | `/{id}` | ❌ | Job detail |
| POST | `/` | Employer | Post a new job |
| PUT | `/{id}` | Employer | Update job |
| DELETE | `/{id}` | Employer | Deactivate job |
| GET | `/my-jobs` | Employer | My posted jobs |

### Applications (`/api/applications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/{jobId}` | Worker | Apply (coverNote + proposedRate) |
| GET | `/` | Worker | My applications |
| DELETE | `/{id}` | Worker | Withdraw application |
| PATCH | `/{id}/status` | Employer | Update status (accepted/rejected/shortlisted) |
| GET | `/jobs/{jobId}/applicants` | Employer | See applicants |

### Workers (`/api/workers`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Browse workers (filter: skills, available, min_rate…) |
| GET | `/{id}` | ❌ | Worker detail |
| PUT | `/profile` | Worker | Update own worker profile |

### Chat (`/api/chat`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/start/{userId}` | ✅ | Start chat with user |
| GET | `/inbox` | ✅ | Get chat inbox |
| GET | `/room/{id}` | ✅ | Get room + messages |
| POST | `/room/{id}/send` | ✅ | Send message (REST) |
| GET | `/poll/{id}?after={msgId}` | ✅ | Poll for new messages |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all notifications |
| GET | `/unread-count` | ✅ | Get unread count |
| PATCH | `/{id}/read` | ✅ | Mark one as read |
| PATCH | `/read-all` | ✅ | Mark all as read |

## Request Examples

### Register (Worker)
```json
POST /api/auth/register
{
  "username": "ramkumar",
  "email": "ram@example.com",
  "password": "secret123",
  "role": "worker"
}
```

### Apply for Job (with rate negotiation)
```json
POST /api/applications/{jobId}
Authorization: Bearer <token>
{
  "coverNote": "I am an experienced plumber with 5 years experience.",
  "proposedRate": 800
}
```

### Post a Job (Employer)
```json
POST /api/jobs
Authorization: Bearer <token>
{
  "title": "Need Plumber urgently",
  "category": "plumbing",
  "jobType": "contract",
  "description": "Need a plumber to fix leaking pipe at home.",
  "location": "Delhi, Lajpat Nagar",
  "salaryMin": 500,
  "salaryMax": 1000,
  "openings": 1
}
```

### Start Chat
```json
POST /api/chat/start/{workerId}
Authorization: Bearer <token>
→ { "roomId": "..." }

GET /api/chat/room/{roomId}   ← get messages
POST /api/chat/room/{roomId}/send   ← send message
  body: { "text": "Hello, are you available?" }
```

## Notes
- JWT token: pass as `Authorization: Bearer <token>` header
- Port: **8080** (MERN backend runs on 5000)
- Same MongoDB Atlas cluster — both backends share the same data
