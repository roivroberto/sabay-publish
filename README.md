# Sabay Publish
### Simultaneous bilingual news publishing for modern Philippine journalism.

[![Language](https://img.shields.io/github/languages/top/roivroberto/sabay-publish)](https://github.com/roivroberto/sabay-publish)
[![Repo size](https://img.shields.io/github/repo-size/roivroberto/sabay-publish)](https://github.com/roivroberto/sabay-publish)
[![Last commit](https://img.shields.io/github/last-commit/roivroberto/sabay-publish)](https://github.com/roivroberto/sabay-publish)
[![Stars](https://img.shields.io/github/stars/roivroberto/sabay-publish?style=social)](https://github.com/roivroberto/sabay-publish)
[![Forks](https://img.shields.io/github/forks/roivroberto/sabay-publish?style=social)](https://github.com/roivroberto/sabay-publish)
[![License](https://img.shields.io/github/license/roivroberto/sabay-publish)](https://github.com/roivroberto/sabay-publish)

---

## 📸 Demo

![Demo](assets/demo.png)

---

## 📖 About

Paraluman is a youth-led Philippine news platform focused on making journalism more accessible in both English and Filipino. This repository contains the **Sabay Publish** prototype, a system that allows journalists to draft stories in English, automatically generate Filipino versions using AI, and manage a professional editorial workflow from review to publication.

Built as a full-stack solution, it tackles the challenge of reliable multi-language news delivery without sacrificing speed or clarity.

---

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Convex](https://www.convex.dev/) (Real-time queries & mutations)
- **Authentication:** [Clerk](https://clerk.com/) (Role-based access)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (via Base UI) & [shadcn/ui](https://ui.shadcn.com/)
- **AI/Translation:** [Google Cloud Translation API](https://cloud.google.com/translate)
- **Testing:** [Playwright](https://playwright.dev/) (E2E testing)

---

## ✨ Key Features

- ✍️ **Sabay Publish:** Draft an English article and get an instant, high-quality Filipino translation.
- 🔍 **Editorial Review:** Dedicated workspace for editors to review, refine, and approve translations.
- 🔐 **Secure Workflow:** Role-based access (Writer/Editor) ensures that only authorized staff can publish.
- ⚡ **Real-time Sync:** Live updates on article status and workflow history.
- 📱 **Public Landing:** Optimized public view for readers to consume news in their preferred language.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later
- [pnpm](https://pnpm.io/) 9.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/roivroberto/sabay-publish.git
   cd sabay-publish
   ```

2. Install dependencies:
   ```bash
   cd web
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your Clerk, Convex, and Google Cloud credentials
   ```

4. Run the development server:
   ```bash
   pnpm convex:dev  # Terminal 1: Backend
   pnpm dev         # Terminal 2: Frontend
   ```

---

## 📄 License

This project is licensed under the MIT License.
