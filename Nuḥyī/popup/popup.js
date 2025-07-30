// Nuḥyī Chrome Extension - Popup Script
class NuhyiExtension {
    constructor() {
        this.currentVerse = null;
        this.prayerTimes = null;
        this.nextPrayer = null;
        this.adhkarData = null;
        this.settings = {
            darkMode: false,
            city: 'Mecca',
            country: 'Saudi Arabia',
            azanSound: true,
            azanAudio: 'makkah',
            salahReminder: true,
            prePrayerMinutes: 10, // New setting for pre-prayer reminder
            salahReminderHours: 2, // New setting for Salah reminder frequency
            prePrayerEnabled: true // New setting for pre-prayer toggle
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
        await this.loadInitialData();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['settings']);
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({ settings: this.settings });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        // Settings controls
        document.getElementById('darkMode').addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.applyTheme();
            this.saveSettings();
        });

        document.getElementById('azanSound').addEventListener('change', (e) => {
            this.settings.azanSound = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('salahReminder').addEventListener('change', (e) => {
            this.settings.salahReminder = e.target.checked;
            this.saveSettings();
            this.updateSalahReminder();
        });

        // Country and city selection
        document.getElementById('countrySelect').addEventListener('change', (e) => {
            this.settings.country = e.target.value;
            this.settings.city = '';
            this.saveSettings();
            populateCityDropdown(e.target.value);
            this.loadPrayerTimes();
        });

        document.getElementById('citySelect').addEventListener('change', (e) => {
            this.settings.city = e.target.value;
            this.saveSettings();
            this.loadPrayerTimes();
        });

        document.getElementById('azanAudio').addEventListener('change', (e) => {
            this.settings.azanAudio = e.target.value;
            this.saveSettings();
        });

        // Adhkar category buttons
        document.getElementById('morningAdhkar').addEventListener('click', () => {
            this.loadAdhkar('morning');
            this.updateAdhkarButtons('morning');
        });

        document.getElementById('eveningAdhkar').addEventListener('click', () => {
            this.loadAdhkar('evening');
            this.updateAdhkarButtons('evening');
        });

        // Pre-prayer toggle
        document.getElementById('prePrayerToggle').addEventListener('change', (e) => {
            this.settings.prePrayerEnabled = e.target.checked;
            this.saveSettings();
        });

        // New settings for reminder customization
        document.getElementById('prePrayerMinutes').addEventListener('change', (e) => {
            this.settings.prePrayerMinutes = parseInt(e.target.value) || 10;
            this.saveSettings();
        });

        document.getElementById('salahReminderHours').addEventListener('change', (e) => {
            this.settings.salahReminderHours = parseInt(e.target.value) || 2;
            this.saveSettings();
            this.updateSalahReminder();
        });

        // Quran refresh
        document.getElementById('refreshVerse').addEventListener('click', () => {
            this.loadRandomVerse();
        });

        // Add reminder button
        document.getElementById('addReminder').addEventListener('click', () => {
            this.addReminder();
        });

        // Close settings on outside click
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'dark:text-blue-400', 'border-blue-600', 'dark:border-blue-400');
            btn.classList.add('text-gray-500', 'dark:text-gray-400');
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active', 'text-blue-600', 'dark:text-blue-400', 'border-blue-600', 'dark:border-blue-400');
        activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('active');
        });

        const activeContent = document.getElementById(tabName);
        activeContent.classList.remove('hidden');
        activeContent.classList.add('active');

        // Load tab-specific data
        switch (tabName) {
            case 'quran':
                if (!this.currentVerse) this.loadRandomVerse();
                break;
            case 'azan':
                if (!this.prayerTimes) this.loadPrayerTimes();
                break;
            case 'adhkar':
                if (!this.adhkarData) this.loadAdhkar('morning');
                break;
            case 'reminders':
                this.loadReminders();
                break;
        }
    }

    async loadInitialData() {
        // Detect location first
        await this.detectLocation();
        
        // Load Quran verse first
        await this.loadRandomVerse();
        
        // Load other data in background
        this.loadPrayerTimes();
        this.loadAdhkar('morning');
        this.updateAdhkarButtons('morning');
        this.loadReminders();
    }

    async detectLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        // Use reverse geocoding to get city and country
                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.city && data.countryName) {
                                this.settings.city = data.city;
                                this.settings.country = data.countryName;
                                this.saveSettings();
                            }
                        }
                    },
                    (error) => {
                        console.log('Geolocation not available or denied');
                    }
                );
            }
        } catch (error) {
            console.error('Error detecting location:', error);
        }
    }

    async loadRandomVerse() {
        const container = document.getElementById('verseContainer');
        container.innerHTML = this.getLoadingHTML();

        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/random');
            const data = await response.json();

            if (data.code === 200 && data.data) {
                this.currentVerse = {
                    text: data.data.text,
                    surah: data.data.surah.englishName,
                    ayah: data.data.numberInSurah,
                    translation: data.data.translation?.text || 'Translation not available'
                };

                container.innerHTML = `
                    <div class="verse-text arabic-text">${this.currentVerse.text}</div>
                    <div class="verse-info">
                        ${this.currentVerse.surah} - Verse ${this.currentVerse.ayah}
                    </div>
                    <div class="verse-info text-sm mt-2">
                        ${this.currentVerse.translation}
                    </div>
                `;
            } else {
                throw new Error('Invalid response from Quran API');
            }
        } catch (error) {
            console.error('Error fetching verse:', error);
            container.innerHTML = `
                <div class="text-center text-gray-600 dark:text-gray-400 py-4">
                    <p>عذراً، حدث خطأ في تحميل الآية</p>
                    <p class="text-sm mt-2">Sorry, there was an error loading the verse</p>
                </div>
            `;
        }
    }

    async loadPrayerTimes() {
        const container = document.getElementById('prayerTimes');
        container.innerHTML = this.getLoadingHTML();

        try {
            // Try to get cached prayer times first
            const cached = await chrome.storage.local.get(['prayerTimes', 'prayerTimesDate']);
            const today = new Date().toDateString();

            if (cached.prayerTimes && cached.prayerTimesDate === today) {
                this.prayerTimes = cached.prayerTimes;
                this.updatePrayerTimesDisplay();
                return;
            }

            // Fetch new prayer times using HTTPS
            const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(this.settings.city)}&country=${encodeURIComponent(this.settings.country)}&method=2`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.code === 200 && data.data && data.data.timings) {
                this.prayerTimes = data.data.timings;
                
                // Cache the prayer times
                await chrome.storage.local.set({
                    prayerTimes: this.prayerTimes,
                    prayerTimesDate: today
                });

                this.updatePrayerTimesDisplay();
            } else {
                throw new Error('Invalid response from prayer times API');
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            container.innerHTML = `
                <div class="text-center text-gray-600 dark:text-gray-400 py-4">
                    <p>عذراً، حدث خطأ في تحميل أوقات الصلاة</p>
                    <p class="text-sm mt-2">Sorry, there was an error loading prayer times</p>
                    <p class="text-xs mt-1">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    updatePrayerTimesDisplay() {
        if (!this.prayerTimes) return;

        const container = document.getElementById('prayerTimes');
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNames = {
            'Fajr': 'الفجر',
            'Dhuhr': 'الظهر',
            'Asr': 'العصر',
            'Maghrib': 'المغرب',
            'Isha': 'العشاء'
        };

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        let nextPrayer = null;
        let nextPrayerTime = Infinity;

        const prayerTimesHTML = prayers.map(prayer => {
            const time = this.prayerTimes[prayer];
            if (!time) return '';

            const [hours, minutes] = time.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;
            
            if (prayerMinutes > currentTime && prayerMinutes < nextPrayerTime) {
                nextPrayer = prayer;
                nextPrayerTime = prayerMinutes;
            }

            const isNext = prayer === nextPrayer;
            const timeClass = isNext ? 'prayer-time next' : 'prayer-time';

            return `
                <div class="${timeClass}">
                    <span class="font-medium text-gray-800 dark:text-white">${prayerNames[prayer]}</span>
                    <span class="text-gray-600 dark:text-gray-300 font-mono">${time}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = prayerTimesHTML;
    }

    async loadAdhkar(category = 'morning') {
        const container = document.getElementById('adhkarContainer');
        container.innerHTML = this.getLoadingHTML();

        try {
            // Load adhkar data from local storage or use default
            const cached = await chrome.storage.local.get(['adhkarData']);
            
            if (cached.adhkarData && cached.adhkarData[category]) {
                this.adhkarData = cached.adhkarData;
            } else {
                // Use default adhkar data
                this.adhkarData = this.getDefaultAdhkar();
                await chrome.storage.local.set({ adhkarData: this.adhkarData });
            }

            const categoryAdhkar = this.adhkarData[category] || [];
            
            if (categoryAdhkar.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-gray-600 dark:text-gray-400 py-4">
                        <p>لا توجد أذكار متاحة لهذه الفئة</p>
                        <p class="text-sm mt-2">No adhkar available for this category</p>
                    </div>
                `;
                return;
            }

            const adhkarHTML = categoryAdhkar.map(dhikr => `
                <div class="dhikr-item">
                    <div class="dhikr-text arabic-text">${dhikr.text}</div>
                    <div class="dhikr-count">${dhikr.count} مرة</div>
                </div>
            `).join('');

            container.innerHTML = adhkarHTML;
        } catch (error) {
            console.error('Error loading adhkar:', error);
            container.innerHTML = `
                <div class="text-center text-gray-600 dark:text-gray-400 py-4">
                    <p>عذراً، حدث خطأ في تحميل الأذكار</p>
                    <p class="text-sm mt-2">Sorry, there was an error loading adhkar</p>
                    <p class="text-xs mt-1">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    getDefaultAdhkar() {
        return {
            morning: [
                { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', count: 1 },
                { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', count: 1 },
                { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
                { text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 100 }
            ],
            evening: [
                { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', count: 1 },
                { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', count: 1 },
                { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
                { text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 100 }
            ],
            sleep: [
                { text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ', count: 1 },
                { text: 'اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَى مِنْكَ إِلاَّ إِلَيْكَ', count: 1 },
                { text: 'سُبْحَانَ اللَّهِ', count: 33 },
                { text: 'الْحَمْدُ لِلَّهِ', count: 33 },
                { text: 'اللَّهُ أَكْبَرُ', count: 34 }
            ]
        };
    }

    updateAdhkarButtons(activeCategory) {
        const morningBtn = document.getElementById('morningAdhkar');
        const eveningBtn = document.getElementById('eveningAdhkar');
        
        if (activeCategory === 'morning') {
            morningBtn.className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors';
            eveningBtn.className = 'px-3 py-1 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
        } else {
            morningBtn.className = 'px-3 py-1 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
            eveningBtn.className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors';
        }
    }

    async loadReminders() {
        const container = document.getElementById('remindersList');
        
        try {
            const result = await chrome.storage.sync.get(['reminders']);
            const reminders = result.reminders || [];
            
            if (reminders.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-gray-600 dark:text-gray-400 py-4">
                        <p>لا توجد تذكيرات</p>
                        <p class="text-sm mt-2">No reminders set</p>
                    </div>
                `;
                return;
            }

            const remindersHTML = reminders.map((reminder, index) => `
                <div class="reminder-item">
                    <div class="reminder-text">${reminder.text}</div>
                    <div class="reminder-time">${reminder.time}</div>
                    <button onclick="nuhyi.removeReminder(${index})" class="text-red-500 hover:text-red-700 ml-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `).join('');

            container.innerHTML = remindersHTML;
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    }

    async addReminder() {
        const textInput = document.getElementById('reminderText');
        const timeInput = document.getElementById('reminderTime');
        
        const text = textInput.value.trim();
        const time = timeInput.value;
        
        if (!text || !time) return;

        try {
            const result = await chrome.storage.sync.get(['reminders']);
            const reminders = result.reminders || [];
            
            reminders.push({ text, time });
            
            await chrome.storage.sync.set({ reminders });
            
            // Clear form
            textInput.value = '';
            timeInput.value = '';
            
            // Reload reminders
            this.loadReminders();
            
            // Schedule alarm
            this.scheduleReminder(text, time);
        } catch (error) {
            console.error('Error adding reminder:', error);
        }
    }

    async removeReminder(index) {
        try {
            const result = await chrome.storage.sync.get(['reminders']);
            const reminders = result.reminders || [];
            
            reminders.splice(index, 1);
            
            await chrome.storage.sync.set({ reminders });
            this.loadReminders();
        } catch (error) {
            console.error('Error removing reminder:', error);
        }
    }

    scheduleReminder(text, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const delayInMinutes = (reminderTime - now) / (1000 * 60);
        
        chrome.alarms.create(`reminder_${Date.now()}`, {
            delayInMinutes: delayInMinutes
        });
    }

    updateSalahReminder() {
        if (this.settings.salahReminder) {
            // Schedule salah reminder with user-defined frequency
            const frequencyMinutes = this.settings.salahReminderHours * 60;
            chrome.alarms.create('salah_reminder', {
                delayInMinutes: frequencyMinutes,
                periodInMinutes: frequencyMinutes
            });
        } else {
            chrome.alarms.clear('salah_reminder');
        }
    }

    openSettings() {
        // Initialize country and city dropdowns
        populateCountryDropdown();
        
        // Set current country and populate cities
        const countrySelect = document.getElementById('countrySelect');
        const citySelect = document.getElementById('citySelect');
        
        countrySelect.value = this.settings.country;
        populateCityDropdown(this.settings.country);
        citySelect.value = this.settings.city;
        
        // Set other settings
        document.getElementById('darkMode').checked = this.settings.darkMode;
        document.getElementById('azanSound').checked = this.settings.azanSound;
        document.getElementById('salahReminder').checked = this.settings.salahReminder;
        document.getElementById('azanAudio').value = this.settings.azanAudio;
        document.getElementById('prePrayerMinutes').value = this.settings.prePrayerMinutes;
        document.getElementById('salahReminderHours').value = this.settings.salahReminderHours;
        document.getElementById('prePrayerToggle').checked = this.settings.prePrayerEnabled;
        
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    applyTheme() {
        if (this.settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    getLoadingHTML() {
        return `
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        `;
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nuhyi = new NuhyiExtension();
}); 