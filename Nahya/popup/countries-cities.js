// Countries and Cities data for Nuḥyī extension
const countriesAndCities = {
    "Saudi Arabia": [
        "Mecca", "Medina", "Riyadh", "Jeddah", "Dammam", "Taif", "Abha", "Tabuk", "Jizan", "Najran"
    ],
    "Egypt": [
        "Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor", "Aswan", "Port Said", "Suez", "Mansoura", "Tanta"
    ],
    "United Arab Emirates": [
        "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
    ],
    "Qatar": [
        "Doha", "Al Wakrah", "Al Khor", "Lusail", "Al Rayyan", "Umm Salal"
    ],
    "Kuwait": [
        "Kuwait City", "Salmiya", "Hawally", "Jahra", "Farwaniya", "Mubarak Al-Kabeer"
    ],
    "Bahrain": [
        "Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town", "Sitra"
    ],
    "Oman": [
        "Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibri"
    ],
    "Jordan": [
        "Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba"
    ],
    "Lebanon": [
        "Beirut", "Tripoli", "Sidon", "Tyre", "Zahle", "Baalbek"
    ],
    "Syria": [
        "Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Tartus"
    ],
    "Iraq": [
        "Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala"
    ],
    "Yemen": [
        "Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb", "Mukalla"
    ],
    "Palestine": [
        "Jerusalem", "Gaza", "Ramallah", "Bethlehem", "Nablus", "Hebron"
    ],
    "Turkey": [
        "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Konya"
    ],
    "Pakistan": [
        "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"
    ],
    "India": [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"
    ],
    "Bangladesh": [
        "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal"
    ],
    "Malaysia": [
        "Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Johor Bahru", "Malacca City"
    ],
    "Indonesia": [
        "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Palembang"
    ],
    "United States": [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"
    ],
    "United Kingdom": [
        "London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds"
    ],
    "Canada": [
        "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa"
    ],
    "Australia": [
        "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"
    ],
    "Germany": [
        "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart"
    ],
    "France": [
        "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes"
    ],
    "Italy": [
        "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa"
    ],
    "Spain": [
        "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga"
    ]
};

// Function to populate country dropdown
function populateCountryDropdown() {
    const countrySelect = document.getElementById('countrySelect');
    if (!countrySelect) return;
    
    countrySelect.innerHTML = '<option value="">اختر الدولة</option>';
    
    Object.keys(countriesAndCities).forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Function to populate city dropdown based on selected country
function populateCityDropdown(selectedCountry) {
    const citySelect = document.getElementById('citySelect');
    if (!citySelect) return;
    
    citySelect.innerHTML = '<option value="">اختر المدينة</option>';
    
    if (selectedCountry && countriesAndCities[selectedCountry]) {
        countriesAndCities[selectedCountry].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// Function to get country from city name
function getCountryFromCity(cityName) {
    for (const [country, cities] of Object.entries(countriesAndCities)) {
        if (cities.includes(cityName)) {
            return country;
        }
    }
    return null;
}

// Export functions for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        countriesAndCities,
        populateCountryDropdown,
        populateCityDropdown,
        getCountryFromCity
    };
} 