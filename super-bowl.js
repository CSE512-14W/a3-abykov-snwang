// Partition the visualization space.
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 1280*0.9 - margin.left - margin.right,
    botHeight = Math.round(width * (53.3 / 120.0)) - margin.top - margin.bottom,
    topHeight = 800*0.9 - botHeight - margin.top - margin.bottom;

var chart = d3.select("body").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", topHeight + botHeight + margin.top + margin.bottom);
var topChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var bottomChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + (margin.top + topHeight) + ")");

setUpTop(topChart, width, topHeight);
setUpBottom(bottomChart, width, botHeight);

function setUpTop(chart, width, height) {
  // Horizontal and vertical padding around the player names
  var betweenPositionHorizPadding = 5;
  var betweenCategoryHorizPadding = 10;
  var betweenTeamHorizPadding = 20;
  var vertPadding = 15;

  // Load in data about the player positions
  var playerRectangles = d3.json("PlayerPositions.json", function (err, playerPositions) {
    // First we need to calculate the total number of positions per team
    var positionCount = [];
    var totalPositionCount = 0;
    for (var i = 0; i < playerPositions.length; i++) {
      positionCount[i] = [];
      for (var team in playerPositions[i]) {
        var teamJson = playerPositions[i][team];
        for (var j = 0; j < teamJson.length; j++) {
          positionCount[i][j] = 0;
          for (var category in teamJson[j]) {
            var count = teamJson[j][category].length;
            positionCount[i][j] += count;
            totalPositionCount += count;
          }
        }
      }
    }

    // Now we can calculate the full padding
    // We need between team padding on the left, right and between the teams
    var totalPadding = (positionCount.length + 1) * betweenTeamHorizPadding;
    for (var i = 0; i < positionCount.length; i++) {
      curX += betweenTeamHorizPadding;
      // Now add in padding between sections
      totalPadding += (positionCount[i].length - 1) * betweenCategoryHorizPadding;
      for (var j = 0; j < positionCount[i].length; j++) {
        // Finally add in padding between positions
        totalPadding += (positionCount[i][j] - 1) * betweenPositionHorizPadding;
      }
    }

    // Finally we can calculate the height and width of each position
    var positionWidth = (width - totalPadding) / totalPositionCount;
    var positionHeight = positionWidth / 2;
    var categoryHeight = positionHeight * 2;
    var teamHeight = categoryHeight * 2;
    positionWidth = Math.round(positionWidth);
    positionHeight = Math.round(positionHeight);
    categoryHeight = Math.round(categoryHeight);
    teamHeight = Math.round(teamHeight);

    // Now we can calculate the x values of each rectangle
    // Now we can form the rectangles
    var rectangleData = [];
    var curX = betweenTeamHorizPadding;

    for (var i = 0; i < playerPositions.length; i++) {
      for (var team in playerPositions[i]) {
        var teamX = curX;
        var teamJson = playerPositions[i][team];

        for (var j = 0; j < teamJson.length; j++) {
          for (var category in teamJson[j]) {
            var categoryX = curX;
            var categoryJson = teamJson[j][category];

            for (var k = 0; k < categoryJson.length; k++) {
              for (var position in categoryJson[k]) {
                rectangleData.push({"rx":curX, "ry":3 * vertPadding + teamHeight + categoryHeight,
                        "rwidth":positionWidth, "rheight":positionHeight, "rtext":position});
                curX += positionWidth + betweenPositionHorizPadding;
              }
            }

            curX -= betweenPositionHorizPadding;
            rectangleData.push({"rx":categoryX, "ry":2 * vertPadding + teamHeight, 
                    "rwidth":curX - categoryX, "rheight":categoryHeight, "rtext":category});
            curX += betweenCategoryHorizPadding;
          }
        }
        curX -= betweenCategoryHorizPadding;
        rectangleData.push({"rx":teamX, "ry":vertPadding, 
                "rwidth":curX - teamX, "rheight":teamHeight, "rtext":team});
        curX += betweenTeamHorizPadding;
      }
    }

    //Add the rectangles
    var rectangles = chart.selectAll("rect").data(rectangleData).enter().append("rect");

    //Add the rectangle attributes
    var rectangleAttributes = rectangles
              .attr("x", function (d) { return d.rx; })
              .attr("y", function (d) { return d.ry; })
              .attr("width", function (d) { return d.rwidth; })
              .attr("height", function (d) { return d.rheight; });
  });
  // First we need to add coordinates to each of the 

  var playData = d3.json("super-bowl.json", function (err, json) {

  });
}

function setUpBottom(chart, width, height) {
  // scale for bar length
  var length = d3.scale.linear()
                  .domain([0, 100])
                  .range([0, width * (5.0/6)]);

  // scale for Seahawks yard lines
  var x = d3.scale.linear()
    .domain([-20, 120])
    .range([0, width]);
  // scale for Broncos yard lines (display only)
  var xInverted = d3.scale.linear()
    .domain([120, -20])
    .range([0, width]);
  // margin below the top yard lines and above the bottom yard lines
  var playMargin = 10;

  var teamColors = d3.scale.ordinal()
    .domain(["SEA", "DEN"])
    .range(["steelblue", "orange"])
  var typeColors = d3.scale.category10()
    .domain(["pass", "run", "interception", "fumble", "kickoff", "punt"]);

  var data = d3.json("top-plays.json", function (err, json) {
    var numPlays = json.length;
    var topPlays = json.slice(0, numPlays);
    var barHeight = Math.floor((height - 2*playMargin) / numPlays);

    // axis for Seahawks yard lines
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("top")
      .tickValues([0, 10, 20, 30, 40, 50]);
    // axis for Broncos yard lines
    var invertedXAxis = d3.svg.axis()
      .scale(xInverted)
      .orient("top")
      .tickValues([0, 10, 20, 30, 40]);
    chart.append("g") // top Seahawks yard lines
        .attr("class", "x axis")
        .call(xAxis)
      .append("g") // top Broncos yard lines
        .attr("class", "x axis")
        .call(invertedXAxis)
      .append("g") // bottom Seahawks yard lines
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis.orient("bottom"))
      .append("g") // bottom Broncos yard lines
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(invertedXAxis.orient("bottom"));

    // add all the plays
    chart.selectAll(".bar")
      .data(topPlays)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        var leftEnd = (d[1].team === "SEA") ? d[1].startLine : d[1].endLine;
        return Math.round(x(leftEnd));
      })
      .attr("y", function (d, i) { return playMargin + i * barHeight; })
      .attr("height", barHeight - 1)
      .attr("width", function (d) { return Math.floor(length(d[1].yards)); })
      .attr("text", function (d) { return d[1].description; })
      .attr("fill", function (d) { return teamColors(d[1].team); });
      //.attr("fill", function (d) { return typeColors(d[1].type); });
  });
}
