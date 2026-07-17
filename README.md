# Last Letter

A web application for managing digital assets and final messages.

## 概要

Last Letterは、自分が亡くなった後に家族や大切な人へ
メッセージや希望を残すことができるWebアプリケーションです。

## Features

- Demo access
- User registration and login
- Message management
- Funeral request management
- Personalized messages for recipients
- MySQL database integration

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | HTML / CSS / JavaScript |
| Backend | Node.js / Express |
| Database | MySQL (Railway) |
| Deployment | Render |
| Version Control | Git / GitHub |

## System Architecture

```text
                Browser
        (HTML / CSS / JavaScript)
                    │
           HTTP Request / Response
                    │
                    ▼
        Node.js + Express (Render)
            │               │
            │ REST API      │ Session
            │               │
            └──────┬────────┘
                   │
                   ▼
          MySQL Database (Railway)

       users
       recipients
       messages
       funeral_requests
```

## Setup

Clone the repository.

```bash
git clone <repository-url>
cd lastletter
npm install
npm start
```

## Environment Variables

### Railway (MySQL)

Create a `.env` file and set the following values.

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

SESSION_SECRET=
DEMO_ACCESS_CODE=
```

## Deployment

This application is deployed using **Render**.

Set the following environment variables in Render.

```
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
SESSION_SECRET
DEMO_ACCESS_CODE
```

## Future Features

- Digital asset management
- Trusted person registration
- Important people management
- Profile editing
- Email notification system