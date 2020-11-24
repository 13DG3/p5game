
var songs=[0,0,0];
var songNames=["Beethoven-5th","savior",'Bohemian Rhapsody'];
var artistNames=["Beethoven","RiseAgainst",'Queen'];
var songLength=[420,242,360];
var songVols=[10,1,1.5];

var songValsRaw =[0,0,0];
var songVals =[[],[],[]];

var songIndex=2;
var amp;
var spec;
var colors = [];
var backgroundColour = 0;
var pieces = [];
var frequency1;
var frequency2;
var frequency3 = 0;
var state;
var speed=1;
var maxSpeed=10;
var spc;
var blockGenerator;
var playerObj;
var safetyZone;
var obst;
var sc;
var font;
var GameStates = ["Start","Playing","StartPopup","LevelComplete"]
var GameState = "StartPopup"
var CanPlay = false;
var doneCounter=0;
var levelCompleteScreen;

var levelDifficulty = 0;
var levelDifficultyMax = 0;

//
// Sets up all the object that will be required for the first scene
//
function setup() {
  createCanvas(900, 800);
  songs[0] = loadSound(songNames[0]+'.mp3',loaded)
  songs[1] = loadSound(songNames[1]+'.mp3')
  songs[2] = loadSound(songNames[2]+'.mp3')
  amp = new p5.Amplitude();
  frequency = new p5.FFT();
  playerObj = new Player();
  ss = new StartScreen();
  levelCompleteScreen = new CompleteScreen();
  sc = new scoreController();
  sc.score = 5566
  dataSetup();
}

//
// Puts data from csvs that were generated externally into an easier to manage format
//
function dataSetup()
{
  for(let i = 0;i<songVals.length;i++)
  {
    for(let j = 0;j<30;j++)
    {
      songVals[i].push(songValsRaw[i].rows[j].arr[0])
    }
  }
}

//
// Loads in csvs and the font
//
function preload()
{
  font = loadFont("font/Game.otf") ;
  songValsRaw[0]=loadTable(songNames[0]+".csv", "csv", "header");
  songValsRaw[1]=loadTable(songNames[1]+".csv", "csv", "header");
  songValsRaw[2]=loadTable(songNames[2]+".csv", "csv", "header");
}

//
// Allows for the piece to be navigated once the songs are loaded
//
function loaded() {
  CanPlay=true;
}

//
//Manages the drawing of each object based off  the pieces state
//
function draw() {
  clear();
  spec = frequency.analyze();
  background(backgroundColour, 0, 0);

  let j = map(mouseX, 0, 900, -0.8, 0.8)

  songs[songIndex].pan(j);
  BackgroundDraw();

  if(GameState=="Start")
  {
    StartDraw();
  }
  else if(GameState=="Playing")
  {
    PlayingDraw();
    if(frequency3===0)
      doneCounter ++;
    else
      doneCounter =0;
    if((doneCounter>100)&&(sc.difficultyTimer>=songLength[songIndex]))
    {
      levelCompleteScreen = new CompleteScreen();
      songs[songIndex].stop();
      songs[songIndex].play();
      songs[songIndex].setVolume(songVols[songIndex]/4);
      levelCompleteScreen.songFrequencies = sc.frequenciesArray;
      levelCompleteScreen.lives = playerObj.lives;
      levelCompleteScreen.processSounds();
      GameState = "LevelComplete"
    }
  }
  else if(GameState=="StartPopup")
  {
    StartDraw();
    StartPopup();
  }
  else if(GameState=="LevelComplete")
  {
    levelCompleteScreen.UpdateCompleteScreen();
  }
  playerObj.Update();
}

//
// plots, draws and read the frequencies from the FFT object
// and sets up the colour pallete for the background
// sets states based off frequency
//
function BackgroundDraw()
{
  strokeWeight(0);
  var f1 = 0;
  var f2 = 0;
  var f3 = 0;
  
  backgroundColour = frequency3 - 30;
  print(backgroundColour);
  for (var x = 0; x <= 299; x++) {
    stroke(backgroundColour + 60, 60, 60, 80);
    fill(backgroundColour + 60, 60, 60, 80);
    rect((300 - x) * 1.5, 0, 1.5, spec[x]);
    rect(x * 1.5 + 450, 0, 1.5, spec[x]);
    rect((300 - x) * 1.5, 800, 1.5, spec[x] * -1);
    rect(x * 1.5 + 450, 800, 1.5, spec[x] * -1);
    if (x < 100) {
      f1 += spec[x];
    }
    else if (x < 199) {
      f2 += spec[x];
    }
    else if (x < 299) {
      f3 += spec[x];
    }
  }
  frequency1 = Math.floor(f1 / 100);
  frequency2 = Math.floor(f2 / 100);
  frequency3 = Math.floor(f3 / 100);
  if(frequency3>130)
  {
    state=3;
  }
  else if(frequency3>100)
  {
    state =2;
  }
  else if(frequency3>80)
  {
    state =1;
  }
  else
    state =0;
}

//
// Handles all the rendering for the start up 
//
function StartPopup()
{
  fill(255);
  rect(50,230,800,450);
  textAlign(CENTER,CENTER);
  
  fill(backgroundColour,0,0,130);
  if(CanPlay)
    fill(0);
  textSize(ContinueButton())
  text("CONTINUE",450,610);
  fill(0);
  textSize(60)
  text("NOTE",450,255);
  textSize(20)
  text("The beat and path is a graphical representation of the",450,300); 
  text("sound intensity of specific tracks. The aspects",450,320);
  text("of the tracks that are represented are their frequencies",450,340);
  text("and their frequencies amplitudes.",450,360);

  text("The frequencies are represented by:",450,400);
  text("While their amplitudes are represented by:",450,495);

  textAlign(LEFT, CENTER)
  text("- The speed of the level",150,430);
  text("- The size of the path, obstacles, score and life counters",150,455);
  
  text("- the background colours",150,525);
  text("- the background synthesizer effect",150,550);
}

//Logic for mouse hovering helps with buttons
function ContinueButton()
{
    if (mouseX > 335 
      && mouseX < 335 +230
      && mouseY > 580 
      && mouseY < 580 +45) 
      return 55;
    return 45;
}

//
// Handles all the rendering and for the start state 
//
function StartDraw()
{
  ss.UpdateStartScreen();
}

//
// Handles all the rendering and logic for the level complete screen 
//
function CompleteScreen()
{
  this.difficulty=10;
  this.lives=0;
  this.Total;
  this.songFrequencies;
  this.makecsv=true;
  
  //
  //handles the drawing logic for level complete screen
  //draws the graph for the level complete screen
  this.UpdateCompleteScreen=function()
  {
    this.Total= Math.floor(Math.floor(sc.score)*(this.lives+1));

    textAlign(CENTER,TOP);
    textFont(font);
    fill(255);
    textSize(60);
    text("LEVEL COMPLETE",450,20);
    rect(200,150,500,500);

    textSize(50);
    fill(backgroundColour,0,0);
    text("SCORE",450,170);
    textSize(this.MainMenuSize());
    text("MAIN MENU",450,580);
    textSize(65);
    text(this.Total,450,300);
    
    textSize(25);
    text("Total:",260,320);
    textSize(20);
    text("X",450,270);
    textSize(30);
    text(Math.floor(sc.score),550,230);
    text('1 + '+this.lives,550,265);
    text("Level:",300,230);
    text("Lives:",300,265);
    textSize(20);
    fill(0,0,0,60);

    let groupSize = Math.floor(songLength[songIndex]/30);
    for(let i =0 ; i < songVals[0].length;i++)
    {
      fill(0,0,0,200);
      if(groupSize*i<sc.difficultyTimer)
        fill(0);
      rect(225+i*15,545,15,songVals[0][i]*-1);

      this.whatFill(i+1);
      ellipse(225+i*15+7.5,555,15,15);
    }

  }

  // "Places" red balls for the finished screen
  this.whatFill=function(currentPos)
  {
    let groupSize = Math.floor(songLength[songIndex]/30);
    for(let j =1;j<4;j++)
    {
      if(playerObj.deaths[j]<currentPos*groupSize 
        && playerObj.deaths[j]>(currentPos-1)*groupSize )
      {
        fill(130,0,0);
        return;
      }
    }
    let deaths = 0;
    for(let j =1;j<4;j++)
    {
      if(playerObj.deaths[j]<currentPos*groupSize)
      {      
        deaths++;
      }
    }
    fill(255);
    return;
  }

  // Gets the values for finished screen graph
  this.processSounds=function()
  {
    this.songFrequencies = songVals[songIndex];
  }

  //Logic for mouse hovering helps with buttons
  this.MainMenuSize=function()
  {
    if (mouseX > 335 
      && mouseX < 335 +230
      && mouseY > 580 
      && mouseY < 580 +45) 
      return 50;
    return 40;
  }
}

//
// Handles all the rendering and logic for the level complete screen 
//
function StartScreen()
{
  // Renders start screen
  this.UpdateStartScreen = function()
  {
    textAlign(CENTER,TOP);
    textFont(font);
    fill(255);
    textSize(60);
    text("THE BEAT AND PATH",450,20);
    textSize(45);
    text("RULES",450,90);
    textSize(20);
    text("Pick a song",450,140);
    text("keep your mouse on the path",450,165);
    text("Avoid obstacles",450,190);
    rect(0,300,900,200); 
    textSize(this.PlayHovered());
    fill(backgroundColour,0,0);
    if(!CanPlay)
      fill(backgroundColour,0,0,130);
    text("play",150,380);
    textSize(45);
    text("song",600,320);
    textSize(30);
    text(artistNames[songIndex],600,430);
    textAlign(CENTER,TOP);
    textSize(this.NextSongHovered());
    text("Next",650,460);

    textSize(this.PrevSongHovered());
    text("Prev",550,460);

    this.UpdateY();
    text(songNames[songIndex],600,365);
    fill(backgroundColour + 60, 60, 60,80)
    text(songNames[songIndex],600,365);

  }

  // checks if play button is hovered
  this.PlayHovered = function()
  {
    if (mouseX > 100 
      && mouseX < 200 
      && mouseY > 380 
      && mouseY < 380 +50) 
      return 55;
    return 45;
  }
  // checks if next button is hovered
  this.NextSongHovered = function()
  {
    if (mouseX > 615 
      && mouseX < 615+75 
      && mouseY > 460 
      && mouseY < 460 +25) 
      return 30;
    return 20;
  }

  // checks if prev button is hovered
  this.PrevSongHovered = function()
  {
    if (mouseX > 515 
      && mouseX < 515+75 
      && mouseY > 460 
      && mouseY < 460 +25) 
      return 30;
    return 20;
  }

  // updates size of song names based of frequencies
  this.UpdateY = function()
  {
    textSize(30+30*frequency3/150);
  }
}

//handles all of the rendering for the playing state
function PlayingDraw() {
  safetyZone.updatePiece();
  block.UpdateRoadController();
  spc.Update();
  obst.UpdateObstacleController();
  sc.updateScore();
}

//
// Is the objects for road pieces
//
function roadPiece(yPos)
{
  this.xPos = 1000;
  this.yPos = yPos;
  this.width = 100;
  this.height = 200;
  this.shouldDisplay = false;
  this.colours=255;

  //handles the movement and rendering for roadpieces
  this.updatePiece = function()
  {
    if(!this.shouldDisplay)
    {
      this.xPos-= speed;
      strokeWeight(0);
      fill(this.colours,255,255);
      this.UpdateY();
      rect(this.xPos, this.yPos-this.height/2, this.width, this.height);
      if(this.xPos<-this.width)
      {
        this.shouldDisplay = true;
      }
    }
  }

  // Checks if the piece is connected to the player
  this.IsConnectedToPlayer = function()
  {
    var a =this.xPos + this.width;
    var b = this.yPos + this.height/2;

    if (
         mouseX > this.xPos 
      && mouseX < a 
      && mouseY > this.yPos - this.height/2
      && mouseY < b) 
          return true;
    return false;
  }

  //updates the heigh of the block based off the frequencies
  this.UpdateY = function()
  {
    this.height = 170 + frequency3/150*80
  }
}

//
// Manages the road pieces
//
function roadController()
{
  this.pieces = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  this.piecesIndex = 0;
  this.canMakeBlock = true;
  this.blockWidth =100;
  this.yBase = 450
  this.prevY = 450;

  //
  // Handles the generation of road pieces using object pooling 
  // Handles the updating of road pieces and their offset
  // Checks if the player is attached to the road and if not triggers the players death
  //
  this.UpdateRoadController = function()
  {
    if (this.canMakeBlock)
    {
      this.canMakeBlock = false;
      let random = this.RandomOffset();

      var tempPiece =new roadPiece(400+random);

      this.pieces[this.piecesIndex] = tempPiece;
      if(this.piecesIndex>=12)
        this.piecesIndex=0
      else
        this.piecesIndex ++;

      playerObj.roadPieces[playerObj.roadPiecesIndex] = tempPiece;
      if(playerObj.roadPiecesIndex>=12)
        playerObj.roadPiecesIndex=0
      else
        playerObj.roadPiecesIndex ++;
    }
    if(!playerObj.CheckCol())
    {
      playerObj.loseLife();
    }

    for (let i = 0; i < this.pieces.length; i++) 
    {
      if(this.pieces[i]!=0)
        this.pieces[i].updatePiece();
    }
    this.blockWidth-=speed;
    if(this.blockWidth<maxSpeed)
    {
      this.canMakeBlock = true;
      this.blockWidth = 100;
    }
  }

  //gives road pieces an offset based off the range of frequencies they fall into
  this.RandomOffset = function()
  {
    this.minOffset;
    this.maxOffset;

    if (state==3)
    {
      this.minOffset=-90;
      this.maxOffset=90;
    }
    else if (state==2)
    {
      this.minOffset=-60;
      this.maxOffset=60;
    }
    else if (state==1)
    {
      this.minOffset=-45;
      this.maxOffset=45;
    }
    else
    {
      this.minOffset=-30;
      this.maxOffset=30;
    }
    let j = map(Math.random(0,10), 0, 1, this.minOffset, this.maxOffset)
    return j;  
  }
}

//
// Handles the speed of all object depending on frequency
//
function speedController()
{
  this.Update = function()
  {
    speed = 0.5+ 5*frequency3/150
  }
}

//
// The player object
//
function Player()
{
  this.roadPieces =[0,0,0,0,0,0,0,0,0,0,0,0,0];
  this.roadPiecesIndex = 0;
  this.x;
  this.y;
  this.lives = 0;
  this.dead = false;
  this.deadTimer = 0;
  this.deaths = [-1,-1,-1,-1];

  //handles the players death state
  //fascilitates drawing the player
  this.Update= function()
  {
    this.x = mouseX;
    this.y = mouseY;
    this.diameter =15;
    if(this.dead &&GameState=="Playing")
    {

      this.deadTimer++;
      songs[songIndex].setVolume(songVols[songIndex]/10
        +this.deadTimer/200*songVols[songIndex]*4/10);
      
      if (this.deadTimer>200||(this.deadTimer>50&&this.lives==0))
      {
        this.deadTimer = 0;
        if (this.lives==0)
        {
          GameState="LevelComplete"
          levelCompleteScreen = new CompleteScreen();
          levelCompleteScreen.lives = this.lives;
          levelCompleteScreen.songFrequencies = sc.frequenciesArray;
          songs[songIndex].stop();
          songs[songIndex].play();
          songs[songIndex].setVolume(songVols[songIndex]/4);
        }
        this.dead = false;
        songs[songIndex].setVolume(songVols[songIndex]);
      }
    }
    this.Draw();
  }

  // checks if the player has collided with a road piece
  this.CheckCol = function()
  {
    if(safetyZone.IsConnectedToPlayer())
      return true;
    for(var i=0; i < this.roadPieces.length; i++)
    {
      if(this.roadPieces[i]!=0)
      {
        if( this.roadPieces[i].IsConnectedToPlayer())
        {
          return true;
        }
      }
    }
    return false;
  }

  //handles when the player loses a life
  this.loseLife=function()
  {
    if(this.dead)
      return;
    else
    {
      this.dead=true;
      this.deaths[this.lives]=sc.difficultyTimer;
      songs[songIndex].setVolume(songVols[songIndex]/10);
      this.lives --;
    }
  }

  this.Draw = function()
  {
    fill(180);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}

//
// The obstacle object
//
function obstaclePiece()
{
  this.xPos = 1000;
  this.yPos = 550;
  this.width = 10;
  this.height = 50;
  this.shouldDisplay = false;
  this.colours=255;
  this.player = playerObj;
  this.construct=true;
  this.offset=0;

  // handles obstacles movement and checks if connected to the player
  this.updateObst = function()
  {
      this.xPos-= speed;
      strokeWeight(0);
      fill(backgroundColour,0,0);
      this.UpdateY();
      rect(this.xPos + 20, this.yPos-this.height/2+ this.offset -130, this.width, this.height);

      if(this.IsConnectedToPlayer())
      {
        playerObj.loseLife();
      }
  }

  //resets the offset of the block
  this.reset = function()
  {
    this.offset = this.RandomOffset();
  }

  // Checks if the obstacle is connected to the player
  this.IsConnectedToPlayer = function()
  {
    if(GameState=="Playing")
    {
      if (mouseX > this.xPos +20 
        && mouseX < this.xPos +20 + this.width 
        && mouseY > this.yPos-this.height/2+ this.offset -130 
        && mouseY < this.yPos+this.height/2+ this.offset -130) 
          return true;
    }
    return false;
  }

  // gives the obstacle a random offset
  this.RandomOffset = function()
  {
    this.minOffset;
    this.maxOffset;
    this.minOffset=-120;
    this.maxOffset=120;
    let j = map(Math.random(0,10), 0, 1, this.minOffset, this.maxOffset)
    return j;  
  }

  //changes the height of the obstacle depending on frequencies
  this.UpdateY = function()
  {
    this.height = 20 + 50*frequency3/150;
  }
}

//
// Manages the obstacle pieces
//
function obstacleController()
{
  this.obsts = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  this.obstsIndex = 0;
  this.canMakeBlock = true;
  this.yBase = 450
  this.prevY = 450;
  this.periodX = 70;
  this.periodXO = 70;

  // updates obastacles makes new ones
  this.UpdateObstacleController = function()
  {
    if (this.canMakeBlock)
    {
      this.canMakeBlock = false;

      var tempObst = new obstaclePiece();
      tempObst.reset();

      this.obsts[this.obstsIndex] = tempObst;
      if(this.obstsIndex>=48)
        this.obstsIndex=0;
      else
        this.obstsIndex ++;
    }

    for (let i = 0; i < this.obsts.length; i++) 
    {
      if(this.obsts[i]!=0)
        this.obsts[i].updateObst();
    }
    this.periodX-=speed;
    if(this.periodX<0)
    {
      this.periodX = this.periodXO
      this.canMakeBlock = true;
    }
  }
}

//
// Controls score components
//
function scoreController()
{
  this.score=0;
  this.difficultyTimer=0;
  this.frequenciesArray=[];

  //
  // Updates scores manages score ui tracks time and draws player lives icons
  //
  this.updateScore = function()
  {
    if(!playerObj.dead)
    {
      if(state==3)
      {
        this.score += 0.5;
      }
      if(state==2)
      {
        this.score += 0.2;
      }
      if(state==1)
      {
        this.score += 0.1;
      }
      if(state==0)
      {
        this.score += 0.05;
      }
      textSize(50+20*frequency3/140);
    }
    else
      textSize(50);

    textFont(font);
    fill(255);
    textAlign(CENTER, BOTTOM)
    text(Math.floor(this.score), 450, 750);
    textSize(50);
    text("SCORE", 450, 800);
    text("LIVES", 450, 50);
    fill(180);

    levelDifficulty +=frequency3;
    levelDifficultyMax +=160;

    if(Math.floor( songs[songIndex].currentTime())==this.difficultyTimer)
    {
      this.difficultyTimer++;
      this.frequenciesArray.push(frequency3);
    }

    if(playerObj.lives>=1)
    {
      fill(255);
      ellipse(390, 80, 30+20*frequency3/150, 30+20*frequency3/150);
      fill(180);
      ellipse(390, 80, 15, 15);
    }      
    else
    {
      fill(100);
      ellipse(390, 80, 15+20*frequency3/150, 15+20*frequency3/150);
    }
    if(playerObj.lives>=2)
    {
      fill(255);
      ellipse(450, 80, 30+20*frequency3/150, 30+20*frequency3/150);
      fill(180);
      ellipse(450, 80, 15, 15);
    }      
    else
    {
      fill(100);
      ellipse(450, 80, 15+20*frequency3/150, 15+20*frequency3/150);
    }
    if(playerObj.lives>=3)
    {
      fill(255);
      ellipse(510, 80, 30+20*frequency3/150, 30+20*frequency3/150);
      fill(180);
      ellipse(510, 80, 15, 15);
    }      
    else
    {
      fill(100);
      ellipse(510, 80, 15+20*frequency3/150, 15+20*frequency3/150);
    }
  }
}

//
// tracks if buttons are pressed and manages game state changes
//
function mousePressed()
{
  if (GameState=="Start")
  {
    if(ss.PlayHovered()==55&&CanPlay)
    {
      GameState="Playing"
      songs[songIndex].stop();
      songs[songIndex].play();
      safetyZone = new safeZone();
      playerObj = new Player();
      playerObj.deaths=[-1,-1,-1,-1];
      playerObj.lives=3;
      block = new roadController();
      spc = new speedController();
      obst = new obstacleController();
      sc = new scoreController();
      songs[songIndex].setVolume(songVols[songIndex]);
      levelDifficulty =0;
      levelDifficultyMax=0;
    }
    if(ss.NextSongHovered()==30&&CanPlay)
    {
      songs[songIndex].stop();
      if(songIndex==2)
        songIndex=0;
      else
        songIndex ++;
      songs[songIndex].play();
      songs[songIndex].setVolume(songVols[songIndex]);
    }
    if(ss.PrevSongHovered()==30&&CanPlay)
    {
      songs[songIndex].stop();
      if(songIndex==0)
        songIndex=2;
      else
        songIndex --;
      songs[songIndex].setVolume(songVols[songIndex]);
      songs[songIndex].play();
    }
  }
  if (GameState=="LevelComplete")
  {
    if(levelCompleteScreen.MainMenuSize()==50&&CanPlay)
    {
      songs[songIndex].stop();
      GameState="Start";
      songs[songIndex].setVolume(songVols[songIndex]/4);
      songs[songIndex].play();
    }
  }
  if (GameState=="StartPopup")
  {
    if(ContinueButton()==55&&CanPlay)
    {
      songs[songIndex].stop();
      GameState="Start";
      songs[songIndex].setVolume(songVols[songIndex]);
      songs[songIndex].play();
    }
  }
}

//
// Generates and manages safe zone that is spawned at the start of levels
//
function safeZone()
{
  this.xPos = 0;
  this.yPos = 400;
  this.width = 1100;
  this.height = 200;
  this.shouldDisplay = false;
  this.colours=255;

  this.updatePiece = function()
  {
    if(!this.shouldDisplay)
    {
      this.xPos-= speed;
      strokeWeight(0);
      fill(this.colours,255,255);
      this.UpdateY();
      rect(this.xPos, this.yPos-this.height/2, this.width, this.height);
      if(this.xPos<-this.width)
      {
        this.shouldDisplay = true;
      }
    }
  }

  this.IsConnectedToPlayer = function()
  {
    var a =this.xPos + this.width;
    var b = this.yPos + this.height/2;

    if (
         mouseX > this.xPos 
      && mouseX < a 
      && mouseY > this.yPos - this.height/2
      && mouseY < b) 
          return true;
    return false;
  }

  this.UpdateY = function()
  {
    this.height = 170 + frequency3/150*80
  }
}
