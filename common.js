/* ABOUT:
* ItsYourTurn Notifier
* get data from ItsYourTurn.com web server
* parse responseText to determine if new games are in 'Your Turn to move'
* display statusbar icon-text and/or notification
* further info: https://sites.google.com/site/deexaminer/iyt-notifier

/* THANKS:
*	Doron Rosenberg and Gmail Notifier for the idea and concepts
*	ClownCollege, Playa won, grbradt, KingKeato, and jlb104 for beta testing

/* ***** BEGIN LICENSE BLOCK *****
The contents of ItsYourTurn Notifier (the "file") are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.

The Original Code is contained within the file.

The Initial Developer of the Original Code is deExaminer.
Portions created by the Initial Developer are Copyright (C) 2008-2011
the Initial Developer. All Rights Reserved.

Contributor(s): .
 * ***** END LICENSE BLOCK ***** */

var urlIytServer 	= "http://www.itsyourturn.com";
var urlMyServer		= "https://sites.google.com/site/deexaminer/iyt-notifier";
var txtUsername		= "Username";
var blnMember		= false;
var intMoveLimit	= 99;
var intMovesLeft	= 99;
var txtTimeLeft		= "";
var iytTimer		= 180000;	

function getMessage (msgID) { document.write(chrome.i18n.getMessage(msgID)); }
function retMessage (msgID) { return chrome.i18n.getMessage(msgID); }

function showSite () {
	// check current windows and tabs to remove any ItsYourTurn tabs; then open new ItsYourTurn tab
	chrome.windows.getAll ( null, function (aWins) {
		for (var i = 0; i < aWins.length; i++ ) {
			chrome.tabs.getAllInWindow( aWins[i].id, function (aTabs) {
				for (var j = 0; j < aTabs.length; j++ ) {
					if (aTabs[j].url.substring(0,urlIytServer.length) == urlIytServer) {
						chrome.tabs.remove ( aTabs[j].id )
						} 
					}
				})
			}
		chrome.tabs.create( { url:urlIytServer , selected:true } );
		})

	checkStatus()
	}	// END showSite
	
function showNotification (howMany) {
		var msg = "";
		
		if (howMany != -1) {
			msg = txtUsername + " has " + howMany + " " + textPlural("turn", howMany) + " waiting";
		} else {
			msg = "ItsYourTurn Notifier test message";
			}
			
		// http://www.tizag.com/javascriptT/javascriptdate.php
		var currentDateTime = new Date();
		var hours = currentDateTime.getHours();
		var minutes = currentDateTime.getMinutes();
		if (minutes < 10) {
			minutes = "0" + minutes;
			}

		var ampm = "AM";

		if (hours == 0) {
			hours = 12;
		} else if (hours == 12) {
			ampm = "PM";
		} else if (hours > 12) {
			ampm = "PM";
			hours -= 12;
			}

		var currentTime = hours + ":" + minutes + " " + ampm;
		
		// http://dev.w3.org/2006/webapi/WebNotifications/publish/Notifications.html
		var notification  = webkitNotifications.createNotification(
			"/images/icon48_grn.png", 	// icon
			"ItsYourTurn.com @ " + currentTime,	// title
			msg);
		notification.onclick	= function () { showSite() };
		notification.show();
	}	// END showNotification

function checkStatus() {
	var hReq			= new XMLHttpRequest();
	// initialise
	chrome.browserAction.setIcon({path:"/images/icon48_ppl.png"});

	hReq.onreadystatechange = function () {
		if (hReq.readyState == 4) {			// 4 = request loaded
			if (hReq.status == 200) {		// 200 = OK
				showStatus(hReq.responseText);
			} else {
				chrome.browserAction.setIcon({path:"/images/icon48_ylw.png"});
				}
			}
		}; // END hReq.onreadystatechange
	hReq.open("GET", urlIytServer + "/pp?ffaddon", true); 	// get status from IYT server
	hReq.send(null); 										// send the get
	}	

function textPlural( word, number ) {
	if (number != 1) {
		return (word + "s");
	} else {
		return word;
		}
	}

function toBool( str ) {
	// http://www.toptip.ca/2009/11/google-chrome-extension-options-page.html
	if ("false" === str)
		return false;
	else 
		return str;
	}
	
function checkPrefs() {
	if (localStorage.notify == undefined) 		{ localStorage.notify = true };
	if (localStorage.sound == undefined) 		{ localStorage.sound = "beep" };
	if (localStorage.soundfile == undefined) 	{ localStorage.soundfile = "" };
	if (localStorage.soundlist == undefined) 	{ localStorage.soundlist = "kate" };
	if (localStorage.soundsource == undefined) 	{ localStorage.soundsource = "" };
	if (localStorage.intGameCount == undefined)	{ localStorage.intGameCount = 0 };
	}
	
function showStatus( rspText ) {
	//	rspText = httpRequest.responseText (text returned from ItsYourTurn server)
	txtUsername 			= parseGametext(rspText, "Name: ");
	var intLadderGames 		= parseInt(parseGametext(rspText, "Laddergames: "));
	var intTournamentGames 	= parseInt(parseGametext(rspText, "Tournamentgames: "));
	var intRegularGames 	= parseInt(parseGametext(rspText, "Regulargames: "));
	var intMoveLimit	= parseInt(parseGametext(rspText, "Movelimit: "));
	var intMovesLeft	= parseInt(parseGametext(rspText, "Movesleft: "));
	var txtTimeLeft 	= parseGametext(rspText, "TimeTillMore: ");

	if (parseInt(parseGametext(rspText, "Member: ")) == 1) {
		blnMember = true;
	} else {
		blnMember = false;
		};

	var intMyGames = intLadderGames + intTournamentGames + intRegularGames;
	if (intMyGames != parseInt(intMyGames)) { intMyGames = 0 };
	var intMessages = parseInt(parseGametext(rspText, "Newmessages: "));

	var fillToolTip	= function () { 
		var toolTipText = txtUsername.substring(0,txtUsername.length-1) + " has " + intMyGames + textPlural(" turn",intMyGames) + " waiting"
			+ fillToolTipGames(intLadderGames, retMessage("ladder"))
			+ fillToolTipGames(intTournamentGames, retMessage("tournament"))
			+ fillToolTipGames(intRegularGames, retMessage("regular"))
			+ fillToolTipGames(intMessages, textPlural(retMessage("message"),intMessages));
		if (blnMember) {
			toolTipText = String.fromCharCode(167) + toolTipText;
		} else {
			toolTipText += fillToolTipGames(intMovesLeft, textPlural(retMessage("turn"), intMovesLeft) + " " + retMessage("remaining"))
				+ "\n  " + txtTimeLeft.substring(0,txtTimeLeft.length-1) + " " + retMessage("until_more_turns");
			}
		chrome.browserAction.setTitle({title: toolTipText})
		};

	var fillToolTipGames = function (intTurns, txtDescription) {
		if (intTurns > 0) {
			return "\n" + "    ".substring(0,4-intTurns.toString().length) + intTurns + " " + txtDescription;
			}
		return "";
		};
	
	if (intMyGames > 0) { 	// new turns waiting
		chrome.browserAction.setIcon({path:"/images/icon48_grn.png"});
		chrome.browserAction.setBadgeText({text:intMyGames.toString()});
		if ((intMyGames > localStorage.intGameCount) && toBool(localStorage.notify)) {	// if new games > old game count
			showNotification(intMyGames);	// call notify
			var txtSoundFile = localStorage.soundlist;
			if (localStorage.sound == "file") {
				txtSoundFile = localStorage.soundfile;
				}
			soundAlert(localStorage.sound, txtSoundFile);
			}
		fillToolTip();
		localStorage.intGameCount = intMyGames; // prevents notify during next checkStatus call unless intMyGames changes && intMovesLeft
	} else { // no moves left
		chrome.browserAction.setIcon({path:"/images/icon48_brn.png"});
		if (intMessages > 0) {
			chrome.browserAction.setBadgeText({text:"0"});
			fillToolTip();
		} else {
			chrome.browserAction.setBadgeText({text:""});
			chrome.browserAction.setTitle({title:"ItsYourTurn Notifier"});
			localStorage.intGameCount = 0;
			}
		};
		
	if (rspText.indexOf("=START=") < 0) {
		chrome.browserAction.setIcon({path:"/images/icon48_clr.png"});
		chrome.browserAction.setBadgeText({text:""});
		chrome.browserAction.setTitle({title:"ItsYourTurn Notifier"});
		localStorage.intGameCount = 0;
		};
		
	}	// END showStatus

function soundAlert (sttSound, txtSoundFile) {
	var objAudio = document.getElementById("audio");
	switch (sttSound) {
		case "off":
			break;
		case "beep":
			objAudio.src = "http://www.ibiblio.org/pub/multimedia/pc-sounds/ding.wav";
			break;
		case "list":
			objAudio.src = urlMyServer + "/audio/alert_" + txtSoundFile + ".wav";
			break;
		case "file":
			objAudio.src = txtSoundFile;
		default:
			alert("Error: 400 soundAlert - unknown getCharPref(sound) [sttSound]");
		}
	}
	
function parseGametext (strText, strSearch) {
	/*
	strText = text being searched
	strSearch = search text
	returns the text after strSearch to endofline (\n)
	*/
	intStart = strText.indexOf(strSearch) + strSearch.length;
	intEnd   = strText.indexOf('\n', intStart);
	return strText.substring(intStart, intEnd);
	}