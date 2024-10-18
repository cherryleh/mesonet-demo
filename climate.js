let currentData = 'english';
let chart2;

fetch('./data/0502_climate.csv') // Update with your CSV file path
    .then(response => response.text())
    .then(data => {
        // Parse the CSV data
        const parsedData = Papa.parse(data, {
            header: true,  // Use first row as header
            skipEmptyLines: true // Skip empty lines
        });

        //Metric data
        const categories = parsedData.data.map(row => row['Month']); 
        const tmean_c = parsedData.data.map(row => parseFloat(row['Tmean_c'])); 
        const tmin_c = parsedData.data.map(row => parseFloat(row['Tmin_c']));
        const tmax_c = parsedData.data.map(row => parseFloat(row['Tmax_c']));
        const rf_mm = parsedData.data.map(row => parseFloat(row['RF_mm']));

        //English data
        const tmean_f = parsedData.data.map(row => parseFloat(row['Tmean_f'])); 
        const tmin_f = parsedData.data.map(row => parseFloat(row['Tmin_f']));
        const tmax_f = parsedData.data.map(row => parseFloat(row['Tmax_f']));
        const rf_in = parsedData.data.map(row => parseFloat(row['RF_in']));

        function initChart(dataType) {
            const seriesData = dataType === 'metric' ? 
                [tmean_c, tmin_c, tmax_c, rf_mm] : 
                [tmean_f, tmin_f, tmax_f, rf_in];

            chart2 = Highcharts.chart('climatology', {
                chart: {
                    type: 'line'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: categories
                },
                yAxis: [{
                    title: {
                        text: dataType === 'metric' ? 'Temperature (&deg;C)' : 'Temperature (&deg;F)'
                    }
                }, {
                    title: {
                        text: dataType === 'metric' ? 'Rainfall (mm)' : 'Rainfall (in)'
                    },
                    opposite: true
                }],
                series: [{
                    name: 'Rainfall',
                    data: seriesData[3],
                    yAxis: 1,
                    type: 'column',
                    tooltip: {
                        valueSuffix: dataType === 'metric' ? ' mm' : ' in'
                    }
                }, {
                    name: 'Mean Temperature',
                    data: seriesData[0],
                    tooltip: {
                        valueSuffix: dataType === 'metric' ? '&deg;C' : '&deg;F'
                    }
                }, {
                    name: 'Min Temperature',
                    data: seriesData[1],
                    tooltip: {
                        valueSuffix: dataType === 'metric' ? '&deg;C' : '&deg;F'
                    }
                }, {
                    name: 'Max Temperature',
                    data: seriesData[2],
                    tooltip: {
                        valueSuffix: dataType === 'metric' ? '&deg;C' : '&deg;F'
                    }
                }],
                tooltip: {
                    shared: true,
                    valueDecimals: 2 // Keeps tooltip value to 2 decimal places
                }
            });
        }

        // Dropdown handler
        document.getElementById('unitDropdown').addEventListener('change', function () {
            const selectedUnit = this.value;
            initChart(selectedUnit);
        });

        // Initialize the chart with metric as the default
        initChart('english');
    })
    .catch(error => console.error('Error fetching or parsing CSV:', error));
