// Width and height to use for the full visualization
var width = 1500;
var height = 1000;

// Horizontal and vertical padding around the player names
var betweenPositionHorizPadding = 5;
var betweenCategoryHorizPadding = 10;
var betweenTeamHorizPadding = 20;
var vertPadding = 15;

var svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height);

// Load in data about the player positions
var playerRectangles = d3.json("PlayerPositions.json", function(err, playerPositions) {
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
	var rectangles = svg.selectAll("rect").data(rectangleData).enter().append("rect");
 
	//Add the rectangle attributes
	var rectangleAttributes = rectangles
						.attr("x", function (d) { return d.rx; })
						.attr("y", function (d) { return d.ry; })
						.attr("width", function (d) { return d.rwidth; })
						.attr("height", function (d) { return d.rheight; });
});
// First we need to add coordinates to each of the 

var playData = d3.json("super-bowl.json", function(err, json) {

});