// Partition the visualization space.
var margin = {top: 40, right: 30, bottom: 20, left: 30},
    width = 1280*0.9 - margin.left - margin.right,
    height = 800*0.9 - margin.top - margin.bottom,
    botHeight = Math.round(width * (53.3 / 120.0)) * 0.9,
    topHeight = height - botHeight;
    
// Set up a tooltip div
var tooltip = d3.select("body").append("div")
                   .attr("id", "tooltip")
                   .style("width", "auto")
                   .style("height", "auto")
                   .style("background-color", "#eee")
                   .style("border", "2px solid #ccc")
                   .style("border-radius", "2px")
                   .style("pointer-events", "none")
                   .style("padding", "5px 10px 5px 10px")
                   .style("position", "absolute")
                   .style("visibility", "hidden")
                   .style("opacity", "0.95");
                   
var chart = d3.select("body").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top / 2 + margin.bottom);
// Add a title
var title = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")")
title.append("text")
     .text("Seahawks vs. Broncos: Every Play of Super Bowl XLVIII")
     .style("font-family", "Arial Black")
     .style("font-size", "18px")
     .style("visibility", "hidden");
var titleWidth = title.select("text").node().getComputedTextLength();
title.select("text")
     .attr("x", width / 2 - titleWidth / 2)
     .attr("y", margin.top / 5)
     .style("visibility", "visible");
var topChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var bottomChart = chart.append("g")
              .attr("transform", "translate(" + margin.left + "," + (1.75*margin.top + topHeight) + ")");

botHeight -= 1.25 * margin.top;

// Load in data about the player positions and stats
queue()
  .defer(d3.json, "player-positions.json")
  .defer(d3.json, "player-stats.json")
  .defer(d3.json, "top-plays.json")
  .await(drawElements);
  
function drawElements(err, playerPositions, playerStats, topPlays) {
// ----------------------------- TOP ---------------------------
  // Horizontal and vertical padding around the player names
  var betweenPositionHorizPadding = 1;
  var betweenCategoryHorizPadding = 10;
  var betweenTeamHorizPadding = 20;
  var vertPadding = 2;

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
  var recHeight = Math.floor((topHeight - vertPadding * (maxHeight + 1)) / (maxHeight + 3));
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
              // Check whether the x values should be flipped
              var rectX = curX;
              if (i == 1) {
                rectX += 2 * (playerWidth + betweenPositionHorizPadding);
              }
              rectangleData.push({"rx":rectX, "ry":curY, "rwidth":positionWidth, 
                                  "rheight":recHeight, "rtext":position, "rselectable":false, "rselected":false, "teamId":i});
              textData.push({"tx":Math.round(rectX + positionWidth / 2), "ty":Math.round(curY + recHeight * 0.75),
                             "ttext":position, "tfont":"Arial Black", "tfontsize":"10px", "tselectable":false, "teamId":i});                                    
              nameJson = categoryJson[k][position];
              
              // Iterate over each player
              for (var m = 0; m < nameJson.length; m++) {
                if (m > 0 && m % 2 == 0) {
                  curY += recHeight + vertPadding;
                }
                // Check whether the x values should be flipped
                var playerX = 0;
                if (i == 0) {
                  playerX = curX + positionWidth + betweenPositionHorizPadding;
                  if (m % 2 == 1) {
                    playerX += playerWidth + betweenPositionHorizPadding;
                  }
                } else {
                  playerX = curX + (1 - (m % 2)) * (playerWidth + betweenPositionHorizPadding);
                }
                if (curY + recHeight > topHeight) {
                  alert("WENT TOO FAR!");
                }
                rectangleData.push({"rx":playerX, "ry":curY, "rwidth":playerWidth, 
                                    "rheight":recHeight, "rtext":nameJson[m], "rselectable":true, "rselected":false, "teamId":i});
                textData.push({"tx":Math.round(playerX + playerWidth / 2), "ty":Math.round(curY + recHeight * 0.75),
                             "ttext":nameJson[m], "tfont":"Arial", "tfontsize":"10px", "tselectable":true, "teamId":i});   
              }
              
              curY += recHeight + vertPadding;
            }
          }

          curX += 2 * playerWidth + 2 * betweenPositionHorizPadding + positionWidth;
          rectangleData.push({"rx":categoryX, "ry":vertPadding + teamHeight, "rwidth":curX - categoryX, 
                              "rheight":recHeight, "rtext":category, "rselectable":false, "rselected":false, "teamId":i});
          textData.push({"tx":Math.round(categoryX + (curX - categoryX) / 2), "ty":Math.round(vertPadding + teamHeight + recHeight * 0.75),
                             "ttext":category, "tfont":"Arial Black", "tfontsize":"10px", "tselectable":false, "teamId":i});
          curX += betweenCategoryHorizPadding;
        }
      }
      curX -= betweenCategoryHorizPadding;
      rectangleData.push({"rx":teamX, "ry":0, "rwidth":curX - teamX, 
                          "rheight":teamHeight, "rtext":team, "rselectable":false, "rselected":false, "teamId":i});
      textData.push({"tx":Math.round(teamX + (curX - teamX) / 2), "ty":Math.round(teamHeight * 0.75),
                             "ttext":team, "tfont":"Arial Black", "tfontsize":"16px", "tselectable":false, "teamId":i});
      curX += betweenTeamHorizPadding;
    }
  }
  
  // Add an array for keeping track of all the selected players
  rectangleData.selectedPlayers = [];
  
  // Add the rectangles
  var rectangles = topChart.selectAll("rect").data(rectangleData).enter().append("rect");

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
                  
                  // Display the player stats
                  // First we need to find the relevant stats
                  var stats = playerStats[d.rtext];
                  
                  if (stats == undefined) {
                    tooltip.style("left", d.rx + d.rwidth + margin.left + "px")
                           .style("top", d.ry + margin.top + "px")
                           .style("visibility", "visible")
                           .append("div")
                           .text("No stats found")
                           .style("font-family", "Arial Black")
                           .style("font-size", "10px");
                  } else {
                    // Set up the tooltip
                    var statTooltip = tooltip.style("left", d.rx + d.rwidth + margin.left + "px")
                                             .style("top", d.ry + margin.top / 2 + "px")
                                             .style("visibility", "visible")
                                             .append("div");
                    for (statType in stats) {
                      statTooltip.append("div")
                                 .text(statType)
                                 .style("font-family", "Arial Black")
                                 .style("font-size", "10px")
                                 .append("br");
                      for (stat in stats[statType]) {
                        statTooltip.append("div")
                                   .text(stat + ": " + stats[statType][stat])
                                   .style("font-family", "Arial")
                                   .style("font-size", "10px")
                                   .append("br");
                      }
                    }
                  }
                  
                  // Flip the tooltip for denver
                  if (d.teamId == 1) {
                    var tooltipWidth = parseInt(tooltip.style("width"));
                    // -10 is for the padding
                    tooltip.style("left", d.rx - tooltipWidth + margin.left - 10 + "px");
                  }
                }
              })
            .on('mouseout', function (d) {
                // Change back to light color if not clicked
                if (!d.rselected) {
                  d3.select(this).style("fill", notSelectedColor);
                }
                
                // Reset the tooltip
                tooltip.style("visibility", "hidden").selectAll("div").remove();
              })
            .on('click', function (d) {
                // Toggle color if clicked
                if (d.rselectable) {
                  if (!d.rselected) {
                    d3.select(this).style("fill", selectedColor);
                    d.rselected = true;
                    rectangleData.selectedPlayers.push(d.rtext);
                  } else {
                    d3.select(this).style("fill", notSelectedColor);
                    d.rselected = false;
                    rectangleData.selectedPlayers.splice(rectangleData.selectedPlayers.indexOf(d.rtext), 1);
                  }
                  
                  // Now we need to update the plays based on the selected players
                  if (rectangleData.selectedPlayers.length == 0) {
                    addPlays(topPlays);
                  } else {
                    addPlays(topPlays.filter(function (pd) {
                              for (var i = 0; i < rectangleData.selectedPlayers.length; i++) {
                                var index = pd[1].players.indexOf(rectangleData.selectedPlayers[i]);
                                if(index >= 0) {
                                  return true;
                                }
                              }
                              return false;
                            }));
                  }
                }
              });
            
  // Add all of the text
  var textBoxes = topChart.selectAll("text").data(textData).enter().append("text");
  
  // All of the text attributes
  var textAttributes = textBoxes
            .attr("x", function (d) { return d.tx; })
            .attr("y", function (d) { return d.ty; })
            .attr("font-family", function (d) { return d.tfont; })
            .attr("font-size", function (d) { return d.tfontsize; })
            .text(function (d) { return d.ttext; })
            .style("text-anchor", "middle")
            .style("cursor", "default")
            .style("pointer-events", "none")
            .style("fill", function (d) {
                if (d.teamId == 0) {
                  return "steelblue";
                } else {
                  return "orange";
                }
              });
            
  // Display the Super Bowl logo in the middle
  var logoDim = topHeight * 2 / 3;
  topChart.append("image")
       .attr("xlink:href", "logo.jpg")
       .attr("width", logoDim)
       .attr("height", logoDim)
       .attr("x", width / 2 - logoDim / 2)
       .attr("y", topHeight - logoDim);
       
// ----------------------------- TOP ---------------------------

// --------------------------- BOTTOM --------------------------
       
  // scale for bar length
  var length = d3.scale.linear()
                  .domain([0, 100])
                  .range([0, width * (5/6)]);

  // scale for Seahawks yard lines
  var x = d3.scale.linear()
    .domain([-10, 110])
    .range([0, width]);
  // scale for Broncos yard lines (display only)
  var xInverted = d3.scale.linear()
    .domain([110, -10])
    .range([0, width]);
  // scale for field height
  var y = d3.scale.linear()
    .domain([0, 100])
    .range([0, botHeight]);
  // margin below the top yard lines and above the bottom yard lines
  var playMargin = 10;

  var teams = ["SEA", "DEN"];
  var types = ["pass", "run", "interception", "fumble", "kickoff", "punt"];
  var teamColors = d3.scale.ordinal()
    .domain(teams)
    .range(["steelblue", "orange"]);
  var typeColors = d3.scale.category10()
    .domain(types);

  var data = topPlays.filter(function (d) {
    return d[1].yards !== 0;
  });
  var numPlays = data.length;
  var topPlays = data.slice(0, numPlays);

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
  // axis for end zone boundaries
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickValues([]);

  // add top Seahawks yard lines
  bottomChart.append("g")
    .attr("class", "x axis")
    .call(xAxis);
  // add top midfield tick
  bottomChart.append("g")
    .attr("class", "x axis")
    .call(midfieldAxis);
  // add top Broncos yard lines
  bottomChart.append("g")
    .attr("class", "x axis")
    .call(invertedXAxis);
  // add bottom Seahawks yard lines
  bottomChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + botHeight + ")")
    .call(xAxis.orient("bottom"));
  // add bottom midfield tick
  bottomChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + botHeight + ")")
    .call(midfieldAxis.orient("bottom"));
  // add bottom Broncos yard lines
  bottomChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + botHeight + ")")
    .call(invertedXAxis.orient("bottom"));
  // add left end zone boundaries
  bottomChart.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  bottomChart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + x(0) + ",0)")
    .call(yAxis);
  // add right end zone boundary
  bottomChart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + xInverted(0) + ",0)")
    .call(yAxis);
  bottomChart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + xInverted(-10) + ",0)")
    .call(yAxis.orient("left"));

  // tooltip for play descriptions
  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-9, 0])
    .html(function (d) {
      var description = d[1].description;
      var lineSize = 70;
      var lines = [];
      var pointer = 0;
      while (description.length - pointer > lineSize) {
        var endOfLinePointer = pointer + lineSize;
        while (description[endOfLinePointer] !== " ")
          endOfLinePointer--;
        lines.push(description.substring(pointer, endOfLinePointer));
        pointer = endOfLinePointer + 1;
      }
      lines.push(description.substring(pointer, description.length));
      return lines.join("<br />");
    });
  bottomChart.call(tip);

  // fill the end zones
  bottomChart.append("rect")
    .attr("x", 1)
    .attr("y", 0)
    .attr("height", y(100) - y(0) - 1)
    .attr("width", x(0) - x(-10) - 1)
    .attr("fill", "steelblue");
  bottomChart.append("rect")
    .attr("x", xInverted(0) + 1)
    .attr("y", 0)
    .attr("height", y(100) - y(0) - 1)
    .attr("width", x(0) - x(-10) - 1)
    .attr("fill", "orange");
  // add logos in the end zones
  bottomChart.append("svg:image")
    .attr("xlink:href", "seahawks_logo_rotated_slab2.png")
    .attr("x", 1)
    .attr("y", 1)
    .attr("height", y(100) - y(0) - 2)
    .attr("width", x(0) - x(-10) - 1);
  bottomChart.append("svg:image")
    .attr("xlink:href", "broncos_logo_rotated_slab.png")
    .attr("x", xInverted(0) + 1)
    .attr("y", 0)
    .attr("height", y(100) - y(0) - 2)
    .attr("width", x(0) - x(-10) - 1);

  // add all the plays
  addPlays(topPlays);
  
  function addPlays(playData) {
    // Recalculate bar heights
    var barHeight = (botHeight - 2*playMargin) / playData.length;
    // Make sure the bars don't get too big
    if (barHeight > 0.05 * botHeight) {
      barHeight = Math.round(0.05 * botHeight);
    }
    
    // Remove any old bars
    bottomChart.selectAll(".bar").remove();
    
    var playBars = bottomChart.selectAll(".bar").data(playData);
    playBars.enter().append("g").attr("class", "bar");
    // add full bar for each play
    playBars.append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        var teamModifier = (d[1].team === "SEA") ? -1 : 1;
        var yardageModifier = (d[1].yards > 0) ? -1 : 1;
        var leftEnd = (teamModifier * yardageModifier > 0) ? d[1].startLine : d[1].endLine;
        return Math.round(x(leftEnd));
      })
      .attr("y", function (d, i) { return playMargin + i * barHeight; })
      .attr("height", barHeight - 1)
      .attr("width", function (d) {
        return Math.round(
            length(
              Math.abs(d[1].endLine - Math.min(Math.max(d[1].startLine, 0), 100))
            ));
      })
      .attr("text", function (d) { return d[1].description; })
      .attr("fill", function (d) { return teamColors(d[1].team); })
      .on("mouseover", function (d) {
        // Show a tooltip and highlight the related players
        tip.show(d);
        var players = d[1].players;
        for (var i = 0; i < players.length; i++) {
          rectangles.filter(function (rd) { return rd.rtext === players[i] })
                    .style("fill", selectedColor);
        }
      })
      .on("mouseout", function (d) {
        tip.hide(d);
        var players = d[1].players;
        for (var i = 0; i < players.length; i++) {
          rectangles.filter(function (rd) { return rd.rtext === players[i] })
                    .style("fill", function (rd) {
                      if (rd.rselected) {
                        return selectedColor;
                      } else {
                        return notSelectedColor;
                      }
                    });
        }
      });

    // add black bar at the location of the end of the play
    var blackBarWidth = 5;
    playBars.append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        var offset = (d[1].endLine < d[1].startLine) ? 0 : -1 * blackBarWidth;
        return Math.round(x(d[1].endLine) + offset);
      })
      .attr("y", function (d, i) { return playMargin + i * barHeight; })
      .attr("height", barHeight - 1)
      .attr("width", blackBarWidth)
      .attr("fill", "black")
      .on("mouseover", function (d) {
        // Show a tooltip and highlight the related players
        var players = d[1].players;
        for (var i = 0; i < players.length; i++) {
          rectangles.filter(function (rd) { return rd.rtext === players[i] })
                    .style("fill", selectedColor);
        }
      })
      .on("mouseout", function (d) {
        var players = d[1].players;
        for (var i = 0; i < players.length; i++) {
          rectangles.filter(function (rd) { return rd.rtext === players[i] })
                    .style("fill", function (rd) {
                      if (rd.rselected) {
                        return selectedColor;
                      } else {
                        return notSelectedColor;
                      }
                    });
        }
      });
  }  
// --------------------------- BOTTOM --------------------------
}
