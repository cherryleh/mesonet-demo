fetch('./data/0502_data.csv')
    .then(response => response.text())
    .then(data => {
        const parsedData = parseCSV(data);
        const last24hData = filterLast24Hours(parsedData);
        const last7DaysHourlyData = filterLast7Days(parsedData);

        render24hChart(last24hData);
        render7dChart(last7DaysHourlyData);
    });

function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const result = [];

    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i];

        const dateIndex = headers.indexOf('Date');
        const tempIndex = headers.indexOf('Tair_1_Avg_f');
        const rainIndex = headers.indexOf('RF_1_Tot_in');
        const radIndex = headers.indexOf('SWin_1_Avg');

        if (dateIndex !== -1 && tempIndex !== -1) {
            // Parse the date and keep it in the provided timezone (which should be -10:00 for HST)
            const datetimeString = columns[dateIndex]; // This is already in HST format
            const datetime = new Date(datetimeString); // JavaScript will respect the timezone provided in the string

            const tempValue = parseFloat(columns[tempIndex]);
            const rainValue = rainIndex !== -1 ? parseFloat(columns[rainIndex]) : null;
            const radValue = parseFloat(columns[radIndex]);
            result.push({ datetime, tempValue, rainValue, radValue });
        }
    }

    return result;
}


function filterLast24Hours(data) {
    const mostRecent = new Date(Math.max(...data.map(entry => entry.datetime)));
    const twentyFourHoursAgo = new Date(mostRecent.getTime() - 24 * 60 * 60 * 1000);
    return data.filter(entry => entry.datetime >= twentyFourHoursAgo && entry.datetime <= mostRecent);
}

function filterLast7Days(data) {
    const mostRecent = new Date(Math.max(...data.map(entry => entry.datetime)));
    const sevenDaysAgo = new Date(mostRecent.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hourlyData = {};

    data.forEach(entry => {
        if (entry.datetime >= sevenDaysAgo && entry.datetime <= mostRecent) {
            const hour = new Date(entry.datetime).setMinutes(0, 0, 0); // Round to hour
            if (!hourlyData[hour]) {
                hourlyData[hour] = { tempSum: 0, rainTotal: 0, radSum: 0, count: 0 };
            }
            hourlyData[hour].tempSum += entry.tempValue;
            hourlyData[hour].radSum += entry.radValue;
            if (entry.rainValue !== null) {
                hourlyData[hour].rainTotal += entry.rainValue;
            }
            hourlyData[hour].count += 1;
        }
    });
    
    return Object.keys(hourlyData).map(hour => ({
        datetime: new Date(parseInt(hour)),
        avgTemp: hourlyData[hour].tempSum / hourlyData[hour].count,
        avgRad: hourlyData[hour].radSum / hourlyData[hour].count,
        totalRain: hourlyData[hour].rainTotal,
    }));
}

function render24hChart(data) {
    Highcharts.setOptions({
        time: {
            timezoneOffset: 600 // HST is UTC-10, so 10 * 60 minutes = 600
        }
    });
    Highcharts.chart('container24h', {
        chart: {
            zoomType: 'x',
        },
        title: {
            text: 'Last 24 Hours (5-min)',
            align: 'left',
            style: {
                color: '#333333', // Change color
                fontSize: '0.7vw', // Change font size
                fontWeight: 'bold', // Change font weight
                fontFamily: 'Arial, sans-serif' // Change font family
            }
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top',
            floating: true,
            y: 0
        },
        xAxis: { type: 'datetime' },
        yAxis: [{ // First yAxis for temperature
            title: { text: 'Temperature (&deg;F)' }
        }, { // Secondary yAxis for rainfall
            title: { text: '5-min Rainfall (in)' },
            opposite: true
        }],
        tooltip: {
            shared: true,
            valueDecimals: 2 // This will show only two decimal places in tooltips
        },
        series: [{
            name: 'Temperature',
            data: data.map(entry => [entry.datetime.getTime(), entry.tempValue]),
            marker: { enabled: false },
            zIndex: 2,
            color: '#FC7753'
        }, {
            name: 'Rainfall',
            type: 'column',
            data: data.map(entry => [entry.datetime.getTime(), entry.rainValue]),
            yAxis: 1,
            zIndex: 1,
            color: '#058DC7'
        }]
    });
}
function render7dChart(data) {
    Highcharts.setOptions({
        time: {
            timezoneOffset: 600 // HST is UTC-10, so 10 * 60 minutes = 600
        }
    });
    Highcharts.chart('container7days', {
        chart: {
            zoomType: 'x',
        },
        title: {
            text: 'Last 7 Days (Hourly)',
            align: 'left',
            style: {
                color: '#333333', // Change color
                fontSize: '0.7vw', // Change font size
                fontWeight: 'bold', // Change font weight
                fontFamily: 'Arial, sans-serif' // Change font family
            }
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top',
            floating: true,
            y: 0
        },
        xAxis: { type: 'datetime' },
        yAxis: [{ // First yAxis for temperature
            title: { text: 'Temperature (&deg;F)' }
        }, {
            title: { text: 'Hourly Rainfall (in)' },
            opposite: true
        },
        {
            title: { text: 'Solar Radiation (W/m&sup2)' },
            opposite: true,
            min:0,
            max:1200
        }
        ],
        tooltip: {
            shared: true,
            valueDecimals: 2 // This will show only two decimal places in tooltips
        },
        series: [{
            name: 'Temperature',
            data: data.map(entry => [entry.datetime.getTime(), entry.avgTemp]),
            marker: { enabled: false },
            zIndex: 2,
            color: '#FC7753'

        }, {
            name: 'Rainfall',
            type: 'column',
            data: data.map(entry => [entry.datetime.getTime(), entry.totalRain]),
            yAxis: 1,
            zIndex: 1,
            color: '#058DC7'
        }, {
            name: 'Solar Radiation',
            data: data.map(entry => [entry.datetime.getTime(), entry.avgRad]),
            yAxis: 2,
            zIndex: 1,
            color: '#FFC914'
        }
        ]
        
    });
}