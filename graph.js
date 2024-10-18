let chart;
let rawData = []; 
function loadCSV() {
    Papa.parse("./data/0502_data.csv", {
        download: true,
        header: true,
        complete: function(results) {
            rawData = results.data.map(row => ({
                timestamp: row['Date'],
                rf: parseFloat(row['RF_1_Tot_in']),
                temp: parseFloat(row['Tair_1_Avg_f']),
                rh: parseFloat(row['RH_1_Avg']),
                sm: parseFloat(row['SM_1_Avg'])
            }));
            console.log("CSV Data Loaded:", rawData); // For debugging
            updateChart(); 
        }
    });
}

function initializeChart(series, yAxisConfig) {
    chart = Highcharts.chart('container', {
        title: {
            text: 'Dynamic Data Chart'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: yAxisConfig,
        series: series
    });
}

function updateChart() {
    const range = document.getElementById('timeRange').value;
    const variable = document.getElementById('variable').value;
    const unit = document.getElementById('unit').value; // Get selected unit

    if (rawData.length === 0) {
        console.error("No data available for chart rendering.");
        return; 
    }

    // Find the latest timestamp in the dataset
    const latestTimestamp = Math.max(...rawData.map(row => new Date(row.timestamp).getTime()));
    console.log("Latest timestamp:", new Date(latestTimestamp)); // Debugging output

    // Filter data based on the selected time range
    let filteredData = filterDataByRange(rawData, range, latestTimestamp);
            

    // Apply unit conversion to the filtered data
    filteredData = filteredData.map(row => ({
        timestamp: row.timestamp,
        rf: unit === 'metric' ? row.rf * 25.4 : row.rf,
        temp: unit === 'metric' ? (row.temp - 32) * 5 / 9 : row.temp, 
        rh: row.rh,
        sm: row.sm 
    }));

    console.log("Filtered Data:", filteredData); // Debugging output
    // Prepare series and yAxis configuration based on the selected variable
    let series = [];
    let yAxisConfig = [];

    if (variable === 'rf+t') {
        let seriesData1 = filteredData.map(row => [new Date(row.timestamp).getTime(), row['rf']]);
        let seriesData2 = filteredData.map(row => [new Date(row.timestamp).getTime(), row['temp']]);

        series = [
            {
                name: 'Temperature',
                data: seriesData2.length ? seriesData2 : [[latestTimestamp, null]],
                yAxis: 1
            },
            {
                name: 'Rainfall',
                type: 'column',
                data: seriesData1.length ? seriesData1 : [[latestTimestamp, null]],
                yAxis: 0
            }
        ];

        yAxisConfig = [
            { title: { text: unit === 'metric' ? 'Rainfall (mm)' : 'Rainfall (in)' }, opposite: true },
            { title: { text: unit === 'metric' ? 'Temperature (°C)' : 'Temperature (°F)' }}
        ];

        tooltip=[
            {shared: true}];

    } else if (variable === 'rf'){
        let seriesData = filteredData.map(row => [new Date(row.timestamp).getTime(), row[variable]]);
        series = [{
            name: variable === variable === 'rf' ? 'Rainfall',
            type:'column',
            data: seriesData
        }];

        yAxisConfig = [{
            title: {
                text: variable === 'rf' ? (unit === 'metric' ? 'Rainfall (mm)' : 'Rainfall (in)') :
                    variable === 'temp' ? (unit === 'metric' ? 'Temperature (°C)' : 'Temperature (°F)') :
                    variable === 'rh' ? 'Relative Humidity' : 'Soil Moisture'
            }
        }];
    } else {
        let seriesData = filteredData.map(row => [new Date(row.timestamp).getTime(), row[variable]]);
        series = [{
            name: variable === 'temp' ? 'Temperature' : variable === 'rh' ? 'Relative Humidity' : 'Soil Moisture',
            data: seriesData
        }];

        yAxisConfig = [{
            title: {
                text: variable === 'rf' ? (unit === 'metric' ? 'Rainfall (mm)' : 'Rainfall (in)') :
                    variable === 'temp' ? (unit === 'metric' ? 'Temperature (°C)' : 'Temperature (°F)') :
                    variable === 'rh' ? 'Relative Humidity' : 'Soil Moisture'
            }
        }];
    }

    if (chart) {
        chart.destroy();
    }

    initializeChart(series, yAxisConfig);
}

// Filter data by time range based on the latest timestamp
function filterDataByRange(data, range, latestTimestamp) {
    let startTime;

    if (range === '24h') {
        startTime = latestTimestamp - (24 * 60 * 60 * 1000);  // Subtract 24 hours in milliseconds
    } else if (range === '7d') {
        startTime = latestTimestamp - (7 * 24 * 60 * 60 * 1000);  // Subtract 7 days in milliseconds
    }

    return data.filter(row => {
        const timestamp = new Date(row.timestamp).getTime();
        return timestamp >= startTime && timestamp <= latestTimestamp;
    });
}

// Load the CSV data and initialize the chart on page load
window.onload = () => {
    loadCSV(); // Call loadCSV function to fetch data from CSV file
};