# AI Contract Generator

The AI Contract Generator is a full-stack web application that leverages Google's Gemini models through LangChain to dynamically generate Terms of Service documents. Users provide a simple business description, and the application streams back a complete, well-structured legal document in real-time.

This project is designed for a production-ready environment, with a React frontend deployed on Vercel and a containerized Python backend ready for services like AWS Fargate.

---

## How It Works

This application uses a high-performance **"Two-Step Streaming"** architecture for an optimal user experience:

1.  **Instant Skeleton**: When you click "Generate," the app first makes a quick call to an AI model (`gemini-2.5-flash-lite`) to generate only the document's section titles. This structure is displayed almost instantly.
2.  **Concurrent Content Generation**: With the skeleton in place, the backend starts multiple simultaneous requests to a more precise model (`gemini-2.5-flash`) to write the content for each section. As the content is generated, it's streamed directly into the corresponding section of the document, allowing you to see the contract come to life in real-time.

---

## Features & Technology Stack

* **Frontend**: Built with **React**, **Vite**, and **Tailwind CSS** 
* **Backend**: API built with **Python** and **FastAPI**.
* **AI Orchestration**: Uses **LangChain** to manage interactions with **Google's Gemini**.
* **Cloud-Ready Deployment**: The backend is containerized with **Docker**, making the deoplyment to AWS Fargate easy. The frontend is configured for seamless deployment on **Vercel**: https://ai-contract-generator-bice.vercel.app

---
## Cloud infrastructure

The application is deployed with a decoupled frontend and backend, hosted on separate cloud platforms for scalability and ease of deployment.

Frontend (Vercel)

Backend (AWS Fargate)

- The Python FastAPI backend is containerized using Docker.

- The container image is stored in Amazon ECR (Elastic Container Registry).

- The container is run as a serverless task using AWS Fargate, which manages the underlying infrastructure and scaling.

- An Application Load Balancer (ALB) receives public traffic and routes it to the Fargate task.

- The entire setup runs inside a custom AWS VPC, with the Fargate task in private subnets and the ALB in public subnets for security.

The GEMINI_API_KEY is securely stored as an environment variable on the backend.

### **P.S.** To be noted that no DNS has been defined for the backend even though but the frontend is, as it is hosted on Vercel. To allow the frontend to access the backend without incur on a Mixed Content error you need to allow page to access an insicure(http) api.
Please follow this url: https://github.com/vercel/vercel/discussions/5287 and follow the instruction of the 3rd comment, user: `njzydark`


---
## Getting Started

### Prerequisites to use it locally

* Node.js (v18 or later)
* Python 3.11
* Docker
* An active Google AI Studio API key.

### Clone the repo:
Open the terminal and navigate to the directory where you want to clone the repository and then execute the following command: 
```
git clone https://github.com/AndreaTemin/ai-contract-generator.git
```



### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd /ai-contract-generator/Back-AI-Contract-Generator
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv .venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    Create a `.env` file in the `Back-AI-Contract-Generator` directory and add your Google API key:
    ```
    GEMINI_API_KEY="YOUR_GOOGLE_API_KEY"
    ```

5.  **Run the development server:**
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The backend API will now be available at `http://localhost:8000`.

### Frontend Setup

1.  **Execute the following commands in the terminal**
    ```bash
    cd /ai-contract-generator/Back-AI-Contract-Generator
    npm install
    npm install lucide-react
    npm install tailwindcss @tailwindcss/vite
    npm install dompurify
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the `Front-AI-Contract-Generator` directory and point it to your running backend:
    ```
    VITE_API_URL="http://localhost:8000"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend application will now be available at `http://localhost:5173`.


---

## Future development:
### Frontend
- improve overall ux
- Add more features:
    - The possibility to specify which llm to use
    - Add context relative to the sections to add
    - The possiblity to modify the already generated contract
    - share a file to be used as context for the contract
### Backend:
- Define a DNS for the backend server
- Set a login system to define who and in what measure a user can access to the service
- Set a databse to keep track of the users data for analytic purpose
- keep track of the amount of token utilized by users
- Add a security layer to the api like Auth0 authentication
