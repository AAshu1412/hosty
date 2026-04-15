<p align="center">
  <h1 align="center">🚀 Hosty</h1>
  <p align="center">
    <strong>A Self-Hosted Web Deployment Platform — Deploy Your Frontend Projects with One Click</strong>
  </p>
  <p align="center">
    <a href="#demo">View Demo</a> · <a href="#features">Features</a> · <a href="#getting-started">Getting Started</a> · <a href="#architecture">Architecture</a>
  </p>
</p>

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->

## 🎬 Demo Video {#demo}
<!-- ════════════════════════════════════════════════════════════════════════ -->

<!-- 🔗 Paste your YouTube or Google Drive video link below -->

<p align="center">
  <a href="YOUR_VIDEO_LINK_HERE">
    <img src="https://via.placeholder.com/720x405?text=▶+Click+to+Watch+Demo+Video" alt="Demo Video" width="720"/>
  </a>
</p>

> **📹 Watch the full walkthrough:** [YOUR_VIDEO_LINK_HERE](YOUR_VIDEO_LINK_HERE)

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 📸 Project Photos
<!-- ════════════════════════════════════════════════════════════════════════ -->

<!-- Replace the placeholders below with your actual screenshots -->



<p align="center">
  <img src="./assets/hosty1.png" alt="Flow Banner" width="100%" />
    <img src="./assets/hosty2.png" alt="Flow Banner" width="100%" />
</p>


<!-- Add more screenshots as needed -->

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->

## 📖 About The Project
<!-- ════════════════════════════════════════════════════════════════════════ -->

**Hosty** is a self-hosted web deployment platform that lets users deploy their frontend projects (React, Vite, vanilla HTML/CSS, etc.) directly from a GitHub repository — with a single click. It provides each deployed site a unique subdomain (e.g., `your-project.<IP_ADDRESS>.nip.io`), automated CI/CD builds via Jenkins, real-time build status tracking, and email notifications.

Think of it as your own personal **Vercel / Netlify**, running entirely on your own infrastructure.

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## ✨ Features {#features}
<!-- ════════════════════════════════════════════════════════════════════════ -->

- 🔐 **GitHub OAuth Authentication** — Secure login via GitHub OAuth Apps
- 📦 **One-Click Deployment** — Import any public GitHub repo and deploy it instantly
- 🌐 **Subdomain-Based Hosting** — Each project gets its own subdomain (`project-name.<IP_ADDRESS>.nip.io`)
- 🏗️ **Automated CI/CD Pipeline** — Jenkins clones, installs, builds, and deploys your project automatically
- 📊 **Build History & Logs** — Track every build with status, timestamps, and detailed logs
- 📧 **Email Notifications** — Receive build success/failure alerts via email
- 🔄 **Re-deploy & Re-build** — Trigger fresh builds anytime from the dashboard
- ⚙️ **User Settings & Onboarding** — Smooth onboarding flow with profile management
- 🐳 **Fully Dockerized** — The entire stack runs inside Docker containers via Docker Compose
- ☁️ **Infrastructure as Code** — Terraform provisions the EC2 instance with Docker & Docker Compose pre-installed

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🏗️ Architecture {#architecture}
<!-- ════════════════════════════════════════════════════════════════════════ -->

<!-- Replace with your actual architecture diagram -->

<p align="center">
  <img src="https://via.placeholder.com/900x500?text=Architecture+Diagram" alt="Hosty Architecture Diagram" width="900"/>
</p>

### High-Level Overview

```
                        ┌─────────────────────────────────────────────────┐
                        │               AWS EC2 Instance                  │
                        │          (Provisioned via Terraform)            │
                        │                                                 │
  User ──► :8080        │  ┌─────────────┐       ┌──────────────────┐    │
  (Frontend Dashboard)  │  │   Frontend   │──────►│    Backend API   │    │
                        │  │  (React/Vite)│       │   (Express.js)   │    │
                        │  │   :8080      │       │     :5001        │    │
                        │  └─────────────┘       └────────┬─────────┘    │
                        │                                  │              │
                        │                         ┌────────▼─────────┐   │
                        │                         │   PostgreSQL DB  │   │
                        │                         │      :5432       │   │
                        │                         └──────────────────┘   │
                        │                                                 │
                        │  ┌─────────────┐       ┌──────────────────┐    │
  User Sites ──► :80    │  │    NGINX     │◄──────│     Jenkins      │    │
  (*.<IP_ADDRESS>.nip.io)         │  │  (Reverse    │       │   (CI/CD Engine) │    │
                        │  │   Proxy) :80 │       │     :8090        │    │
                        │  └─────────────┘       └──────────────────┘    │
                        │                                                 │
                        └─────────────────────────────────────────────────┘
```

**Flow:**
1. User logs in via **GitHub OAuth** on the React frontend
2. User selects a repo → Backend triggers a **Jenkins** build
3. Jenkins **clones**, **installs dependencies**, **builds** the project, and copies output to a shared NGINX volume
4. **NGINX** serves the built site on a dynamic subdomain (e.g., `your-repo.<IP_ADDRESS>.nip.io`)
5. Jenkins sends a **webhook** back to the backend with build status
6. User sees real-time **build status**, **logs**, and the **live hosted URL** on the dashboard

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🛠️ Tech Stack
<!-- ════════════════════════════════════════════════════════════════════════ -->

| Layer              | Technology                                                       |
| :----------------- | :--------------------------------------------------------------- |
| **Frontend**       | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router  |
| **Backend**        | Node.js, Express 5, Prisma ORM, Zod Validation                  |
| **Database**       | PostgreSQL 18                                                    |
| **CI/CD**          | Jenkins (LTS)                                                    |
| **Web Server**     | NGINX (Alpine) — dynamic subdomain-based routing                 |
| **Auth**           | GitHub OAuth + JWT                                               |
| **Containerization** | Docker, Docker Compose                                         |
| **Infrastructure** | Terraform (AWS EC2)                                              |
| **UI Components**  | Radix UI, Lucide Icons, shadcn/ui                                |

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 📁 Project Structure
<!-- ════════════════════════════════════════════════════════════════════════ -->

```
hosty/
├── docker-compose.yml          # Orchestrates all services
├── my-nginx.conf               # NGINX config for subdomain routing
│
├── frontend/                   # React + Vite + TypeScript frontend
│   ├── Dockerfile              # Multi-stage build (Node → NGINX)
│   ├── nginx.conf              # Frontend SPA routing config
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   └── package.json
│
├── server/                     # Express.js backend API
│   ├── Dockerfile              # Node.js container
│   ├── server.js               # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, DeployedRepo, Build)
│   ├── controller/             # Route handlers
│   ├── router/                 # API route definitions
│   ├── middlewares/            # Error handling & auth middleware
│   ├── validators/             # Zod request validation
│   ├── utils/                  # DB connection & helpers
│   └── package.json
│
└── others/
    ├── terraform/              # EC2 provisioning with Docker pre-installed
    │   ├── ec2.tf              # EC2 instance + Security Group
    │   ├── variables.tf        # Configurable instance type, AMI, storage
    │   ├── outputs.tf          # Public IP & DNS output
    │   └── docker_installation.sh  # User data script (Docker + Compose + Node.js)
    └── jenkins/
        └── Jenkinsfile         # CI/CD pipeline definition
```

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🚀 Getting Started {#getting-started}
<!-- ════════════════════════════════════════════════════════════════════════ -->

### Prerequisites

- [AWS Account](https://aws.amazon.com/) with IAM credentials configured
- [Terraform](https://developer.hashicorp.com/terraform/downloads) installed locally
- [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) — create one to get your `CLIENT_ID` and `CLIENT_SECRET`
- A registered domain (e.g., `<IP_ADDRESS>.nip.io`) with a wildcard DNS record (`*.<IP_ADDRESS>.nip.io`) pointing to your EC2 instance's public IP

---

### Step 1 — Provision the EC2 Instance with Terraform

Terraform will spin up a single EC2 instance on AWS and automatically install **Docker**, **Docker Compose**, and **Node.js** via a user data bootstrap script.

```bash
cd others/terraform

# Initialize Terraform
terraform init

# Preview the infrastructure changes
terraform plan

# Apply — this creates the EC2 instance
terraform apply -auto-approve
```

Once completed, Terraform will output the **public IP** and **public DNS** of your new EC2 instance.

```
Outputs:

ec2_public_ip = [
  {
    name       = "hosty-ec2-1"
    public_ip  = "xx.xx.xx.xx"
    public_dns = "ec2-xx-xx-xx-xx.ap-south-1.compute.amazonaws.com"
  }
]
```

> **📝 Note:** The EC2 instance type defaults to `c7i-flex.large` with 12 GB gp3 storage. You can customize these in `variables.tf`.

---

### Step 2 — SSH into the EC2 Instance

```bash
ssh -i others/terraform/terra_ed25519 ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Wait a couple of minutes for the user data script to finish installing Docker & Docker Compose. You can check with:

```bash
docker --version
docker compose version
```

---

### Step 3 — Clone the Repository on the EC2 Instance

```bash
git clone https://github.com/<your-username>/hosty.git
cd hosty
```

---

### Step 4 — Configure Environment Variables

#### Backend (`server/.env`)

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your actual values:

```env
# PostgreSQL (must match docker-compose postgres service)
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://your_postgres_user:your_postgres_password@hosty-postgres:5432/hosty

# JWT
JWT_SECRET_KEY=replace_with_a_long_random_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret

# Jenkins
JENKINS_USERNAME=your_jenkins_username
JENKINS_API_TOKEN=your_jenkins_api_token
JENKINS_CRUMB=your_jenkins_crumb

# Frontend URL (for CORS)
FRONTEND_URL=http://<YOUR_EC2_PUBLIC_DNS>:8080
```

#### Frontend (build args in `docker-compose.yml`)

Update the build args in `docker-compose.yml` under the `hosty-front` service:

```yaml
hosty-front:
  build:
    context: ./frontend
    args:
      - VITE_SERVER_URL=http://<YOUR_EC2_PUBLIC_DNS>:5001
      - VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
```

---

### Step 5 — Launch with Docker Compose

```bash
docker compose up -d --build
```

This will build and start **5 containers**:

| Container           | Port   | Description                      |
| :------------------ | :----- | :------------------------------- |
| `hosty-postgres`    | `5432` | PostgreSQL database              |
| `hosty-backend`     | `5001` | Express.js API server            |
| `hosty-frontend`    | `8080` | React dashboard (via NGINX)      |
| `hosty-jenkins`     | `8090` | Jenkins CI/CD server             |
| `hosty-nginx`       | `80`   | NGINX reverse proxy for deployed sites |

---

### Step 6 — Run Database Migrations

After the containers are up, run the Prisma migration to set up the database schema:

```bash
docker exec -it hosty-backend npx prisma migrate deploy
```

---

### Step 7 — Configure Jenkins

1. Open Jenkins at `http://<YOUR_EC2_PUBLIC_IP>:8090`
2. Get the initial admin password:
   ```bash
   docker exec hosty-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Complete the Jenkins setup wizard
4. Install the **NodeJS Plugin** and configure a Node.js installation (version `24.x`)
5. Create a **Pipeline** job using the `Jenkinsfile` from `others/jenkins/Jenkinsfile`
6. Generate a Jenkins **API Token** and update it in `server/.env`

---

### ✅ You're Live!

- **Dashboard:** `http://<YOUR_EC2_PUBLIC_IP>:8080`
- **API Server:** `http://<YOUR_EC2_PUBLIC_IP>:5001`
- **Jenkins:** `http://<YOUR_EC2_PUBLIC_IP>:8090`
- **Deployed Sites:** `http://<project-name>.<IP_ADDRESS>.nip.io`

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 📡 API Endpoints
<!-- ════════════════════════════════════════════════════════════════════════ -->

| Method | Endpoint                     | Description                          |
| :----- | :--------------------------- | :----------------------------------- |
| `POST` | `/api/auth/register`         | Register a new user                  |
| `POST` | `/api/auth/login`            | Login with credentials               |
| `GET`  | `/api/github/callback`       | GitHub OAuth callback                |
| `GET`  | `/api/github/repos`          | Fetch user's GitHub repositories     |
| `POST` | `/api/jenkins/trigger-build` | Trigger a Jenkins build for a repo   |
| `POST` | `/api/webhook/jenkinsWebhook`| Jenkins build status webhook         |

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🗄️ Database Schema
<!-- ════════════════════════════════════════════════════════════════════════ -->

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────┐
│     User     │       │   DeployedRepo   │       │    Build    │
├──────────────┤       ├──────────────────┤       ├─────────────┤
│ id           │◄──┐   │ id               │◄──┐   │ id          │
│ githubId     │   │   │ userId      (FK) │   │   │ repoId (FK) │
│ githubUser   │   └───│ repoUrl          │   └───│ buildNumber │
│ email        │       │ branch           │       │ status      │
│ accessToken  │       │ subDirectory     │       │ createdAt   │
│ avatarUrl    │       │ hostedSiteUrl    │       └─────────────┘
│ ...          │       │ currentStatus    │
└──────────────┘       │ currentBuild#    │
                       └──────────────────┘
```

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🐳 Docker Services Overview
<!-- ════════════════════════════════════════════════════════════════════════ -->

```yaml
services:
  postgres       # PostgreSQL 18 — persistent data via Docker volume
  hosty-backend  # Node.js Express API — connects to PostgreSQL via Prisma
  hosty-front    # React app — multi-stage build, served via NGINX
  jenkins        # Jenkins LTS — CI/CD engine, builds user projects
  nginx          # NGINX Alpine — serves deployed sites on dynamic subdomains
```

All services communicate over a shared Docker bridge network (`hosty-net`), and persistent data (database, Jenkins config, deployed sites) is stored in named Docker volumes.

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## ☁️ Infrastructure (Terraform)
<!-- ════════════════════════════════════════════════════════════════════════ -->

Terraform is used to provision a **single EC2 instance** on AWS that serves as the host for the entire Hosty platform. On launch, a **user data script** automatically installs:

- **Docker** (docker.io)
- **Docker Compose** (v5.1.2)
- **Node.js** (v24.x)

The Terraform configuration also creates:
- An **SSH key pair** for secure access
- A **Security Group** with ports opened for SSH (22), HTTP (80), HTTPS (443), Backend (5001), Frontend (8080), Jenkins (8090), and PostgreSQL (5432)

| Variable             | Default             | Description            |
| :------------------- | :------------------ | :--------------------- |
| `aws_instance_type`  | `c7i-flex.large`    | EC2 instance type      |
| `ec2_storage_size`   | `12` GB             | Root volume size       |
| `ec2_ami_id`         | Ubuntu AMI          | Base AMI               |

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🔧 Useful Commands
<!-- ════════════════════════════════════════════════════════════════════════ -->

```bash
# Start all services
docker compose up -d --build

# Stop all services
docker compose down

# View logs for a specific service
docker compose logs -f hosty-backend

# Restart a single service
docker compose restart hosty-backend

# Access the PostgreSQL database
docker exec -it hosty-postgres psql -U <your_user> -d hosty

# Run Prisma migrations
docker exec -it hosty-backend npx prisma migrate deploy

# Generate Prisma client
docker exec -it hosty-backend npx prisma generate

# Destroy the EC2 infrastructure
cd others/terraform && terraform destroy -auto-approve
```

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 🤝 Contributing
<!-- ════════════════════════════════════════════════════════════════════════ -->

Contributions are welcome! If you'd like to improve Hosty, feel free to:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

<br/>

<!-- ════════════════════════════════════════════════════════════════════════ -->
## 📄 License
<!-- ════════════════════════════════════════════════════════════════════════ -->

Distributed under the MIT License. See `LICENSE` for more information.

<br/>

---

<p align="center">
  Made with ❤️ by <strong>Ashu</strong>
</p>
