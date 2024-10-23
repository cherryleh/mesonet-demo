async function fetchCSV() {
    try {
        const response = await fetch('./data/0502_data.csv'); // Replace with the path to your CSV file
        const data = await response.text();
        processCSV(data);
        calculate24HTotal(data);
    } catch (error) {
        console.error('Error fetching the CSV:', error);
    }
}

function processCSV(data) {
    const rows = data.split('\n'); // Split by line
    const headers = rows[0].split(','); // First row is the header (column names)

    //const rainIndex = headers.indexOf('RF_1_Tot');
    const humidityIndex = headers.indexOf('RH_1_Avg');
    const tempIndex = headers.indexOf('Tair_1_Avg_f');
    const windIndex = headers.indexOf('WS_1_Avg_mph');
    const windDirIndex = headers.indexOf('WDuv_1_Avg');
    const smIndex = headers.indexOf('SM_1_Avg');
    const radIndex = headers.indexOf('SWin_1_Avg');

    if (humidityIndex === -1 || smIndex === -1 || radIndex === -1) {
        console.error('One or more specified columns not found.');
        return;
    }

    // Get the last row (second last in case of an empty line)
    const lastRow = rows[rows.length - 1];
    const columns = lastRow.split(','); // Split row by comma

    // Get the values of the specified columns
    const humidityValue = parseFloat(columns[humidityIndex]);
    const tempValue = parseFloat(columns[tempIndex]);
    const windValue = parseFloat(columns[windIndex]);
    const windDir = parseFloat(columns[windDirIndex]);
    const smValue = parseFloat(columns[smIndex]);
    const radValue = parseFloat(columns[radIndex]);

    // Display the results in the respective divs
    document.getElementById('airTemp').innerText = `${tempValue.toFixed(2)}`;
    document.getElementById('humidity').innerText = `${Math.round(humidityValue)}%`;
    document.getElementById('wind').innerText = `${Math.round(windValue)}`;
    document.getElementById('sm').innerText = `${Math.round(smValue*100)}%`;
    document.getElementById('rad').innerText = `${Math.round(radValue)}`;

    updateSolarProgress(radValue);

    updateHumProgress(humidityValue);

    degreesToCompass(windDir);
}


function calculate24HTotal(data) {
    const rows = data.split('\n').filter(row => row.trim() !== ''); // Remove empty rows
    const headers = rows[0].split(','); // Assume the first row contains headers

    // Define column indices
    const timestampIndex = headers.indexOf('Date');
    const valueIndex = headers.indexOf('RF_1_Tot_in');

    if (timestampIndex === -1 || valueIndex === -1) {
        console.error('One or more specified columns not found.');
        return;
    }

let latestTimestamp = null;
    let rain = {
        oneH: 0,
        twentyFourH: 0,
        sevenD: 0,
    };

    // First pass to find the latest timestamp
    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        const timestampString = columns[timestampIndex].trim();
        const timestamp = new Date(timestampString);

        // Update the latest timestamp
        if (!isNaN(timestamp.getTime()) && (!latestTimestamp || timestamp > latestTimestamp)) {
            latestTimestamp = timestamp;
        }
    }

    // Check if we found a valid latest timestamp
    if (!latestTimestamp) {
        console.error('No valid timestamps found in the CSV data.');
        return;
    }

    // Calculate time boundaries
    const startOfOneHour = new Date(latestTimestamp);
    startOfOneHour.setHours(startOfOneHour.getHours() - 1); // Subtract 1 hour

    const startOf24Hours = new Date(latestTimestamp);
    startOf24Hours.setHours(startOf24Hours.getHours() - 24); // Subtract 24 hours

    const startOfSevenDays = new Date(latestTimestamp);
    startOfSevenDays.setDate(startOfSevenDays.getDate() - 7); // Subtract 7 days

    // Second pass to sum values within the time windows
    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        const timestampString = columns[timestampIndex].trim();
        const value = parseFloat(columns[valueIndex].trim());

        const timestamp = new Date(timestampString);

        // Sum the values for each time period
        if (timestamp >= startOfOneHour && timestamp <= latestTimestamp) {
            rain.oneH += value; // Add to 1-hour total
        }
        if (timestamp >= startOf24Hours && timestamp <= latestTimestamp) {
            rain.twentyFourH += value; // Add to 24-hour total
        }
        if (timestamp >= startOfSevenDays && timestamp <= latestTimestamp) {
            rain.sevenD += value; // Add to 7-day total
        }
    }


    document.getElementById('rain1h').innerText = `${rain.oneH.toFixed(2)}`;
    document.getElementById('rain24h').innerText = `${rain.twentyFourH.toFixed(2)} `;
    document.getElementById('rain7d').innerText = `${rain.sevenD.toFixed(2)}`;

}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchCSV();
});

let progress = 0;

function updateSolarProgress(value) {
    const progressBar = document.getElementById('solarProgressBar');
    const progressValue = document.getElementById('solarProgressValue');
            
    if (value >= 0 && value <= 1200) {
        progress = value;
        const progressPercentage = (progress / 1200) * 100;  // Convert to percentage
        progressBar.style.width = progressPercentage + '%'; // Update width
    }
}



function updateHumProgress(value) {
    const humProgressBar = document.getElementById('humProgressBar');
    //const progressValue = document.getElementById('radProgressValue');
            
    if (value >= 0 && value <= 100) {
        progress = value;
        const progressPercentage = (progress / 100) * 100;  // Convert to percentage
        humProgressBar.style.width = progressPercentage + '%'; // Update width
    }
}

function degreesToCompass(degrees) {
    // Array of compass directions
    const directions = ["North", "North Northeast", "North East", "East Northeast", "East", "East Southeast", "South East", "South Souteast", 
                        "South", "South Southwest", "South West", "West Southwest", "West", "West Northwest", "Northwest", "North Northwest"];
    
    // Calculate the index based on degrees
    const index = Math.floor((degrees + 11.25) / 22.5) % 16;

    direction = directions[index];
    document.getElementById('windDir').innerText = `Winds from ${direction}`;
}
