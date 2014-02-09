// Partition the visualization space.
var margin = {top: 20, right: 30, bottom: 20, left: 30},
    width = 1280*0.9 - margin.left - margin.right,
    height = 800*0.9 - margin.top - margin.bottom,
    botHeight = Math.round(width * (53.3 / 120.0)) * 0.9,
    topHeight = height - botHeight;

var chart = d3.select("body").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
var topChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var bottomChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + (2.5*margin.top + topHeight) + ")");

setUpTop(topChart, width, topHeight);
setUpBottom(bottomChart, width, botHeight - 1.5*margin.top);

function setUpTop(chart, width, height) {
  // Horizontal and vertical padding around the player names
  var betweenPositionHorizPadding = 1;
  var betweenCategoryHorizPadding = 10;
  var betweenTeamHorizPadding = 20;
  var vertPadding = 2;

  // Load in data about the player positions
  var playerRectangles = d3.json("PlayerPositions.json", function (err, playerPositions) {
    // To figure out the height of each bar, we need to find the maximum depth we will achieve
    var maxHeight = 0;
    var namesInLine = 2;
    for (var i = 0; i < playerPositions.length; i++) {
      for (var team in playerPositions[i]) {
        var teamJson = playerPositions[i][team];
        for (var j = 0; j < teamJson.length; j++) {
          for (var category in teamJson[j]) {
            var curHeight = 0;
            var categoryJson = teamJson[j][category];
            for (var k = 0; k < categoryJson.length; k++) {
              for (var position in categoryJson[k]) {
                curHeight += Math.ceil(categoryJson[k][position].length / namesInLine);
              }
            }
            if (curHeight > maxHeight) {
              maxHeight = curHeight;
            }
          }
        }
      }
    }
    
    // We need to calculate the height of each rectangle
    var recHeight = Math.floor((height - vertPadding * (maxHeight + 1)) / (maxHeight + 3));
    var teamHeight = 2 * recHeight;
    
    // Now we can calculate the full padding
    // We need between padding between the teams and between the categories 
    var totalPadding = betweenTeamHorizPadding + 4 * betweenCategoryHorizPadding + namesInLine * 6 * betweenPositionHorizPadding;
    
    // Finally we can calculate the height and width of each position
    var totalRecWidth = width - totalPadding;
    var positionWidth = Math.round(0.2 * totalRecWidth / 6);
    var playerWidth = Math.round(0.8 * totalRecWidth / (6 * namesInLine));

    // Now we can calculate the x values of each rectangle
    // Now we can form the rectangles
    var rectangleData = [];
    var textData = [];
    var curX = 0;

    // Iterate over each team
    for (var i = 0; i < playerPositions.length; i++) {
      for (var team in playerPositions[i]) {
        var teamX = curX;
        var teamJson = playerPositions[i][team];

        // Iterate over each category
        for (var j = 0; j < teamJson.length; j++) {
          for (var category in teamJson[j]) {
            var categoryX = curX;
            var categoryJson = teamJson[j][category];

            // Iterate over each position
            var curY = teamHeight + recHeight + 2 * vertPadding;
            for (var k = 0; k < categoryJson.length; k++) {
              for (var position in categoryJson[k]) {
                rectangleData.push({"rx":curX, "ry":curY, "rwidth":positionWidth, 
                                    "rheight":recHeight, "rtext":position, "rselectable":false, "rselected":false});
                textData.push({"tx":Math.round(curX + positionWidth / 2), "ty":Math.round(curY + recHeight * 0.75),
                               "ttext":position, "tfont":"Arial Black", "tfontsize":"10px", "tselectable":false});                                    
                nameJson = categoryJson[k][position];
                
                // Iterate over each player
                for (var m = 0; m < nameJson.length; m++) {
                  if (m > 0 && m % 2 == 0) {
                    curY += recHeight + vertPadding;
                  }
                  var playerX = curX + positionWidth + betweenPositionHorizPadding;
                  if (m % 2 == 1) {
                    playerX += playerWidth + betweenPositionHorizPadding;
                  }
                  if (curY + recHeight > height) {
                    alert("WENT TOO FAR!");
                  }
                  rectangleData.push({"rx":playerX, "ry":curY, "rwidth":playerWidth, 
                                      "rheight":recHeight, "rtext":nameJson[m], "rselectable":true, "rselected":false});
                  textData.push({"tx":Math.round(playerX + playerWidth / 2), "ty":Math.round(curY + recHeight * 0.75),
                               "ttext":nameJson[m], "tfont":"Arial", "tfontsize":"10px", "tselectable":true});   
                }
                
                curY += recHeight + vertPadding;
              }
            }

            curX += 2 * playerWidth + 2 * betweenPositionHorizPadding + positionWidth;
            rectangleData.push({"rx":categoryX, "ry":vertPadding + teamHeight, "rwidth":curX - categoryX, 
                                "rheight":recHeight, "rtext":category, "rselectable":false, "rselected":false});
            textData.push({"tx":Math.round(categoryX + (curX - categoryX) / 2), "ty":Math.round(vertPadding + teamHeight + recHeight * 0.75),
                               "ttext":category, "tfont":"Arial Black", "tfontsize":"10px", "tselectable":false});
            curX += betweenCategoryHorizPadding;
          }
        }
        curX -= betweenCategoryHorizPadding;
        rectangleData.push({"rx":teamX, "ry":0, "rwidth":curX - teamX, 
                            "rheight":teamHeight, "rtext":team, "rselectable":false, "rselected":false});
        textData.push({"tx":Math.round(teamX + (curX - teamX) / 2), "ty":Math.round(teamHeight * 0.75),
                               "ttext":team, "tfont":"Arial Black", "tfontsize":"16px", "tselectable":false});
        curX += betweenTeamHorizPadding;
      }
    }

    // Add the rectangles
    var rectangles = chart.selectAll("rect").data(rectangleData).enter().append("rect");

    // Add the rectangle attributes
    var selectedColor = "#ccc";
    var notSelectedColor = "#eee";
    var rectangleAttributes = rectangles
              .attr("x", function (d) { return d.rx; })
              .attr("y", function (d) { return d.ry; })
              .attr("width", function (d) { return d.rwidth; })
              .attr("height", function (d) { return d.rheight; })
              .style("fill", "#eee")
              .on('mouseover', function (d) {
                  if (d.rselectable) {
                    // Change to a darker color to indicate hover
                    d3.select(this).style("fill", selectedColor);
                  }
                })
              .on('mouseout', function (d) {
                  // Change back to light color if not clicked
                  if (!d.rselected) {
                    d3.select(this).style("fill", notSelectedColor);
                  }
                })
              .on('click', function (d) {
                  // Toggle color if clicked
                  if (d.rselectable) {
                    if (!d.rselected) {
                      d3.select(this).style("fill", selectedColor);
                      d.rselected = true;
                    } else {
                      d3.select(this).style("fill", notSelectedColor);
                      d.rselected = false;
                    }
                  }
                });
              
    // Add all of the text
    var textBoxes = chart.selectAll("text").data(textData).enter().append("text");
    
    // All of the text attributes
    var textAttributes = textBoxes
              .attr("x", function (d) { return d.tx; })
              .attr("y", function (d) { return d.ty; })
              .attr("font-family", function (d) { return d.tfont; })
              .attr("font-size", function (d) { return d.tfontsize; })
              .text(function (d) { return d.ttext; })
              .style("text-anchor", "middle")
              .style("cursor", "default")
              .on('mouseover', function (d) {
                  if (d.tselectable) {
                    // Change to a darker color to indicate hover
                    rectangles.filter(function (rd) { return rd.rtext == d.ttext; }).style("fill", selectedColor);
                  }
                })
              .on('mouseout', function (d) {
                  // Change back to light color if not clicked
                  rectangles.filter(function (rd) { return rd.rtext == d.ttext; }).style("fill", function (rd) {
                    if (!rd.rselected) {
                      return notSelectedColor;
                    } else {
                      return selectedColor;
                    }
                  });
                })
              .on('click', function (d) {
                  // Toggle color if clicked
                  rectangles.filter(function (rd) { return rd.rtext == d.ttext; }).style("fill", function (rd) {
                    if (rd.rselectable) {
                      if (!rd.rselected) {
                        rd.rselected = true;
                        return selectedColor;
                      } else {
                        rd.rselected = false;
                        return notSelectedColor;
                      }
                    }
                  });
                });
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
      .tickFormat(function (d) { return "SEA " + d; })
      .tickValues([0, 10, 20, 30, 40]);
    // axis for midfield ticks
    var midfieldAxis = d3.svg.axis()
      .scale(x)
      .orient("top")
      .tickValues([50]);
    // axis for Broncos yard lines
    var invertedXAxis = d3.svg.axis()
      .scale(xInverted)
      .orient("top")
      .tickFormat(function (d) { return "DEN " + d; })
      .tickValues([0, 10, 20, 30, 40]);

    // add top Seahawks yard lines
    chart.append("g")
      .attr("class", "x axis")
      .call(xAxis);
    // add top midfield tick
    chart.append("g")
      .attr("class", "x axis")
      .call(midfieldAxis);
    // add top Broncos yard lines
    chart.append("g")
      .attr("class", "x axis")
      .call(invertedXAxis);
    // add bottom Seahawks yard lines
    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.orient("bottom"));
    // add bottom midfield tick
    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(midfieldAxis.orient("bottom"));
    // add bottom Broncos yard lines
    chart.append("g")
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
