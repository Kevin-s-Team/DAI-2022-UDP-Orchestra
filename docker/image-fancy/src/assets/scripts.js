window.Apex = {
  chart: {
    foreColor: '#fff',
    toolbar: {
      show: false
    },
  },
  colors: ['#FCCF31', '#17ead9', '#f02fc2'],
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: "#40475D",
  },
  xaxis: {
    axisTicks: {
      color: '#333'
    },
    axisBorder: {
      color: "#333"
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      gradientToColors: ['#F55555', '#6078ea', '#6094ea']
    },
  },
  tooltip: {
    theme: 'dark',
    x: {
      formatter: function (val) {
        return moment(new Date(val)).format("HH:mm:ss")
      }
    }
  },
  yaxis: {
    decimalsInFloat: 2,
    opposite: true,
    labels: {
      offsetX: -10
    }
  }
};


var optionsCircle = {
  chart: {
    type: 'radialBar',
    height: 320,
    offsetY: -30,
    offsetX: 20
  },
  plotOptions: {
    radialBar: {
      size: undefined,
      inverseOrder: false,
      hollow: {
        margin: 5,
        size: '48%',
        background: 'transparent',
      },
      track: {
        show: true,
        background: '#40475D',
        strokeWidth: '10%',
        opacity: 1,
        margin: 3, // margin is in pixels
      },


    },
  },
  series: [0,0,0,0,0],
  labels: ['piano','trumpet','flute','violin','drum'],
  legend: {
    show: true,
    position: 'left',
    offsetX: -30,
    offsetY: 10,
    formatter: function (val, opts) {
      return val + " - " + opts.w.globals.series[opts.seriesIndex] + '%'
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  }
}

var chartCircle = new ApexCharts(document.querySelector('#circlechart'), optionsCircle);
chartCircle.render();

var optionsHeatMap = {
  series: [{
      name: 'piano',
      data: [0]
    },
    {
      name: 'trumpet',
      data: [0]
    },
    {
      name: 'flute',
      data: [0]
    },
    {
      name: 'violin',
      data: [0]
    },
    {
      name: 'drum',
      data: [0]
    }
],
  chart: {
  height: 350,
  type: 'heatmap',
},
dataLabels: {
  enabled: false
},
colors: ["#008FFB"],
title: {
  text: 'Orchestra'
},
};

var chartHeatmap = new ApexCharts(document.querySelector("#heatmap"), optionsHeatMap);
chartHeatmap.render();


window.setInterval(function () {

  fetch('http://localhost:3000/', {headers: {'Accept-Encoding' : 'application/json'}})
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      parsedData = {
        piano : 0,
        trumpet : 0,
        flute : 0,
        violin : 0,
        drum : 0
      };
      for(let value of data) {
        ++parsedData[value.instrument];
      }
      let total = parsedData.piano + parsedData.trumpet + parsedData.flute + parsedData.violin + parsedData.drum;
      if(total < 1)
        total = 1

      chartCircle.updateSeries([
        Math.round(10000*parsedData.piano/total)/100,
        Math.round(10000*parsedData.trumpet/total)/100,
        Math.round(10000*parsedData.flute/total)/100,
        Math.round(10000*parsedData.violin/total)/100,
        Math.round(10000*parsedData.drum/total)/100
      ]);
      let dataPiano = [...chartHeatmap.w.config.series[0].data,parsedData.piano];
      let dataTrumpet = [...chartHeatmap.w.config.series[1].data,parsedData.trumpet];
      let dataFlute = [...chartHeatmap.w.config.series[2].data,parsedData.flute];
      let dataViolin = [...chartHeatmap.w.config.series[3].data,parsedData.violin];
      let dataDrum = [...chartHeatmap.w.config.series[4].data,parsedData.drum];


      chartHeatmap.updateSeries([{
        data: dataPiano.slice(Math.max(dataPiano.length - 20, 0))
      }, {
        data: dataTrumpet.slice(Math.max(dataTrumpet.length - 20, 0))
      }, {
        data: dataFlute.slice(Math.max(dataFlute.length - 20, 0))
      }, {
        data: dataViolin.slice(Math.max(dataViolin.length - 20, 0))
      }, {
        data: dataDrum.slice(Math.max(dataDrum.length - 20, 0))
      }]);

    })
    .catch(error => console.error(error));

}, 2000);
