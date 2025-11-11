# 🎨 Meshy Downloader - Chrome Extension

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)
![GitHub forks](https://img.shields.io/github/forks/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)
![GitHub watchers](https://img.shields.io/github/watchers/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)
![GitHub issues](https://img.shields.io/github/issues/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)

![GitHub last commit](https://img.shields.io/github/last-commit/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)
![GitHub license](https://img.shields.io/github/license/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)
![GitHub repo size](https://img.shields.io/github/repo-size/Pouare514/meshy-downloader?style=for-the-badge&logo=github&logoColor=white)

</div>

A minimalist and elegant Chrome extension to easily download your 3D models from **Meshy.ai**.

## ✨ Features

- 🚀 **Automatic token extraction** - Instant detection of your Meshy.ai session
- 📋 **Display your models** - View all your projects at a glance
- 🖼️ **Preview images** - See thumbnail previews of your 3D models
- ⬇️ **Direct download** - Get your .glb models with one click
- 🎨 **Texture download** - Download texture files separately when available
- 📝 **Smart titles** - Prompts automatically used as titles when short (< 25 chars)
- 📅 **Sort by date** - Most recent models first
- 🎯 **Clean and professional design** - Intuitive and polished interface
- ⚡ **Lightweight and fast** - No external dependencies

## 📦 Installation

### From source code

1. **Clone or download** this repository
   ```bash
   git clone https://github.com/Pouare514/meshy-downloader.git
   cd meshy-downloader/meshy-downloader
   ```

2. **Open Chrome** and go to `chrome://extensions/`

3. **Enable Developer Mode** (top right corner)

4. **Click "Load unpacked"** and select the `meshy-downloader` folder

5. **Done!** 🎉 The extension is now installed

## 🔧 Usage

1. **Sign in** to [meshy.ai](https://meshy.ai) in Chrome
2. **Click** the extension icon
3. **Press** the "Fetch Models" button 📥
4. **Watch** your models display automatically with preview images
5. **Download** by clicking:
   - ⬇️ **Download Model** button for the .glb file
   - 🖼️ **Download Texture** button for the texture PNG (when available)

Models and textures are saved to your `Downloads/meshy_models/` folder

## 🏗️ Architecture

```
meshy-downloader/
├── manifest.json       # Extension configuration
├── content.js         # Supabase token extraction
├── background.js      # Service Worker (API & downloads)
├── popup.html         # User interface
├── popup.js           # Popup logic
└── styles.css         # Minimalist design
```

### Data flow

```
meshy.ai (authenticated)
    ↓
Supabase Cookies
    ↓
content.js (extraction)
    ↓
background.js (service worker)
    ↓
Meshy API (/web/v2/tasks)
    ↓
popup.js (display)
    ↓
User (download)
```

## 🔐 Security

- ✅ **No data is sent** to external servers
- ✅ **The token is only stored** locally in Chrome
- ✅ **Manifest V3** - Google's modern security standard
- ✅ **Transparent source code** - Auditable and verifiable

## 💻 Technologies

- **Manifest V3** - Latest version of Chrome Extensions
- **Vanilla JavaScript** - Zero dependencies
- **Fetch API** - Modern HTTP requests
- **Chrome Storage API** - Secure local storage

## 📋 Detailed Features

### Token Extraction
The extension automatically detects your session by reading Meshy.ai's Supabase cookies. The token is stored locally and never leaves your browser.

### Model Retrieval
Direct connection to Meshy API to retrieve:
- Model ID
- Project title/name (or prompt if < 25 characters)
- Preview image URL
- Creation date
- Status (SUCCEEDED, PENDING, FAILED)
- Model download URL (.glb)
- Texture download URL (.png) when available

### Smart Sorting
Models are automatically sorted by creation date (most recent first) for optimal browsing.

### Download Management
- Models are saved with their unique ID to avoid name conflicts
- Textures are saved as `{modelId}_texture.png`
- Both files are organized in the `meshy_models/` folder

### Smart Title Display
When a prompt is short (less than 25 characters), it automatically replaces the default title for better readability. For example, "Rei ayanami" will be displayed as the title instead of "Untitled Model".

### Preview Images
Each model card displays a thumbnail preview (80x80px) extracted from the Meshy API, making it easy to identify your models at a glance.

## 🐛 Troubleshooting

### "Ready to fetch your models" but no models appear

**Solution:**
- ✓ Make sure you're logged in to [meshy.ai](https://meshy.ai)
- ✓ Refresh the Meshy page (F5)
- ✓ Restart the extension

### The "Fetch Models" button doesn't respond

**Solution:**
- ✓ Check your internet connection
- ✓ Reload the extension (`chrome://extensions/` → Reload)
- ✓ Open the console (F12) to see errors

### "Token not found" error

**Solution:**
- ✓ Log out then log back in to Meshy.ai
- ✓ Wait 5 seconds after login before fetching

## 📈 Roadmap

- [x] Preview images
- [x] Texture download
- [x] Smart title from prompts
- [ ] Batch downloads
- [ ] Format support (GLB, USD, etc.)

## 📄 License

MIT - Free to use and modify

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 📤 Fork the project
- 🔨 Create a branch (`git checkout -b feature/AmazingFeature`)
- 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- 📮 Push to the branch (`git push origin feature/AmazingFeature`)
- 🔔 Open a Pull Request

## ⚠️ Disclaimer

This extension is a personal project not affiliated with Meshy.ai. Use it at your own risk. Respect Meshy.ai's terms of service.

## 📞 Support

Encountering an issue?
- 🐛 Open an [Issue](https://github.com/Pouare514/meshy-downloader/issues)
- 💬 Leave a PR with a solution

---

**Made with ❤️ for the 3D community** 🎨
