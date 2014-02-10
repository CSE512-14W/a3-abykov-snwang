a3-abykov-snwang
===============

## Team Members

1. Alexandre Bykov abykov@uw.edu
2. Stanley Wang snwang@uw.edu

## Project Name - Super Bowl Visualization

Our project is an interactive visualization of all the plays in Super Bowl 48. The intent of the visualization is to allow the user to see what plays happened and which players made the plays. The user will be able to either select a play and determine which players were involved or select a player and easily see all of the plays that the player made.

## Running Instructions

Access our visualization at http://cse512-14w.github.io/a3-abykov-snwang/ or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

## Story Board

[Storyboard file](storyboard.pdf?raw=true)

The storyboard shows the overall design of our visualization and examples of three possible interactions. The first page shows the initial view, which will have two main areas.
The top of the page will be a list of the names of the players for each team. The players are grouped into three tiers - first by team, then by offence/defence and then by their individual positions. Each name will be clickable to accommodate one of the interaction techniques discussed below.
The bottom of the page features an image of a football field with overlayed bars that indicate the plays. The position of each bar will indicate where the play started and how many yards were gained. The color of the bars will indicate the type of the play (run, pass, interception, etc.). While not shown on the prototype, there will also be an arrow at the end of each bar to show the direction of each play. Additionally, each bar will have a marking to distinguish which team is currently an offence (possibly a team logo or simply a small bar at one end with the color of the team). A legend below the field associates each color bar with its play type.

The second page of the storyboard illustrates what happens when a play bar is moused over. A small tooltip will appear above the bar that will have a description of the play. Additionally, both the bar and the players involved in the play will be highlighted. The intent is to allow the user to quickly see which players were involved on any given play.

The third page of the storyboard shows what happens when a player name is moused over. A small tooltip will appear next to the name of the player. The player's name and all of the plays that the player was involved in will be highlighted. This will allow the user to quickly see which plays the selected players was involved in and an aggregated summary of their stats for the whole game.

The final page of the storyboard illustrates what happens when a player's name is clicked. The player's name will be highlighted and the shown plays will be replaced with only plays that the player was involved in. This allows the user to drill down and learn more about each player's contribution to the game. If additional players are selected their plays will also be added to those shown.

To accomplish all of this we found a JSON dataset that contains a record of every play in the Super Bowl (Found on https://github.com/BurntSushi/nflgame). Additionally the dataset contains which players were involved in each play and the aggregate stats for each player. We also created a JSON file to associate each player with their position.

### Changes between Storyboard and the Final Implementation

The biggest change between the provided storyboard and the final implementation is the way that the players are visualized. The storyboard featured every position listed across the top and player names below their positions. Once we implemented this however, we realized that there were too many positions and there was not enough horizontal space to fit all of the player names. Therefore we decided to switch to a vertical list approach. The player are still grouped by team and by offense/defense/special teams but the positions are not listed vertically along the page. The player names are horizontally adjacent to their respective position. Switching to this vertical grouping allowed us to easily fit in all of the names. Additionally, we flipped the horizontal order of the position categories for the right team (Denver Broncos) to create a symmetric effect and allow space between the player lists for an image of the Super Bowl logo. One other significant change is that we decided to color code the plays based on the team that made the play rather than the play type. This allowed for a clean color coding system between the players, the endzone colors and the plays. The aesthetic looks of the field and the player lists are also different from the initial design as we felt that they were better choices.

## Development Process

The work was roughly split up along the two parts of the visualization. Alex worked mostly on the player names section and Stanley worked mostly on the plays section. After completing our individual sections we both worked on linking the sections together and fixing any final bugs that we found.

We spent about 50 hours working on this visualization, in total. A large portion of this time was spent modifying the data to fit our needs before we started developing the final visualization. The original JSON data had many mistakes and was not meant for our exact application. Thus we had to both clean it up and convert it into the format that we needed. It also took a long time to figure out a good way to organize both the player names and the plays. We went through several iterations of different placement techniques for both of those sections before we found one that worked well. Also, since neither one of us has a vast background in D3, we both spent a significant amount of time learning how to use it as we developed the application. Finally, getting all of the interactions to work (especially the coordination between the two parts of the visualization) was challenging and required a significant effort from both sides.
