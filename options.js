var objChkNotify;
var objDivAudio;
var objRdgSound;
var objAudio;
var objSoundList;
var objFleSound;
var flePthSound;
var spnQuote;
var spnMsg;
var arrQuote 	= new Array();
var arrMsg		= new Array();
var txtAudio;

function onload() {
	objChkNotify 	= document.getElementById("chkNotify");
	objDivAudio 	= document.getElementById("divAudio");
	objRdgSound		= document.options_form.rdgSound;
	objAudio 		= document.getElementById("audTest");
	objSoundList 	= document.getElementById("optSoundList");
	objFleSound 	= document.getElementById("fleSound");
	spnQuote		= document.getElementById("spanQuote");
	spnMsg			= document.getElementById("spanMsg");

	document.getElementById("title").innerText 	= chrome.i18n.getMessage("extName") + " " + chrome.i18n.getMessage("ttlOptions") ;
	document.getElementById("btnTest").value 	= chrome.i18n.getMessage("btnTest");
	document.getElementById("btnSave").value 	= chrome.i18n.getMessage("btnSave");
	document.getElementById("btnClose").value 	= chrome.i18n.getMessage("btnClose");

	showPrefsSoundListMenu();
	restoreOptions();
	}
	
function rdgOnChange(sttSound) {
	var txtSoundFile = localStorage.soundsource;
	switch (sttSound) {
		case "off":
			txtAudio = "";
			break;
		case "beep":
			txtAudio = "http://www.ibiblio.org/pub/multimedia/pc-sounds/ding.wav";
			break;
		case "file":
			if (flePthSound) {
				txtAudio = flePthSound;
			} else {
				txtAudio = "";
				alert("Select a File; Error: 400 options.rdgChange - unknown [flePthSound]");
				}
			break;
		case "list":
			txtAudio = urlMyServer + "/audio/alert_" + objSoundList.options[objSoundList.selectedIndex].value + ".wav";
			break;
		default:
			alert("Error: 400 options.rdgOnChange - unknown [sttSound]");
		}
	}
	
function handleFile(files) {
	objRdgSound[1].checked = true;
	// http://groups.google.com/a/chromium.org/group/chromium-extensions/browse_thread/thread/e351dd8a6f64f441/714de80678dc637f
	flePthSound = window.createObjectURL(files[0]);
	}
	
function showPrefsSoundListMenu () {
	var oRequest	= new XMLHttpRequest();
	oRequest.open("GET", "sources.txt", false);
	oRequest.send(null);
	arrFile = oRequest.responseText.split("\n");
	for (i = 0; i < arrFile.length; i++) {
		arrLine = arrFile[i].split("\t");
		mName		= arrLine[0];	// file list ID
		mFullName	= arrLine[1];	// performer name
		mQuote		= arrLine[2];	// quote
		mSize		= arrLine[3];	// file size (in kB)
		mChar		= arrLine[4];	// character name
		mSource		= arrLine[5];	// performance name
		mUrl		= arrLine[6];	// source WAV url
				
		var menuItem = document.createElement("option");	
		menuItem.value 		= mName;
		menuItem.text		= mFullName + " (" + mSize + "kB)";

		objSoundList.add(menuItem, i);
		arrQuote[i]	= mQuote;
		arrMsg[i]	= 'as ' + mChar + ' in ' + mSource;
		if (mName == localStorage.soundlist) {
			showPrefListDescription ( arrQuote[i] , arrMsg[i] );
			}
		}
	}

function showPrefListDescription (quote, tooltip) {
	// fill quote label
	msg = quote.replace(/\\/gi,"");	// remove \s from quote
	msg = msg.replace(/"/gi,"");	// remove "s from quote
	spnQuote.title = msg;
	if (msg.length > 32) { msg = msg.substring(0, 30) + " ..." };
	spnQuote.innerText = msg;
	// fill description label
	msg = tooltip.replace(/\\/gi,"");	// remove \s from description
	msg = msg.replace(/"/gi,"");		// remove "s from description
	spnMsg.title = msg;
	if (msg.length > 42) { msg = msg.substring(0, 40) + " ..." };
	spnMsg.innerText = msg;
	}	// END showPrefListDescription

function list_sources() {
	window.open(urlMyServer + "/audio/sources.txt");
	}

function testOptions() {
	if (objChkNotify.checked) {
		showNotification(-1);
		if (!objRdgSound[3].checked) {
			for (var i=0; i < objRdgSound.length; i++) {
				if (objRdgSound[i].checked) {
					rdgOnChange(objRdgSound[i].value);
					}
				}
			objAudio.src = txtAudio;
			objAudio.play();
			}
		}
	}
	
function saveOptions() {
	localStorage.notify	= objChkNotify.checked;
	for (var i=0; i < objRdgSound.length; i++) {
		if (objRdgSound[i].checked) {
			localStorage.sound	= objRdgSound[i].value;
			}
		}
	// if (flePthSound) { localStorage.soundfile = flePthSound };
	if (objRdgSound[1].checked) {
		alert("File paths cannot be stored due to security vulnerabilities");
		}
	localStorage.soundlist	= objSoundList.children[objSoundList.selectedIndex].value;
	closeOptions();
	}
	
function closeOptions() {
	return window.close()
	}
	
function showDivAudio () {
	if (objChkNotify.checked) {
		objDivAudio.style.display = "";
	} else {
		objDivAudio.style.display = "none";
		}
	}
	
function restoreOptions() {
	objChkNotify.checked = toBool(localStorage.notify);
	showDivAudio();
	
	for (var i=0; i < objRdgSound.length; i++) {
		if (objRdgSound[i].value == localStorage.sound) {
			objRdgSound[i].checked = true;
			}
		}
	// objFleSound.value	= localStorage.soundfile;
	objRdgSound.value	= localStorage.sound;
	objSoundList.value	= localStorage.soundlist;
	}
	
function optSoundListOnChange () {
	objRdgSound[2].checked = true;	// change option to list
	var i = objSoundList.selectedIndex;
	showPrefListDescription ( arrQuote[i] , arrMsg[i] );
	rdgOnChange("list");
	}