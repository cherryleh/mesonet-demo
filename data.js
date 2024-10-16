const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const id = urlParams.get('id');

document.getElementById('displayId').textContent = id;
const series1 = [];
const series2 = [];

fetch('/api/data2')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const tempRaw = data['Tair_1_Avg']; // Temperature data
        const rainRaw = data['RF_1_Tot'];   // Rainfall data

        // Convert object to array of [timestamp, value] pairs
        function formatObjectToSeries(rawData) {
            return Object.entries(rawData).map(([timestamp, value]) => {
                return [new Date(timestamp).getTime(), parseFloat(value)];
            });
        }
        function convertCtoF(celsius) {
            return celsius * 9/5 + 32;
        }

        function convertMmToIn(mm) {
            return mm / 25.4;
        }

        const series1 = formatObjectToSeries(tempRaw);
        const series2 = formatObjectToSeries(rainRaw);

        for (let i = 0; i < series1.length; i++) {
            series1[i][1] = convertCtoF(series1[i][1]);
        }

        for (let i = 0; i < series2.length; i++) {
            series2[i][1] = convertMmToIn(series2[i][1]);
        }

        const chart = createChart(series1, series2);

        

        // Create a function to update the chart based on the selected timeframe
        function updateChart() {
            const selectedTimeframe = parseInt(document.getElementById('timeframe').value, 10);
            const cutoffTime = series1[series1.length - 1][0] - (selectedTimeframe * 60 * 60 * 1000); // Adjust cutoffTime based on dropdown

            // Filter the data for the selected timeframe
            const filteredSeries1 = series1.filter(([timestamp]) => timestamp >= cutoffTime);
            const filteredSeries2 = series2.filter(([timestamp]) => timestamp >= cutoffTime);

            console.log(filteredSeries1);
            console.log(filteredSeries2);

            createChart(filteredSeries1, filteredSeries2);
        }
        

        // Initial chart creation
        updateChart();

        // Update the chart when the dropdown value changes
        document.getElementById('timeframe').addEventListener('change', updateChart);
    })
    .catch(error => {
        console.error('Error fetching the data:', error);
    });

function createChart(filteredSeries1, filteredSeries2) {
    Highcharts.chart('latest-graph', {
        chart: {
            type: 'line'
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%b %d %I:%M %p', this.value);
                }
            },
            tickInterval: 1000 * 60 * 60 * 12
        },
        yAxis: [{
            labels: {
                format: '{value}°F',
            },
            title: {
                text: 'Temperature'
            }
        }, {
            title: {
                text: 'Precipitation'
            },
            labels: {
                format: '{value} in',
            },
            opposite: true
        }],
        tooltip: {
            xDateFormat: '%A, %b %e, %Y %l:%M %p',
            shared: true,
        },
        plotOptions: {
            series: {
                pointWidth: 5,
                marker: {
                    enabled: false
                },
                animation: {
                    duration: 800, // Animation duration for series update
                }
            }
        },
        series: [{
            name: 'Temperature',
            type: 'spline',
            data: filteredSeries1,
            tooltip: {
                valueSuffix: '°F'
            },
            color: '#DC143C'
        },{
            name: 'Precipitation',
            type: 'column',
            yAxis: 1,
            data: filteredSeries2,
            tooltip: {
                valueSuffix: ' in'
            },
            color:'#00B9E8'
        }]
    });
}

