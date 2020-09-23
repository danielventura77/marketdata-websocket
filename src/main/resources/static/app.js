var stompClient = null;

var barras = [];

var parseDate = d3.timeParse("%Y.%m.%d %H:%M:%S");

function setConnected(connected) {
    document.getElementById('connect').disabled = connected;
    document.getElementById('disconnect').disabled = !connected;
    document.getElementById('conversationDiv').style.visibility = connected ? 'visible' : 'hidden';
    document.getElementById('response').innerHTML = '';
}

function connect() {
    var socket = new SockJS('/candle');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        setConnected(true);
        //console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/marketdata', function(response){
            var barra = JSON.parse(response.body).candle;
            barra.date = parseDate(barra.date);

            //console.log(barras);
            if(barras.length==0){
                barra.date = new Date(barra.date.getTime() - 1 * 60000);
                barras.push(barra);
            }

            if(barra.date.getTime()!==barras[barras.length-1].date.getTime()){
                //console.log('nova barra!');
                barras.push(barra);
            }else{
                barras[barras.length-1]=barra;
            }

            barras.sort(compare);

            //Elimina duplicados
            var result = [];
            $.each(barras, function (i, e) {
                var matchingItems = $.grep(result, function (item) {
                    return item.date.getTime() === e.date.getTime();
                });
                if (matchingItems.length === 0){
                    result.push(e);
                }
            });

            //console.log(result);
            draw(result.slice(barras.length-100, barras.length));
            printResponse(JSON.stringify(JSON.parse(response.body).candle));
        });
    });
}

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const barA = a.date.getTime();
    const barB = b.date.getTime();

    var comparison = 0;
    if (barA > barB) {
        comparison = 1;
    } else if (barA < barB) {
        comparison = -1;
    }
    return comparison;
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    draw([]);
    barras = [];
    console.log("Disconnected");
}

function printResponse(message) {
    var response = document.getElementById('response');
    var p = document.createElement('p');
    p.style.wordWrap = 'break-word';
    p.appendChild(document.createTextNode(message));
    response.appendChild(p);
    var elem = document.getElementById('conversationDiv');
    elem.scrollTop = elem.scrollHeight;
}


//TechanJs - Candle chart - http://techanjs.org/

var margin = {top: 20, right: 20, bottom: 100, left: 50},
    margin2 = {top: 420, right: 20, bottom: 20, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;


var x = techan.scale.financetime()
    .range([0, width]);

var x2 = techan.scale.financetime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var yVolume = d3.scaleLinear()
    .range([y(0), y(0.3)]);

var y2 = d3.scaleLinear()
    .range([height2, 0]);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("end", brushed);

var candlestick = techan.plot.candlestick()
    .xScale(x)
    .yScale(y);

var volume = techan.plot.volume()
    .xScale(x)
    .yScale(yVolume);

var close = techan.plot.close()
    .xScale(x2)
    .yScale(y2);

var xAxis = d3.axisBottom(x);

var xAxis2 = d3.axisBottom(x2);

var yAxis = d3.axisLeft(y);

var yAxis2 = d3.axisLeft(y2)
    .ticks(0);

var ohlcAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('left')
    .format(d3.format(',.5f'));

var timeAnnotation = techan.plot.axisannotation()
    .axis(xAxis)
    .orient('bottom')
    .format(d3.timeFormat('%Y.%m.%d %H:%M:%S'))
    .width(100)
    .translate([0, height]);

var crosshair = techan.plot.crosshair()
    .xScale(x)
    .yScale(y)
    .xAnnotation(timeAnnotation)
    .yAnnotation(ohlcAnnotation);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

focus.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", y(1))
    .attr("width", width)
    .attr("height", y(0) - y(1));

focus.append("g")
    .attr("class", "volume")
    .attr("clip-path", "url(#clip)");

focus.append("g")
    .attr("class", "candlestick")
    .attr("clip-path", "url(#clip)");

focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

focus.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price ($)");

focus.append('g')
    .attr("class", "crosshair")
    .call(crosshair);

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

context.append("g")
    .attr("class", "close");

context.append("g")
    .attr("class", "pane");

context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")");

context.append("g")
    .attr("class", "y axis")
    .call(yAxis2);


function brushed() {
    var zoomable = x.zoomable(),
        zoomable2 = x2.zoomable();

    zoomable.domain(zoomable2.domain());
    if(d3.event !== null && d3.event.selection !== null) zoomable.domain(d3.event.selection.map(zoomable.invert));

    //draw();
    var candlestickSelection = focus.select("g.candlestick"),
        data = candlestickSelection.datum();
    y.domain(techan.scale.plot.ohlc(data.slice.apply(data, x.zoomable().domain()), candlestick.accessor()).domain());
    candlestickSelection.call(candlestick);
    focus.select("g.volume").call(volume);
    // using refresh method is more efficient as it does not perform any data joins
    // Use this if underlying data is not changing
//        svg.select("g.candlestick").call(candlestick.refresh);
    focus.select("g.x.axis").call(xAxis);
    focus.select("g.y.axis").call(yAxis);
}

function draw(data) {
    var accessor = candlestick.accessor()

    x.domain(data.map(accessor.d));
    x2.domain(x.domain());
    y.domain(techan.scale.plot.ohlc(data, accessor).domain());
    y2.domain(y.domain());
    yVolume.domain(techan.scale.plot.volume(data).domain());

    focus.select("g.candlestick").datum(data);
    focus.select("g.volume").datum(data);

    context.select("g.close").datum(data).call(close);
    context.select("g.x.axis").call(xAxis2);

    // Associate the brush with the scale and render the brush only AFTER a domain has been applied
    context.select("g.pane").call(brush).selectAll("rect").attr("height", height2);

    x.zoomable().domain(x2.zoomable().domain());

    // draw //

    var candlestickSelection = focus.select("g.candlestick"),
        data = candlestickSelection.datum();
    y.domain(techan.scale.plot.ohlc(data.slice.apply(data, x.zoomable().domain()), candlestick.accessor()).domain());
    candlestickSelection.call(candlestick);
    focus.select("g.volume").call(volume);
    // using refresh method is more efficient as it does not perform any data joins
    // Use this if underlying data is not changing
//        svg.select("g.candlestick").call(candlestick.refresh);
    focus.select("g.x.axis").call(xAxis);
    focus.select("g.y.axis").call(yAxis);
}
