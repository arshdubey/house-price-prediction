document.addEventListener('DOMContentLoaded', () => {
    const locateBtn = document.getElementById('locate-btn');
    const cityInput = document.getElementById('city');
    const areaInput = document.getElementById('area');
    const locationStatus = document.getElementById('location-status');
    const predictBtn = document.getElementById('predict-btn');
    const resultContainer = document.getElementById('result-container');
    const predictedPriceEl = document.getElementById('predicted-price');
    const priceRangeEl = document.getElementById('price-range');
    const convertCurrencyBtn = document.getElementById('convert-currency-btn');
    let lastPredictionUSD = null;

    // Setup Geolocation
    locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showLocationStatus('Geolocation is not supported by your browser', 'error');
            return;
        }

        locateBtn.classList.add('spinning');
        showLocationStatus('Fetching location...', '');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await reverseGeocode(latitude, longitude);
            },
            (error) => {
                locateBtn.classList.remove('spinning');
                let msg = 'Unable to retrieve your location.';
                if(error.code === 1) msg = 'Location access denied by user.';
                showLocationStatus(msg, 'error');
            }
        );
    });

    async function reverseGeocode(lat, lon) {
        try {
            // Using OpenStreetMap Nominatim API (Free, No Auth)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                const area = data.address.suburb || data.address.neighbourhood || data.address.residential || '';
                
                cityInput.value = city;
                areaInput.value = area;
                
                showLocationStatus('Location successfully retrieved!', 'success');
            } else {
                showLocationStatus('Could not resolve location address.', 'error');
            }
        } catch (err) {
            showLocationStatus('Error fetching location data.', 'error');
        } finally {
            locateBtn.classList.remove('spinning');
        }
    }

    function showLocationStatus(message, type) {
        locationStatus.textContent = message;
        locationStatus.className = 'status-text ' + type;
        
        if (type === 'success') {
            setTimeout(() => {
                locationStatus.textContent = '';
                locationStatus.className = 'status-text';
            }, 3000);
        }
    }

    // Mock Prediction Logic (Fallback)
    function calculateMockPrice(city, sqft, bhk, age, type) {
        let baseRate = 150; 
        const cityMultipliers = { 'new york': 3.5, 'san francisco': 4.0, 'london': 3.2, 'mumbai': 2.8, 'delhi': 2.0, 'bangalore': 1.8, 'los angeles': 3.0, 'dubai': 2.5 };
        let multiplier = 1.0;
        for (const [key, val] of Object.entries(cityMultipliers)) {
            if (city.includes(key)) { multiplier = val; break; }
        }
        const typeMultipliers = { 'apartment': 1.0, 'independent': 1.5, 'penthouse': 2.5, 'studio': 0.9 };
        const typeMult = typeMultipliers[type] || 1.0;
        const bhkPremium = 1 + (bhk * 0.05);
        const ageDepreciation = Math.max(0.7, 1 - (age * 0.01));
        const pricePerSqft = baseRate * multiplier * typeMult * bhkPremium * ageDepreciation;
        const estimatedPrice = pricePerSqft * sqft;
        const noise = 1 + ((Math.random() - 0.5) * 0.04);
        return estimatedPrice * noise;
    }

    // Setup Prediction Logic
    predictBtn.addEventListener('click', async () => {
        const cityStr = cityInput.value.trim();
        const city = cityStr.toLowerCase();
        const sqft = parseFloat(document.getElementById('sqft').value);
        const bhk = parseInt(document.getElementById('bhk').value);
        const age = parseInt(document.getElementById('age').value) || 0;
        const type = document.getElementById('property-type').value;

        // Basic validation
        if (!city || !sqft || isNaN(sqft) || sqft < 100) {
            alert('Please enter a valid city and square footage (min 100).');
            return;
        }

        const originalText = predictBtn.innerHTML;
        predictBtn.innerHTML = 'Analyzing Market... <i class="fa-solid fa-spinner fa-spin"></i>';
        predictBtn.disabled = true;

        let finalPriceUSD = 0, lowerBoundUSD = 0, upperBoundUSD = 0;

        try {
            // RapidAPI Live Zillow Call
            const url = `https://real-estate-zillow-com.p.rapidapi.com/v1/search/sale?location=${encodeURIComponent(cityStr)}&bedsMax=${bhk}&bedsMin=${bhk}`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '94ca73ac92mshed1488593d8d4ebp1bb4fajsna201e614fa8f',
                    'x-rapidapi-host': 'real-estate-zillow-com.p.rapidapi.com'
                }
            };
            
            const response = await fetch(url, options);
            if (!response.ok) throw new Error("API response not OK");
            const result = await response.json();
            
            // Zillow API responses typically nest data in various ways, safely search for arrays of objects
            let properties = [];
            if (result.data && Array.isArray(result.data)) properties = result.data;
            else if (result.results && Array.isArray(result.results)) properties = result.results;
            else if (Array.isArray(result)) properties = result;
            else if (result.data && result.data.results && Array.isArray(result.data.results)) properties = result.data.results;

            // Extract prices
            let validPrices = [];
            properties.forEach(p => {
                const priceStr = p.price || p.zestimate || p.unformattedPrice || (p.hdpData && p.hdpData.homeInfo && p.hdpData.homeInfo.price);
                if (priceStr) {
                    let pNum = typeof priceStr === 'string' ? parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) : priceStr;
                    if (pNum && pNum > 1000) validPrices.push(pNum);
                }
            });

            if (validPrices.length > 0) {
                // Calculate average of the live listings
                const sum = validPrices.reduce((a, b) => a + b, 0);
                finalPriceUSD = sum / validPrices.length;
                lowerBoundUSD = Math.min(...validPrices);
                upperBoundUSD = Math.max(...validPrices);
                if (lowerBoundUSD === upperBoundUSD) {
                    lowerBoundUSD = finalPriceUSD * 0.9;
                    upperBoundUSD = finalPriceUSD * 1.1;
                }
            } else {
                throw new Error("No valid properties with prices found in API response");
            }

        } catch (err) {
            console.warn("Live API failed or returned empty. Using fallback mock engine.", err);
            finalPriceUSD = calculateMockPrice(city, sqft, bhk, age, type);
            lowerBoundUSD = finalPriceUSD * 0.92;
            upperBoundUSD = finalPriceUSD * 1.08;
        }

        // Save for later conversion
        lastPredictionUSD = { price: finalPriceUSD, low: lowerBoundUSD, high: upperBoundUSD, city: cityStr };
        
        // Reset convert button
        if(convertCurrencyBtn) {
            convertCurrencyBtn.innerHTML = 'Convert to Local Currency <i class="fa-solid fa-coins"></i>';
            convertCurrencyBtn.disabled = false;
            convertCurrencyBtn.style.display = 'inline-flex';
        }

        displayResult(finalPriceUSD, lowerBoundUSD, upperBoundUSD, 'USD');
        
        predictBtn.innerHTML = originalText;
        predictBtn.disabled = false;
    });

    // Country code to Currency mapping
    const countryToCurrency = {
        'us': 'USD', 'in': 'INR', 'gb': 'GBP', 'ca': 'CAD', 'au': 'AUD', 
        'de': 'EUR', 'fr': 'EUR', 'it': 'EUR', 'es': 'EUR', 'nl': 'EUR', 'ie': 'EUR',
        'jp': 'JPY', 'cn': 'CNY', 'br': 'BRL', 'mx': 'MXN', 'ae': 'AED', 'sg': 'SGD',
        'nz': 'NZD', 'ch': 'CHF', 'se': 'SEK', 'za': 'ZAR'
    };

    if(convertCurrencyBtn) {
        convertCurrencyBtn.addEventListener('click', async () => {
            if(!lastPredictionUSD) return;
            
            convertCurrencyBtn.innerHTML = 'Converting... <i class="fa-solid fa-spinner fa-spin"></i>';
            convertCurrencyBtn.disabled = true;

            try {
                // 1. Get Country Code from City
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(lastPredictionUSD.city)}&format=json&addressdetails=1`);
                const geoData = await geoRes.json();
                
                let currency = 'USD';
                if(geoData && geoData.length > 0 && geoData[0].address && geoData[0].address.country_code) {
                    const code = geoData[0].address.country_code.toLowerCase();
                    currency = countryToCurrency[code] || 'USD';
                }

                if(currency === 'USD') {
                    convertCurrencyBtn.innerHTML = 'Already in local currency (USD)';
                    return;
                }

                // 2. Fetch Exchange Rate
                let rate = 1;
                const exRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const exData = await exRes.json();
                if (exData && exData.rates && exData.rates[currency]) {
                    rate = exData.rates[currency];
                }

                // 3. Display
                displayResult(lastPredictionUSD.price * rate, lastPredictionUSD.low * rate, lastPredictionUSD.high * rate, currency);
                convertCurrencyBtn.style.display = 'none';

            } catch (err) {
                console.warn('Conversion failed', err);
                convertCurrencyBtn.innerHTML = 'Conversion Failed';
            }
        });
    }

    function displayResult(price, low, high, currencyCode = 'USD') {
        // Formatter for currency with proper locale (en-IN for INR comma system)
        const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0
        });

        // Animation counter
        resultContainer.classList.remove('hidden');
        
        // Animate numbers
        animateValue(predictedPriceEl, 0, price, 1000, formatter);
        
        setTimeout(() => {
            priceRangeEl.textContent = `Range: ${formatter.format(low)} - ${formatter.format(high)}`;
            priceRangeEl.style.opacity = 0;
            priceRangeEl.style.transition = 'opacity 0.5s ease';
            setTimeout(() => priceRangeEl.style.opacity = 1, 50);
        }, 1000);
    }

    function animateValue(obj, start, end, duration, formatter) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * (end - start) + start);
            obj.innerHTML = formatter.format(currentVal);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
