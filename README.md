# 🎨 Meshy Downloader - Chrome Extension

A minimalist and elegant Chrome extension to easily download your 3D models from **Meshy.ai**.

## ✨ Features

- 🚀 **Automatic token extraction** - Instant detection of your Meshy.ai session
- 📋 **Display your models** - View all your projects at a glance
- ⬇️ **Direct download** - Get your .glb models with one click
- 📅 **Sort by date** - Most recent models first
- 🎯 **Clean and professional design** - Intuitive and polished interface
- ⚡ **Lightweight and fast** - No external dependencies

## 📦 Installation

### From source code

1. **Clone or download** this repository
   ```bash
   git clone https://github.com/Poure514/meshy-downloader.git
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
4. **Watch** your models display automatically
5. **Download** by clicking the ⬇️ Download button

Models are saved to your `Downloads/meshy_models/` folder

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
- Project title/name
- Creation date
- Status (SUCCEEDED, PENDING, FAILED)
- Download URL

### Smart Sorting
Models are automatically sorted by creation date (most recent first) for optimal browsing.

### Download Management
Each model is saved with its unique ID to avoid name conflicts.

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

- [ ] Téléchargement en batch
- [ ] 3D model preview
- [ ] Batch downloads
- [ ] Download history
- [ ] Custom settings
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
- 🐛 Open an [Issue](https://github.com/Poure514/meshy-downloader/issues)
- 💬 Leave a PR with a solution

---

**Made with ❤️ for the 3D community** 🎨
