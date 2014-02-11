fs = require('fs');
fs.readFile("super-bowl-pretty.json", function (err, data) {
  var json = JSON.parse(data);
  var plays = [];
  var drives = json["2014020200"]["drives"];
  for (var driveId in drives) {
    var drive = drives[driveId];
    var team = drive.posteam;
    var orderedPlays = [];

    // add each play with its yardage
    for (var playId in drive.plays) {
      var play = drive.plays[playId];
      orderedPlays.push([parseInt(playId), play]);
    }

    // sort to make sure in correct order
    orderedPlays.sort(function (a, b) {
      return (a[0] < b[0]) ? -1 : (a[0] > b[0]) ? 1 : 0;
    });

    var convertYardline = function (yardline) {
      var match = yardline.match(/([A-Z]{3}) (-?\d+)/);
      if (!match) {
        return 50;
      } else {
        var yardNum = parseInt(match[2]);
        if (match[1] == "SEA")
          return yardNum;
        else
          return 100 - yardNum;
      }
    };
    for (var i = 0; i < orderedPlays.length; i++) {
      var playId = orderedPlays[i][0];
      var play = orderedPlays[i][1];
      var includesTerm = function (note) {
        return function (term) {
          if (note == null)
            return false;

          var terms = note.split(",");
          for (var i = 0; i < terms.length; i++) {
            var curTerm = terms[i].trim();
            if (curTerm == term)
              return true;
          }
          return false;
        };
      }(play.note);

      var yards = orderedPlays[i][1].ydsnet;
      if (i > 0 && !includesTerm("PUNT") && !includesTerm("FUMBLE") && !includesTerm("INT"))
        yards -= orderedPlays[i-1][1].ydsnet;

      var team = play.posteam;

      var players = [];
      for (var playerId in play.players) {
        if (playerId !== 0) {
          players.push(play.players[playerId][0].playerName);
        }
      }

      if (play.note === "KICKOFF") {
        var match = play.desc.match(/for (\d+) yards/);
        if (match)
          yards = parseInt(match[1]);
        else
          yards = 0;
      } else if (play.note === "PENALTY")
        yards = 0;

      var type = "";
      if (play.note === "INT")
        type = "interception";
      else if (play.note === "FUMBLE")
        type = "fumble";
      else if (play.note === "KICKOFF")
        type = "kickoff";
      else if (play.note === "PUNT")
        type = "punt";
      else if (play.desc.match(/pass/))
        type = "pass";
      else
        type = "run";

      var endLine = convertYardline(play.yrdln);
      if (team === "SEA")
        endLine += yards;
      else
        endLine -= yards;

      var obj = {
        "id": playId,
        "team": team,
        "yards": yards,
        "startLine": convertYardline(play.yrdln),
        "endLine": endLine,
        "players": players,
        "description": play.desc,
        "type": type
      };
      plays.push([yards, obj]);
    } // for (var i = 1; i < orderedPlays.length; i++) {
  } // for (var driveId in drives) {

  // sort by yardage in descending order
  plays.sort(function (a, b) {
    return (a[0] < b[0]) ? 1 : (a[0] > b[0]) ? -1 : 0;
  });

  fs.writeFile("top-plays.json", JSON.stringify(plays));
});
