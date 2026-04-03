# StudyMatch: UWGB Study Buddy Finder

StudyMatch is an interactive, Gen Z-focused platform designed to help University of Wisconsin-Green Bay (UWGB) students find study partners, coordinate meeting spots, and share class notes.

**Built as a solo project for the [Build with AI 2026](https://gdg.community.dev/events/details/google-gdg-on-campus-at-uw-green-bay-presents-build-with-ai-2026/) hackathon hosted by GDG on Campus at UW-Green Bay.**

<div align="center">
  <!-- Replace the URLs below with the direct links to your hosted images -->
  <img src="https://via.placeholder.com/200x100?text=Build+with+AI+Logo" alt="Build with AI Logo" width="200"/>
  <img src="https://via.placeholder.com/200x100?text=UWGB+Logo" alt="UWGB Logo" width="200"/>
</div>

This project was built entirely by a solo developer, leveraging the power of Google's AI tools and platforms to rapidly prototype and deploy a functional, AI-integrated application.

## 🚀 Features

*   **AI-Powered Matching:** Uses Google Gemini to analyze student profiles and suggest the best study partners based on shared courses, personality, and learning styles.
*   **Interactive Chat:** Real-time chat with student personas powered by Gemini, allowing for casual coordination.
*   **Match Celebration:** A fun, high-energy animation experience when you find a perfect study match, featuring confetti, avatar interactions, and AI-generated Gen Z-style match one-liners.
*   **MCP Integration:** Utilizes the Model Context Protocol (MCP) to fetch real-time campus data, including course lists, building hours, and ranked study spots based on personality types.
*   **Vertex AI Powered Suggestions:** The "Missed Class" feature leverages Vertex AI to draft personalized, friendly notes requests to classmates.
*   **Customizable Avatars:** Personalize your student profile with gender-based appearance customization.
*   **Responsive UI:** Built with React, Tailwind CSS, and Motion for a smooth, mobile-first experience.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Animations:** `motion/react`
*   **AI/ML:** Google Gemini API, Vertex AI
*   **Integration:** Model Context Protocol (MCP) (Mock implementation)

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd studymatch
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file based on `.env.example` and add your API keys:
    ```env
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 💡 Architecture Highlights

*   **Gemini Integration:** The app uses the `@google/genai` SDK for all AI interactions, including chat, match explanations, and note drafting.
*   **MCP Implementation:** The matching agent is equipped with function-calling tools (`get_courses`, `get_building_hours`, `get_study_spots`) that allow Gemini to gather context before generating match reasoning.
*   **Vertex AI:** The "Missed Class" feature is explicitly routed through the Vertex AI endpoint to demonstrate enterprise-grade AI integration.

## 🔮 Roadmap (v2)

*   **Google Veo Integration:** We are planning to implement personalized, animated high-five videos of avatars using Google Veo to celebrate study matches.

## 📄 License

This project is licensed under the Apache License 2.0.
