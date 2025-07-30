# Nuḥyī - إحياء الروح بالإيمان

A spiritual Chrome extension that enhances your browsing experience with Islamic features including Quran verses, prayer times, Adhkar, and customizable reminders.

## Features

### 📖 Quran
- **Random Verses**: Display a random Quranic verse (Arabic + translation) on popup open
- **Refresh Button**: Get a new verse with a single click
- **Beautiful Display**: Clean, RTL-supported Arabic text rendering

### 🕌 Azan (Prayer Times)
- **Accurate Prayer Times**: Based on your location using the Aladhan API
- **Smart Location System**: Automatic detection + comprehensive country/city dropdown
- **Visual Notifications**: System notifications for each prayer time
- **Audio Alerts**: Customizable Azan sounds (Makkah, Madinah, Egypt styles)
- **Pre-Prayer Reminders**: Get notified before prayer time (customizable minutes)
- **Next Prayer Highlight**: Automatically highlights the upcoming prayer

### 🎨 Modern UI
- **Beautiful Blue & White Color Scheme**: Clean, modern design
- **Dark Mode Support**: Toggle between light and dark themes
- **RTL Layout**: Proper Right-to-Left support for Arabic text
- **Responsive Design**: Works perfectly in popup format
- **Smooth Animations**: Elegant transitions and hover effects

### 🌍 Smart Location System
- **Automatic Detection**: Uses browser geolocation to detect your city and country
- **Comprehensive Dropdown**: 25+ countries with major cities
- **Fallback Support**: Manual selection if detection fails
- **Accurate Times**: Precise prayer times for your specific location

### 📿 Adhkar
- **Morning/Evening Adhkar**: Complete collection of morning and evening supplications
- **Sleep Adhkar**: Bedtime supplications and Tasbih
- **Category Switching**: Easy toggle between different Adhkar categories
- **Count Display**: Shows recommended repetition counts for each Dhikr

### ⏰ Reminders
- **Custom Reminders**: Set personal reminders for daily Islamic tasks
- **Prayer Reminders**: General pre-prayer notifications (customizable timing)
- **Salah on Prophet ﷺ**: Periodic reminders to send blessings on Prophet Muhammad
- **Flexible Scheduling**: Set custom frequencies for all reminder types

### ⚙️ Customization
- **Dark/Light Mode**: Toggle between themes
- **Location Settings**: Manual city input with geolocation fallback
- **Azan Audio Selection**: Choose from different Azan styles
- **Reminder Customization**: 
  - Pre-prayer reminder minutes (0-60 minutes)
  - Salah on Prophet reminder frequency (1-24 hours)
- **Feature Toggles**: Enable/disable specific features

## Recent Updates & Fixes

### ✅ Fixed Issues
- **Prayer Times Loading Error**: Fixed by switching to HTTPS API calls
- **Adhkar Loading Error**: Improved data structure and error handling
- **API Compatibility**: Updated to use secure HTTPS endpoints
- **Location Detection**: Enhanced with comprehensive country/city system

### 🆕 New Features
- **Beautiful Blue & White Design**: Modern, clean color scheme
- **Smart Location System**: Automatic detection + 25+ countries dropdown
- **Enhanced Adhkar Interface**: Button-based category switching
- **Pre-Prayer Reminders**: Get notified before each prayer (user-defined minutes)
- **Customizable Salah Reminders**: Set frequency for Salah on Prophet notifications
- **Improved Settings UI**: More intuitive customization options
- **Better Performance**: Optimized loading and caching

## Installation

### For Development
1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the Nuḥyī extension folder
5. The extension will appear in your extensions list

### For Users
1. Download the extension from Chrome Web Store (coming soon)
2. Click "Add to Chrome" to install
3. The extension icon will appear in your browser toolbar

## Usage

### Basic Usage
1. Click the Nuḥyī icon in your browser toolbar
2. The popup will open showing a random Quran verse
3. Use the tabs to navigate between features:
   - **القرآن**: Quran verses
   - **الأذان**: Prayer times
   - **الأذكار**: Adhkar
   - **التذكيرات**: Reminders

### Settings Configuration
1. Click the settings gear icon in the popup header
2. Configure your preferences:
   - **Theme**: Light or dark mode
   - **Location**: Your city for accurate prayer times
   - **Azan Audio**: Choose your preferred Azan style
   - **Pre-Prayer Minutes**: Set reminder time before prayers
   - **Salah Reminder Hours**: Set frequency for Salah on Prophet reminders

### Adding Reminders
1. Go to the Reminders tab
2. Enter reminder text and time
3. Click "إضافة تذكيرة" (Add Reminder)
4. The reminder will be scheduled and stored

## Technical Details

### APIs Used
- **Al Quran Cloud API**: For random Quran verses
- **Aladhan API**: For prayer times and location-based calculations
- **BigDataCloud API**: For reverse geocoding (location detection)
- **Chrome Extensions API**: For notifications, storage, and alarms

### Browser Compatibility
- ✅ Google Chrome (Version 88+)
- ✅ Microsoft Edge (Version 88+)
- ✅ Other Chromium-based browsers

### Permissions
- `notifications`: For prayer time and reminder alerts
- `geolocation`: For automatic location detection
- `storage`: For saving user settings and cached data
- `alarms`: For scheduling notifications and reminders

## Project Structure

```
nuhyi-extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker for background tasks
├── content.js                 # Content script (optional)
├── popup/
│   ├── index.html            # Popup UI
│   ├── popup.js              # Popup logic
│   └── styles.css            # Custom styles
├── assets/
│   ├── icons/                # Extension icons
│   └── audio/                # Azan audio files
├── README.md                 # This file
├── LICENSE                   # MIT License
└── test-extension.html       # Testing page
```

## Development

### Prerequisites
- Modern web browser (Chrome/Edge)
- Basic knowledge of HTML, CSS, JavaScript
- Chrome Extensions development experience (helpful)

### Local Development
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Nuḥyī extension
4. Test your changes in the popup

### Testing
- Use the included `test-extension.html` file to test API connectivity
- Check browser console for any errors
- Test all features: Quran, Azan, Adhkar, Reminders
- Verify notifications work correctly

## Troubleshooting

### Common Issues

**Prayer Times Not Loading**
- Check internet connection
- Verify city name is correct
- Try refreshing the extension

**Adhkar Not Displaying**
- Check if the extension is properly loaded
- Try switching between categories
- Refresh the popup

**Notifications Not Working**
- Ensure notifications are enabled in browser settings
- Check extension permissions
- Verify alarm scheduling in background script

**Extension Not Loading**
- Make sure all files are present
- Check manifest.json for syntax errors
- Verify Chrome version compatibility

### Debug Mode
1. Right-click the extension icon
2. Select "Inspect popup"
3. Check the console for error messages
4. Use the test page (`test-extension.html`) to verify API connectivity

## Contributing

We welcome contributions! Here's how you can help:

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Improvement
- Additional Adhkar categories
- More Azan audio options
- Enhanced UI/UX
- Performance optimizations
- Additional language support
- Offline functionality

### Code Style
- Use ES6+ JavaScript
- Follow existing code structure
- Add comments for complex logic
- Test all changes thoroughly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Al Quran Cloud API**: For providing Quran data
- **Aladhan API**: For prayer times calculation
- **Hisn Al-Muslim**: For Adhkar content
- **Noto Naskh Arabic**: For beautiful Arabic font rendering
- **Tailwind CSS**: For modern, responsive styling

## Changelog

### Version 1.0.0 (Current)
- ✅ Initial release with all core features
- ✅ Fixed prayer times loading issues
- ✅ Fixed Adhkar loading issues
- ✅ Added pre-prayer reminder functionality
- ✅ Added customizable Salah on Prophet reminders
- ✅ Improved error handling and user feedback
- ✅ Enhanced settings UI with new customization options

### Planned Features
- [ ] Offline mode support
- [ ] Multiple language support
- [ ] Prayer time widgets for websites
- [ ] Advanced reminder scheduling
- [ ] Community features
- [ ] Mobile app companion

---

**نُحيي** - إحياء الروح بالإيمان

*Reviving the soul with faith* 