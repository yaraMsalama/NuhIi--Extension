// Nuḥyī Chrome Extension - Background Service Worker

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Nuḥyī extension installed');
    
    // Set up default settings
    const defaultSettings = {
        darkMode: false,
        city: 'Mecca',
        country: 'Saudi Arabia',
        azanSound: true,
        azanAudio: 'makkah',
        salahReminder: true,
        prePrayerMinutes: 10,
        salahReminderHours: 2,
        prePrayerEnabled: true,
        snoozeMinutes: 5
    };
    
    try {
        await chrome.storage.sync.set({ settings: defaultSettings });
        console.log('Default settings initialized');
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
    
    // Schedule initial prayer times fetch
    await schedulePrayerTimesFetch();
    
    // Set up salah reminder if enabled
    const result = await chrome.storage.sync.get(['settings']);
    if (result.settings?.salahReminder) {
        scheduleSalahReminder(result.settings.salahReminderHours);
    }
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm triggered:', alarm.name);
    
    if (alarm.name.startsWith('azan_')) {
        await handleAzanAlarm(alarm);
    } else if (alarm.name.startsWith('pre_prayer_')) {
        await handlePrePrayerAlarm(alarm);
    } else if (alarm.name.startsWith('reminder_')) {
        await handleReminderAlarm(alarm);
    } else if (alarm.name === 'salah_reminder') {
        await handleSalahReminder();
    } else if (alarm.name === 'prayer_times_fetch') {
        await schedulePrayerTimesFetch();
    }
});

// Handle Azan alarms
async function handleAzanAlarm(alarm) {
    const prayerName = alarm.name.split('_')[1];
    const prayerNames = {
        'fajr': 'الفجر',
        'dhuhr': 'الظهر',
        'asr': 'العصر',
        'maghrib': 'المغرب',
        'isha': 'العشاء'
    };
    
    const arabicName = prayerNames[prayerName] || prayerName;
    
    try {
        // Get user settings
        const result = await chrome.storage.sync.get(['settings']);
        const settings = result.settings || {};
        
        // Create notification
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon128.png',
            title: `وقت صلاة ${arabicName}`,
            message: `حان وقت صلاة ${arabicName}. تقبل الله منا ومنكم.`,
            requireInteraction: true,
            silent: !settings.azanSound
        });
        
        // Play Azan sound if enabled
        if (settings.azanSound) {
            const audioFile = `assets/audio/azan_${settings.azanAudio || 'makkah'}.mp3`;
            try {
                // Note: Audio playback in service workers is limited
                // This would need to be handled differently in a real implementation
                console.log('Azan sound should play:', audioFile);
            } catch (error) {
                console.error('Error playing Azan sound:', error);
            }
        }
        
        // Schedule next prayer alarm
        await scheduleNextPrayerAlarm();
        
    } catch (error) {
        console.error('Error handling Azan alarm:', error);
    }
}

// Handle pre-prayer reminder alarms
async function handlePrePrayerAlarm(alarm) {
    const prayerName = alarm.name.split('_')[2];
    const prayerNames = {
        'fajr': 'Fajr',
        'dhuhr': 'Dhuhr',
        'asr': 'Asr',
        'maghrib': 'Maghrib',
        'isha': 'Isha'
    };
    
    const englishName = prayerNames[prayerName] || prayerName;
    
    try {
        // Get user settings
        const result = await chrome.storage.sync.get(['settings']);
        const settings = result.settings || {};
        const prePrayerMinutes = settings.prePrayerMinutes || 10;
        
        // Send message to popup to show prayer reminder popup
        try {
            await chrome.action.openPopup();
            // Wait a bit for popup to open
            setTimeout(async () => {
                await chrome.runtime.sendMessage({
                    action: 'showPrayerReminderPopup',
                    prayerName: englishName,
                    timeRemaining: prePrayerMinutes.toString()
                });
            }, 500);
        } catch (error) {
            console.log('Popup not open, showing notification instead');
            // Fallback to notification if popup is not open
            const arabicNames = {
                'Fajr': 'الفجر',
                'Dhuhr': 'الظهر',
                'Asr': 'العصر',
                'Maghrib': 'المغرب',
                'Isha': 'العشاء'
            };
            
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'assets/icons/icon128.png',
                title: `تذكيرة قبل صلاة ${arabicNames[englishName] || englishName}`,
                message: `سيحين وقت صلاة ${arabicNames[englishName] || englishName} خلال ${prePrayerMinutes} دقائق. استعد للصلاة.`,
                requireInteraction: false,
                silent: false
            });
        }
        
    } catch (error) {
        console.error('Error handling pre-prayer alarm:', error);
    }
}

// Handle reminder alarms
async function handleReminderAlarm(alarm) {
    try {
        // Get reminders from storage
        const result = await chrome.storage.sync.get(['reminders']);
        const reminders = result.reminders || [];
        
        // Find the reminder by alarm ID
        const reminderIndex = reminders.findIndex((_, index) => 
            alarm.name === `reminder_${Date.now() - (reminders.length - index) * 60000}`
        );
        
        if (reminderIndex !== -1) {
            const reminder = reminders[reminderIndex];
            
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'assets/icons/icon128.png',
                title: 'تذكيرة',
                message: reminder.text,
                requireInteraction: true
            });
            
            // Reschedule for tomorrow
            scheduleReminder(reminder.text, reminder.time);
        }
    } catch (error) {
        console.error('Error handling reminder alarm:', error);
    }
}

// Handle Salah on Prophet reminder
async function handleSalahReminder() {
    const salahMessages = [
        'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
        'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
        'اللَّهُمَّ صَلِّ عَلَى نَبِيِّنَا مُحَمَّدٍ'
    ];
    
    const randomMessage = salahMessages[Math.floor(Math.random() * salahMessages.length)];
    
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon128.png',
            title: 'الصلاة على النبي ﷺ',
            message: randomMessage,
            requireInteraction: false
        });
    } catch (error) {
        console.error('Error handling Salah reminder:', error);
    }
}

// Schedule prayer times fetch
async function schedulePrayerTimesFetch() {
    try {
        // Clear existing alarm
        await chrome.alarms.clear('prayer_times_fetch');
        
        // Schedule for next day at 00:01
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 1, 0, 0);
        
        const delayInMinutes = (tomorrow - now) / (1000 * 60);
        
        await chrome.alarms.create('prayer_times_fetch', {
            delayInMinutes: delayInMinutes
        });
        
        // Fetch prayer times for today
        await fetchAndCachePrayerTimes();
        
    } catch (error) {
        console.error('Error scheduling prayer times fetch:', error);
    }
}

// Fetch and cache prayer times
async function fetchAndCachePrayerTimes() {
    try {
        const result = await chrome.storage.sync.get(['settings']);
        const settings = result.settings || { city: 'Mecca', country: 'Saudi Arabia' };
        
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=2`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.timings) {
            const today = new Date().toDateString();
            
            await chrome.storage.local.set({
                prayerTimes: data.data.timings,
                prayerTimesDate: today
            });
            
            // Schedule Azan alarms
            await scheduleAzanAlarms(data.data.timings);
            
            console.log('Prayer times cached successfully');
        } else {
            throw new Error('Invalid response from prayer times API');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
    }
}

// Schedule Azan alarms
async function scheduleAzanAlarms(timings) {
    try {
        // Clear existing Azan and pre-prayer alarms
        const alarms = await chrome.alarms.getAll();
        for (const alarm of alarms) {
            if (alarm.name.startsWith('azan_') || alarm.name.startsWith('pre_prayer_')) {
                await chrome.alarms.clear(alarm.name);
            }
        }
        
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const now = new Date();
        const today = now.toDateString();
        
        // Get user settings for pre-prayer reminder
        const result = await chrome.storage.sync.get(['settings']);
        const settings = result.settings || {};
        const prePrayerMinutes = settings.prePrayerMinutes || 10;
        
        for (const prayer of prayers) {
            const time = timings[prayer];
            if (!time) continue;
            
            const [hours, minutes] = time.split(':').map(Number);
            const prayerTime = new Date();
            prayerTime.setHours(hours, minutes, 0, 0);
            
            // If prayer time has passed today, schedule for tomorrow
            if (prayerTime <= now) {
                prayerTime.setDate(prayerTime.getDate() + 1);
            }
            
            const delayInMinutes = (prayerTime - now) / (1000 * 60);
            
            // Schedule Azan alarm
            await chrome.alarms.create(`azan_${prayer.toLowerCase()}`, {
                delayInMinutes: delayInMinutes
            });
            
            // Schedule pre-prayer reminder if enabled and time allows
            if (settings.prePrayerEnabled && prePrayerMinutes > 0 && delayInMinutes > prePrayerMinutes) {
                const prePrayerDelay = delayInMinutes - prePrayerMinutes;
                await chrome.alarms.create(`pre_prayer_${prayer.toLowerCase()}`, {
                    delayInMinutes: prePrayerDelay
                });
            }
        }
        
        console.log('Azan and pre-prayer alarms scheduled successfully');
    } catch (error) {
        console.error('Error scheduling Azan alarms:', error);
    }
}

// Schedule next prayer alarm (called after each prayer)
async function scheduleNextPrayerAlarm() {
    try {
        const cached = await chrome.storage.local.get(['prayerTimes']);
        if (cached.prayerTimes) {
            await scheduleAzanAlarms(cached.prayerTimes);
        }
    } catch (error) {
        console.error('Error scheduling next prayer alarm:', error);
    }
}

// Schedule Salah reminder with user-defined frequency
function scheduleSalahReminder(hours = 2) {
    const frequencyMinutes = hours * 60;
    chrome.alarms.create('salah_reminder', {
        delayInMinutes: frequencyMinutes,
        periodInMinutes: frequencyMinutes
    });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPrayerTimes') {
        chrome.storage.local.get(['prayerTimes'], (result) => {
            sendResponse({ prayerTimes: result.prayerTimes });
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'updateSettings') {
        chrome.storage.sync.set({ settings: request.settings }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'scheduleReminder') {
        scheduleReminder(request.text, request.time);
        sendResponse({ success: true });
    }
    
    if (request.action === 'updateSalahReminder') {
        if (request.enabled) {
            scheduleSalahReminder(request.hours);
        } else {
            chrome.alarms.clear('salah_reminder');
        }
        sendResponse({ success: true });
    }
});

// Schedule a reminder
function scheduleReminder(text, time) {
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

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
    // Open popup when notification is clicked
    chrome.action.openPopup();
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('Nuḥyī extension started');
    
    // Refresh prayer times and schedules
    await schedulePrayerTimesFetch();
    
    // Check if salah reminder should be enabled
    const result = await chrome.storage.sync.get(['settings']);
    if (result.settings?.salahReminder) {
        scheduleSalahReminder(result.settings.salahReminderHours);
    }
});

// Handle extension update
chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload();
}); 