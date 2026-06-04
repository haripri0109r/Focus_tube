# FocusTube 🚀

Transform YouTube into a distraction-free learning environment.

## 📖 Overview

FocusTube is a browser extension designed to help students, developers, and lifelong learners stay productive on YouTube. The extension reduces distractions by filtering non-educational content, blocking Shorts, and prioritizing learning-focused videos, enabling users to maintain focus while studying or researching.

## ✨ Features

* 🎯 Educational content prioritization
* 🚫 YouTube Shorts blocking
* 🧹 Distraction-free homepage experience
* 📺 Channel whitelisting and management
* ⚙️ Customizable filtering preferences
* 💾 Persistent local storage using IndexedDB
* 🔄 Real-time feed filtering
* 🚀 Lightweight and fast performance
* 🔒 Privacy-focused (all data stored locally)

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Browser Extension

* Plasmo Framework
* Chrome Extension API

### Storage

* IndexedDB

## 🏗️ Architecture

```text
YouTube Page
      │
      ▼
Content Scanner
      │
      ▼
Filtering Engine
      │
 ┌────┴────┐
 │         │
Hide     Allow
Content  Content
      │
      ▼
Clean Learning Feed
```

## 🎯 Problem Statement

YouTube is one of the best learning platforms available today, but recommendation algorithms often promote entertainment content, Shorts, and distractions that reduce productivity.

FocusTube helps users:

* Stay focused on educational content
* Reduce time wasted on distractions
* Create a personalized learning environment
* Improve study and research efficiency

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/focustube.git
cd focustube
```

### Install Dependencies

```bash
npm install
```

### Start Development

```bash
npm run dev
```

### Build Extension

```bash
npm run build
```

### Load into Chrome

1. Open Chrome
2. Navigate to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the generated build folder

## 📸 Screenshots

Add screenshots here:

* Homepage Filtering
* Shorts Blocking
* Settings Panel
* Channel Management

## 🔒 Privacy

FocusTube does not collect, transmit, or sell user data.

All preferences and settings are stored locally on the user's device using IndexedDB.

## 🌟 Future Enhancements

* AI-based video classification
* Smart learning recommendations
* Productivity analytics dashboard
* Focus session tracking
* Cross-browser support
* Cloud synchronization

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Haripriyan A**

Passionate about building productivity tools, AI applications, and developer-focused solutions.
