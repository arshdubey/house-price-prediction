# Lumina - Real Estate Market Value Predictor 🏡✨

Lumina is a sleek, modern, and highly responsive Vanilla JavaScript web application that provides real-time house market price estimations. It utilizes live data from Zillow (via RapidAPI) and features an intelligent dynamic currency conversion system.

## 🌟 Key Features

*   **Live Market Data:** Integrates directly with the `Real Estate Zillow API` to fetch active property listings based on your location and BHK criteria.
*   **Intelligent Fallback Engine:** If the API hits rate limits or cannot find exact matches, Lumina seamlessly falls back to an AI-driven mock prediction engine that calculates value based on city multipliers, property type, and depreciation over age.
*   **"Locate Me" Auto-fill:** Uses the browser's HTML5 Geolocation API combined with the free **OpenStreetMap Nominatim API** to instantly auto-fill your current city and neighborhood.
*   **Dynamic Local Currency Conversion:** 
    * After receiving a USD estimate, users can instantly convert the value to the local currency of the city they searched for!
    * Uses `api.exchangerate-api.com` for live daily exchange rates.
    * Implements precise `Intl.NumberFormat` localizations (e.g., proper comma placements for Indian Rupees `₹3,08,28,236`).
*   **Premium Glassmorphic UI:** A stunning dark-mode interface built purely with CSS—no external libraries like Tailwind required. Features smooth micro-animations and floating gradient blobs.

## 🛠️ Technology Stack

*   **Structure:** HTML5
*   **Styling:** Vanilla CSS (CSS Variables, Flexbox, CSS Grid, Glassmorphism)
*   **Logic:** Vanilla JavaScript (ES6+, Async/Await, Fetch API)
*   **APIs Used:**
    *   `Real Estate Zillow.com` (via RapidAPI) for property data.
    *   `OpenStreetMap Nominatim API` for reverse/forward geocoding.
    *   `ExchangeRate-API` for currency conversion.

## 🚀 How to Run Locally

Since this project is built entirely without heavy node modules or build steps, running it is incredibly simple:

1. Clone this repository:
   ```bash
   git clone https://github.com/arshdubey/house-price-prediction.git
   ```
2. Navigate to the project directory and open the `frontend/index.html` file in any modern web browser (Chrome, Edge, Firefox, Safari).
3. _Note:_ For the Zillow API integration to work, you must ensure your RapidAPI key is active and has available quota on the Basic plan.

## 📸 Usage

1. Enter the **City / Region** (e.g., "Mumbai" or "New York").
2. Fill out the property details (Property Type, BHK, Square Footage, Age).
3. Click **Predict Market Value**.
4. Once the USD value is estimated, click **Convert to Local Currency** to automatically fetch the country's native currency and live exchange rate!
