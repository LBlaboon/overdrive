/*
 * overdrive.js
 * Copyright (C) 2016  L. Bradley LaBoon <me@bradleylaboon.com>
 *
 * This file is part of Overdrive.
 *
 * Overdrive is free software: you can redistribute it and/or modify it under
 * the terms terms of the GNU General Public License as published by the Free
 * Software Foundation, either verion 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* Global Namespace */
var _overdrive = {};

/* Settings */
_overdrive.settings = {};
_overdrive.settings.binaryKB = true;
_overdrive.settings.columns = [
	"id",
	"name",
	"totalSize",
	"status",
	"percentDone",
	"rateDownload",
	"rateUpload",
	"eta",
	"uploadRatio"
];
_overdrive.settings.rpcURL = "/transmission/rpc";
_overdrive.settings.refreshRate = 1000;
// This will be initialized after the first request to the server
_overdrive.settings.sessionID = "";

/* Data Objects */
_overdrive.data = {};
_overdrive.data.columnNames = {};
_overdrive.data.selected = [];
_overdrive.data.torrents = {};
_overdrive.data.torrentsDetail = {};
_overdrive.data.torrentStat = {};
_overdrive.data.session = {};

/* Torrent Status (values given by Transmission RPC) */
_overdrive.data.torrentStat.stopped = 0;
_overdrive.data.torrentStat.checkWait = 1;
_overdrive.data.torrentStat.check = 2;
_overdrive.data.torrentStat.downloadWait = 3;
_overdrive.data.torrentStat.download = 4;
_overdrive.data.torrentStat.seedWait = 5;
_overdrive.data.torrentStat.seed = 6;
_overdrive.data.torrentStatStrings = [
	"Paused",
	"Waiting (C)",
	"Checking",
	"Waiting (D)",
	"Downloading",
	"Waiting (S)",
	"Seeding"
];

/* Torrent Column Names */
_overdrive.data.columnNames.activityDate = "Activity Date";
_overdrive.data.columnNames.addedDate = "Added Date";
_overdrive.data.columnNames.bandwidthPriority = "Priority";
_overdrive.data.columnNames.comment = "Comment";
_overdrive.data.columnNames.corruptEver = "Corrupt";
_overdrive.data.columnNames.creator = "Creator";
_overdrive.data.columnNames.dateCreated = "Date Created";
_overdrive.data.columnNames.desiredAvailable = "Desired Available";
_overdrive.data.columnNames.doneDate = "Finished Date";
_overdrive.data.columnNames.downloadDir = "Directory";
_overdrive.data.columnNames.downloadedEver = "Downloaded Ever";
_overdrive.data.columnNames.downloadLimit = "Down Limit";
_overdrive.data.columnNames.downloadLimited = "Down Limited";
_overdrive.data.columnNames.error = "Error";
_overdrive.data.columnNames.errorString = "Error String";
_overdrive.data.columnNames.eta = "ETA";
_overdrive.data.columnNames.etaIdle = "ETA Idle";
_overdrive.data.columnNames.hashString = "Hash";
_overdrive.data.columnNames.haveUnchecked = "Unchecked";
_overdrive.data.columnNames.haveValid = "Downloaded";
_overdrive.data.columnNames.honorsSessionLimits = "Honors Session Limits";
_overdrive.data.columnNames.id = "#";
_overdrive.data.columnNames.isFinished = "Finished";
_overdrive.data.columnNames.isPrivate = "Private";
_overdrive.data.columnNames.isStalled = "Stalled";
_overdrive.data.columnNames.leftUntilDone = "Remaining";
_overdrive.data.columnNames.magnetLink = "Magnet Link";
_overdrive.data.columnNames.manualAnnounceTime = "Time Until Manual Announce";
_overdrive.data.columnNames.maxConnectedPeers = "Max Connected Peers";
_overdrive.data.columnNames.metadataPercentComplete = "Metadata Progress";
_overdrive.data.columnNames.name = "Name";
_overdrive.data.columnNames["peer-limit"] = "Peer Limit";
_overdrive.data.columnNames.peersConnected = "Peers";
_overdrive.data.columnNames.peersGettingFromUs = "Peers Taking";
_overdrive.data.columnNames.peersSendingToUs = "Peers Giving";
_overdrive.data.columnNames.percentDone = "Progress";
_overdrive.data.columnNames.pieceCount = "Pieces";
_overdrive.data.columnNames.pieceSize = "Piece Size";
_overdrive.data.columnNames.queuePosition = "Position";
_overdrive.data.columnNames.rateDownload = "Down Speed";
_overdrive.data.columnNames.rateUpload = "Up Speed";
_overdrive.data.columnNames.recheckProgress = "Recheck Progress";
_overdrive.data.columnNames.secondsDownloading = "Time Downloading";
_overdrive.data.columnNames.secondsSeeding = "Time Seeding";
_overdrive.data.columnNames.seedIdleLimit = "Seed Idle Limit";
_overdrive.data.columnNames.seedIdleMode = "Seed Idle Mode";
_overdrive.data.columnNames.seedRatioLimit = "Seed Ratio Limit";
_overdrive.data.columnNames.seedRatioMode = "Seed Ratio Mode";
_overdrive.data.columnNames.sizeWhenDone = "Wanted Size";
_overdrive.data.columnNames.startDate = "Start Date";
_overdrive.data.columnNames.status = "Status";
_overdrive.data.columnNames.totalSize = "Size";
_overdrive.data.columnNames.torrentFile = "Torrent File";
_overdrive.data.columnNames.uploadedEver = "Uploaded";
_overdrive.data.columnNames.uploadLimit = "Up Limit";
_overdrive.data.columnNames.uploadRatio = "Ratio";
_overdrive.data.columnNames.webseedsSendingToUs = "Web Seeds";

// List of columns that contain string data
_overdrive.data.stringCols = [
	"comment",
	"creator",
	"downloadDir",
	"errorString",
	"hashString",
	"name",
	"torrentFile"
];

/* Last sent/received tags */
_overdrive.data.lastSent = 0;
_overdrive.data.lastReceived = -1;
_overdrive.data.lastSentSession = 0;
_overdrive.data.lastReceivedSession = -1;
_overdrive.data.lastSentDetail = 0;
_overdrive.data.lastReceivedDetail = -1;

/* UI Object */
_overdrive.ui = {};

/* Button variables */
_overdrive.ui.pauseEnabled = false;
_overdrive.ui.pauseImg = "img/pause.png";
_overdrive.ui.pauseImgDisabled = "img/pause-disabled.png";
_overdrive.ui.resumeEnabled = false;
_overdrive.ui.resumeImg = "img/resume.png";
_overdrive.ui.resumeImgDisabled = "img/resume-disabled.png";
_overdrive.ui.deleteEnabled = false;
_overdrive.ui.deleteImg = "img/delete.png";
_overdrive.ui.deleteImgDisabled = "img/delete-disabled.png";
_overdrive.ui.altImg = "img/alt.png";
_overdrive.ui.altImgDisabled = "img/alt-disabled.png";

_overdrive.ui.displayState = [
	_overdrive.data.torrentStat.stopped,
	_overdrive.data.torrentStat.checkWait,
	_overdrive.data.torrentStat.check,
	_overdrive.data.torrentStat.downloadWait,
	_overdrive.data.torrentStat.download,
	_overdrive.data.torrentStat.seedWait,
	_overdrive.data.torrentStat.seed
];
_overdrive.ui.sortCol = "name";
_overdrive.ui.sortAsc = true;
_overdrive.ui.fileSortCol = "name";
_overdrive.ui.fileSortAsc = true;
_overdrive.ui.peerSortCol = "address";
_overdrive.ui.peerSortAsc = true;

/* UI Variables (these will be initialized later) */
_overdrive.ui.listScrollX = 0;
_overdrive.ui.listScrollY = 0;
_overdrive.ui.fileListScrollX = 0;
_overdrive.ui.fileListScrollY = 0;
_overdrive.ui.peerListScrollX = 0;
_overdrive.ui.peerListScrollY = 0;
_overdrive.ui.statusTablePos = 0;
_overdrive.ui.sideLastX = 0;
_overdrive.ui.sideLastY = 0;
_overdrive.ui.sideResize = false;
_overdrive.ui.vertResize = false;
_overdrive.ui.windowDrag = false;
_overdrive.ui.activeWindow = null;
_overdrive.ui.lastClickedTorrent = -1;
_overdrive.ui.lastWidth = 0;
_overdrive.ui.lastHeight = 0;
_overdrive.ui.detailsPadding = 0;
_overdrive.ui.detailsMargin = 0;
_overdrive.ui.listMargin = 0;
_overdrive.ui.listBorder = 0;
_overdrive.ui.canvasColor = "";
_overdrive.ui.fontColor = "";
_overdrive.ui.fontSize = "";
_overdrive.ui.fontFamily = "";
_overdrive.ui.tableCellPadding = 0;

// Formats data within the torrents object
_overdrive.data.formatData = function(detail)
{
	var torrents;
	if (detail)
		torrents = _overdrive.data.torrentsDetail;
	else
		torrents = _overdrive.data.torrents;
	
	for (var i = 0; i < torrents.length; i++) {
		// Initial data modification
		if (torrents[i].status == _overdrive.data.torrentStat.seed && torrents[i].rateUpload <= 0)
			torrents[i].status = _overdrive.data.torrentStat.seedWait;
		
		if (_overdrive.settings.columns.indexOf("eta") != -1) {
			if (torrents[i].eta < 0 && torrents[i].percentDone < 1)
				torrents[i].eta = Number.MAX_VALUE;
		}
		
		// Formatting
		for (var prop in torrents[i]) {
			if (prop == "percentDone")
				torrents[i].percentDoneHTML = (torrents[i].percentDone * 100).toFixed(2) + "%";
			else if (prop == "totalSize")
				torrents[i].totalSizeHTML = _overdrive.data.friendlyByteString(torrents[i].totalSize);
			else if (prop == "rateDownload")
				torrents[i].rateDownloadHTML = _overdrive.data.friendlyByteString(torrents[i].rateDownload) + "/s";
			else if (prop == "rateUpload")
				torrents[i].rateUploadHTML = _overdrive.data.friendlyByteString(torrents[i].rateUpload) + "/s";
			else if (prop == "status")
				torrents[i].statusHTML = _overdrive.data.torrentStatStrings[torrents[i].status];
			else if (prop == "eta")
				torrents[i].etaHTML = _overdrive.data.friendlyTimeString(torrents[i].eta);
			else if (prop == "uploadRatio")
				torrents[i].uploadRatioHTML = torrents[i].uploadRatio.toFixed(4);
			else
				torrents[i][prop + "HTML"] = torrents[i][prop];
		}
	}
};

// Convert number of bytes to a byte string
_overdrive.data.friendlyByteString = function(num)
{
	var units = "";
	var kbSize;
	if (_overdrive.settings.binaryKB)
		kbSize = 1024;
	else
		kbSize = 1000;
	
	if (num >= kbSize) {
		num /= kbSize;
		units = "K";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "M";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "G";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "T";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "P";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "E";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "Z";
	}
	if (num >= kbSize) {
		num /= kbSize;
		units = "Y";
	}
	
	if (_overdrive.settings.binaryKB && units != "")
		units += "i";
	
	units += "B";
	return num.toFixed(2) + " " + units;
};

// Convert number of seconds to a time string
_overdrive.data.friendlyTimeString = function(num)
{
	num = num.toFixed(0);
	if (num < 0) {
		return "N/A";
	} else if (num == Number.MAX_VALUE) {
		return "Unknown";
	} else {
		var hours = 0, mins = 0;
	
		while (num >= 3600) {
			num -= 3600;
			hours++;
		}
	
		while (num >= 60) {
			num -= 60;
			mins++;
		}
		
		if (hours < 10)
			hours = "0" + hours;
		if (mins < 10)
			mins = "0" + mins;
		if (num < 10)
			num = "0" + num;
		return hours + ":" + mins + ":" + num;
	}
};

// Convert a string in Base64 encoding to a bit string
_overdrive.data.base64ToBits = function(str)
{
	var base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var bitString = "";
	var pos = 0;
	
	while (pos < str.length) {
		var chunk = str.substr(pos, 4);
		var count;
		switch (chunk.lastIndexOf('=')) {
			case 3:
				count = 16;
				break;
			case 2:
				count = 8;
				break;
			default:
				count = 24;
		}
		
		for (var i = 0; i < 4; i++) {
			if (chunk.charAt(i) != '=') {
				var val = base64.indexOf(chunk.charAt(i));
				var div = 32;
				while (div >= 1) {
					if (val >= div) {
						bitString += "1";
						val -= div;
					} else {
						bitString += "0";
					}
					
					if (count-- == 1)
						break;
					
					div /= 2;
				}
			}
		}
		
		pos += 4;
	}
	
	return bitString;
};

// Get detailed torrent information from server about selected torrents
_overdrive.data.getDetailedInfo = function()
{
	if (_overdrive.data.selected.length > 0) {
		var request = {};
		request.method = "torrent-get";
		request.arguments = {};
		request.arguments.ids = _overdrive.data.selected;
		request.arguments.fields = [
			"activityDate",
			"addedDate",
			"bandwidthPriority",
			"comment",
			"corruptEver",
			"creator",
			"dateCreated",
			"desiredAvailable",
			"doneDate",
			"downloadDir",
			"downloadedEver",
			"downloadLimit",
			"downloadLimited",
			"error",
			"errorString",
			"eta",
			"etaIdle",
			"files",
			"fileStats",
			"hashString",
			"haveUnchecked",
			"haveValid",
			"honorSessionLimits",
			"id",
			"isFinished",
			"isPrivate",
			"isStalled",
			"leftUntilDone",
			"magnetLink",
			"manualAnnounceTime",
			"maxConnectedPeers",
			"metadataPercentComplete",
			"name",
			"peer-limit",
			"peers",
			"peersConnected",
			"peersFrom",
			"peersGettingFromUs",
			"peersSendingToUs",
			"percentDone",
			"pieces",
			"pieceCount",
			"pieceSize",
			"priorities",
			"queuePosition",
			"rateDownload",
			"rateUpload",
			"recheckProgress",
			"secondsDownloading",
			"secondsSeeding",
			"seedIdleLimit",
			"seedIdleMode",
			"seedRatioLimit",
			"seedRatioMode",
			"sizeWhenDone",
			"startDate",
			"status",
			"trackers",
			"trackerStats",
			"totalSize",
			"torrentFile",
			"uploadedEver",
			"uploadLimit",
			"uploadLimited",
			"uploadRatio",
			"wanted",
			"webseeds",
			"webseedsSendingToUs"
		];
		request.tag = _overdrive.data.lastSentDetail++;
	
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
		xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
		xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
		var postData = JSON.stringify(request);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.send(postData);
	
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 409) {
					_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
					_overdrive.data.getDetailedInfo();
				} else if (xmlhttp.status == 200) {
					var response = JSON.parse(xmlhttp.responseText);
					if (response.result != "success") {
						alert("getDetailedInfo() failed: " + response.result);
					} else {
						if (response.tag > _overdrive.data.lastReceivedDetail) {
							_overdrive.data.lastReceivedDetail = response.tag;
							_overdrive.data.torrentsDetail = response.arguments.torrents;
							_overdrive.data.formatData(true);
							_overdrive.ui.refreshDetails();
						}
					}
				}
			}
		};
	} else {
		_overdrive.data.torrentsDetail = [];
		_overdrive.ui.refreshDetails();
	}
};

// Get everything from server
_overdrive.data.getEverything = function()
{
	_overdrive.data.getTorrentInfo();
	_overdrive.data.getSessionInfo();
	_overdrive.data.getDetailedInfo();
};

// Get session information from server
_overdrive.data.getSessionInfo = function()
{
	var request = {};
	request.method = "session-get";
	request.tag = _overdrive.data.lastSentSession++;
	
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
	xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
	xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
	var postData = JSON.stringify(request);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	xmlhttp.send(postData);
	
	xmlhttp.onreadystatechange = function()
	{
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 409) {
				_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
				_overdrive.data.getSessionInfo();
			} else if (xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				if (response.result != "success") {
					alert("getSessionInfo() failed: " + response.result);
				} else {
					if (response.tag > _overdrive.data.lastReceivedSession) {
						_overdrive.data.lastReceivedSession = response.tag;
						_overdrive.data.session = response.arguments;
						_overdrive.ui.refreshSettings();
					}
				}
			}
		}
	};
};

// Return the torrent with the specified id
_overdrive.data.getTorrentById = function(id)
{
	for (var i = 0; i < _overdrive.data.torrents.length; i++) {
		if (_overdrive.data.torrents[i].id == id)
			return _overdrive.data.torrents[i];
	}
	
	return null;
};

// Get torrent information from server
_overdrive.data.getTorrentInfo = function()
{
	var request = {};
	request.method = "torrent-get";
	request.arguments = {};
	request.arguments.fields = _overdrive.settings.columns.concat();
	if (request.arguments.fields.indexOf("id") == -1)
		request.arguments.fields.push("id");
	if (request.arguments.fields.indexOf("status") == -1)
		request.arguments.fields.push("status");
	if (request.arguments.fields.indexOf("percentDone") == -1)
		request.arguments.fields.push("percentDone");
	request.tag = _overdrive.data.lastSent++;
	
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
	xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
	xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
	var postData = JSON.stringify(request);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	xmlhttp.send(postData);
	
	xmlhttp.onreadystatechange = function()
	{
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 409) {
				_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
				_overdrive.data.getTorrentInfo();
			} else if (xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				if (response.result != "success") {
					alert("getTorrentInfo() failed: " + response.result);
				} else {
					if (response.tag > _overdrive.data.lastReceived) {
						_overdrive.data.lastReceived = response.tag;
						_overdrive.data.validateSelection(response.arguments.torrents);
						_overdrive.data.torrents = response.arguments.torrents;
						_overdrive.data.formatData(false);
						_overdrive.data.sortData();
						_overdrive.ui.refreshControls();
						_overdrive.ui.refreshList();
					}
				}
			}
		}
	};
};

// Get the index in the torrent array of the torrent with specified ID
_overdrive.data.indexOfID = function(id)
{
	for (var i = 0; i < _overdrive.data.torrents.length; i++) {
		if (_overdrive.data.torrents[i].id == id)
			return i;
	}
	
	return -1;
};

// Sort data
_overdrive.data.sortData = function()
{
	if (_overdrive.ui.sortCol != "") {
		if (_overdrive.data.stringCols.indexOf(_overdrive.ui.sortCol) == -1) {
			if (_overdrive.ui.sortAsc) {
				_overdrive.data.torrents.sort(function(a, b)
				{
					return a[_overdrive.ui.sortCol] - b[_overdrive.ui.sortCol];
				});
			} else {
				_overdrive.data.torrents.sort(function(a, b)
				{
					return b[_overdrive.ui.sortCol] - a[_overdrive.ui.sortCol];
				});
			}
		} else {
			_overdrive.data.torrents.sort(function(a, b)
			{
				return a[_overdrive.ui.sortCol].toLowerCase().localeCompare(b[_overdrive.ui.sortCol].toLowerCase());
			});
			
			if (!_overdrive.ui.sortAsc)
				_overdrive.data.torrents.reverse();
		}
	}
};


// Validates the currently selected torrents against the
// given incoming torrents object
_overdrive.data.validateSelection = function(newTorrents)
{
	for (var i = 0; i < _overdrive.data.selected.length; i++) {
		var curTorrent = _overdrive.data.getTorrentById(_overdrive.data.selected[i]);
		var exists = false;
		var display = false;
		for (var j = 0; j < newTorrents.length; j++) {
			if (curTorrent.id == newTorrents[j].id && curTorrent.name == newTorrents[j].name) {
				exists = true;
				if (_overdrive.ui.displayState.indexOf(newTorrents[j].status) != -1)
					display = true;
				break;
			}
		}
		
		if (!exists || !display) {
			_overdrive.data.selected.splice(i, 1);
			i--;
		}
	}
};

// Attempt to load settings from localStorage
_overdrive.settings.loadSettings = function()
{
	if (localStorage.overdriveSideWidth)
		document.getElementById("overdrive-split-side").style.width = localStorage.overdriveSideWidth + "px";
	
	if (localStorage.overdriveSplitHeight && localStorage.overdriveListHeight) {
		document.getElementById("overdrive-split").style.height = localStorage.overdriveSplitHeight + "px";
		document.getElementById("overdrive-torrent-list").style.height = (localStorage.overdriveListHeight - _overdrive.ui.listBorder) + "px";
	}
	
	if (localStorage.overdriveBinaryKB)
		_overdrive.settings.binaryKB = localStorage.overdriveBinaryKB;
	
	/*if (localStorage.overdriveColumns)
		_overdrive.settings.columns = localStorage.overdriveColumns.split(",");*/
	
	if (localStorage.overdriveRefreshRate)
		_overdrive.settings.refreshRate = localStorage.overdriveRefreshRate;
	
	if (localStorage.overdriveSortCol)
		_overdrive.ui.sortCol = localStorage.overdriveSortCol;
	
	if (localStorage.overdriveSortAsc)
		_overdrive.ui.sortAsc = localStorage.overdriveSortAsc;
};

// Save settings to localStorage
_overdrive.settings.saveSettings = function()
{
	localStorage.overdriveSideWidth = document.getElementById("overdrive-split-side").clientWidth;
	localStorage.overdriveSplitHeight = document.getElementById("overdrive-split").clientHeight;
	localStorage.overdriveListHeight = document.getElementById("overdrive-torrent-list").offsetHeight;
	localStorage.overdriveBinaryKB = _overdrive.settings.binaryKB;
	localStorage.overdriveColumns = _overdrive.settings.columns;
	localStorage.overdriveRefreshRate = _overdrive.settings.refreshRate;
	localStorage.overdriveSortCol = _overdrive.ui.sortCol;
	localStorage.overdriveSortAsc = _overdrive.ui.sortAsc;
};

// Add button click handler
_overdrive.ui.addClick = function()
{
	var menu = document.getElementById("overdrive-add-window");
	menu.style.display = "block";
	document.getElementById("overdrive-add-url").focus();
	
	// Make sure window is in the screen
	if (menu.offsetLeft + menu.offsetWidth > window.innerWidth)
		menu.style.left = (window.innerWidth - menu.offsetWidth) + "px";
	if (menu.offsetTop + menu.offsetHeight > window.innerHeight)
		menu.style.top = (window.innerHeight - menu.offsetHeight) + "px";
};

// Click handler for cancel button in add menu
_overdrive.ui.addCancelClick = function()
{
	document.getElementById("overdrive-add-form").reset();
	document.getElementById("overdrive-add-window").style.display = "none";
};

// Click handler for upload button in add menu
_overdrive.ui.addUploadClick = function()
{
	var addForm = document.getElementById("overdrive-add-form");
	var fileSelect = document.getElementById("overdrive-add-file");
	var urlBox = document.getElementById("overdrive-add-url");
	var started = document.getElementById("overdrive-add-started");
	
	if (urlBox.value != "") {
		// Make nyaa.eu more convenient
		if (urlBox.value.indexOf("nyaa.eu" != -1)) {
			urlBox.value = urlBox.value.replace("page=view", "page=download");
			urlBox.value = urlBox.value.replace("page=torrentinfo", "page=download");
		}
		
		var request = {};
		request.method = "torrent-add";
		request.arguments = {};
		request.arguments.filename = urlBox.value;
		request.arguments.paused = !started.checked;
	
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
		xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
		xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
		var postData = JSON.stringify(request);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.send(postData);
	
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 409) {
					_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
					alert("Session timed out. Please try again.");
				} else if (xmlhttp.status == 200) {
					var response = JSON.parse(xmlhttp.responseText);
					if (response.result != "success")
						alert("addUploadClick() failed: " + response.result);
				}
			}
		};
		
		addForm.reset();
		document.getElementById("overdrive-add-window").style.display = "none";
	}
};

// Alt button click handler
_overdrive.ui.altClick = function()
{
	var request = {};
	request.method = "session-set";
	request.arguments = {};
	request.arguments["alt-speed-enabled"] = !_overdrive.data.session["alt-speed-enabled"];
	
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
	xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
	var postData = JSON.stringify(request);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	xmlhttp.send(postData);

	xmlhttp.onreadystatechange = function()
	{
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 409) {
				_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
				_overdrive.ui.altClick();
			} else if (xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				if (response.result != "success")
					alert("altClick() failed: " + response.result);
			}
		}
	};
};

// Delete button click handler
_overdrive.ui.deleteClick = function()
{
	if (_overdrive.ui.deleteEnabled) {
		var menu = document.getElementById("overdrive-delete-window");
		menu.style.display = "block";
		
		// Make sure window is in the screen
		if (menu.offsetLeft + menu.offsetWidth > window.innerWidth)
			menu.style.left = (window.innerWidth - menu.offsetWidth) + "px";
		if (menu.offsetTop + menu.offsetHeight > window.innerHeight)
			menu.style.top = (window.innerHeight - menu.offsetHeight) + "px";
	}
};

// Delete cancel click handler
_overdrive.ui.deleteCancelClick = function()
{
	document.getElementById("overdrive-delete-window").style.display = "none";
};

// Delete confirm click handler
_overdrive.ui.deleteConfirmClick = function()
{	
	var request = {};
	request.method = "torrent-remove";
	request.arguments = {};
	request.arguments.ids = _overdrive.data.selected;
	request.arguments["delete-local-data"] = document.getElementById("overdrive-delete-data").checked;
	
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
	xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
	var postData = JSON.stringify(request);
	xmlhttp.setRequestHeader("Content-type", "application/json");
	xmlhttp.send(postData);

	xmlhttp.onreadystatechange = function()
	{
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 409) {
				_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
				_overdrive.ui.deleteConfirmClick();
			} else if (xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				if (response.result != "success")
					alert("deleteConfirmClick() failed: " + response.result);
			}
		}
	};
	
	document.getElementById("overdrive-delete-window").style.display = "none";
};

// File header column click handler
_overdrive.ui.fileHeaderColClick = function(event)
{
	var search = "overdrive-file-column-";
	var colName = event.currentTarget.className.substr(event.currentTarget.className.indexOf(search) + search.length);
	if (colName == _overdrive.ui.fileSortCol) {
		_overdrive.ui.fileSortAsc = !_overdrive.ui.fileSortAsc;
	} else {
		_overdrive.ui.fileSortCol = colName;
		_overdrive.ui.fileSortAsc = true;
	}
	
	_overdrive.ui.refreshDetails();
};

// File list scroll handler
_overdrive.ui.fileListScroll = function()
{
	_overdrive.ui.fileListScrollY = document.getElementById("overdrive-file-list").scrollTop;
	_overdrive.ui.fileListScrollX = document.getElementById("overdrive-file-list").scrollLeft;
	
	document.getElementById("overdrive-file-list-header").style.top = _overdrive.ui.fileListScrollY + "px";
};

// Header column click handler
_overdrive.ui.headerColClick = function(event)
{
	var search = "overdrive-column-";
	var colName = event.currentTarget.className.substr(event.currentTarget.className.indexOf(search) + search.length);
	if (colName == _overdrive.ui.sortCol) {
		_overdrive.ui.sortAsc = !_overdrive.ui.sortAsc;
	} else {
		_overdrive.ui.sortCol = colName;
		_overdrive.ui.sortAsc = true;
	}
	
	_overdrive.data.sortData();
	_overdrive.ui.refreshList();
};

// Key handler
_overdrive.ui.keyHandler = function(event)
{
	// Ctrl+A - Select all torrents
	if (event.ctrlKey && event.which == 65) {
		_overdrive.data.selected = [];
		for (var i = 0; i < _overdrive.data.torrents.length; i++) {
			if (_overdrive.ui.displayState.indexOf(_overdrive.data.torrents[i].status) != -1)
				_overdrive.data.selected.push(_overdrive.data.torrents[i].id);
		}
		
		_overdrive.ui.refreshControls();
		_overdrive.ui.refreshList();
		_overdrive.data.getDetailedInfo();
		event.preventDefault();
	}
};

// List click handler
_overdrive.ui.listClick = function(event)
{
	if (event.target.id == "overdrive-torrent-list") {
		_overdrive.data.selected = [];
		_overdrive.ui.refreshControls();
		_overdrive.ui.refreshList();
		_overdrive.data.getDetailedInfo();
	}
};

// List scroll event handler
_overdrive.ui.listScroll = function(event)
{
	// Keep the header row on top
	_overdrive.ui.listScrollY = document.getElementById("overdrive-torrent-list").scrollTop;
	_overdrive.ui.listScrollX = document.getElementById("overdrive-torrent-list").scrollLeft;
	
	document.getElementById("overdrive-torrent-list-header").style.top = _overdrive.ui.listScrollY + "px";
};

// Mouse move event handler
_overdrive.ui.mouseMove = function(event)
{
	if (_overdrive.ui.sideResize) {
		var sidePane = document.getElementById("overdrive-split-side");
		sidePane.style.width = (sidePane.clientWidth + (event.clientX - _overdrive.ui.sideLastX)) + "px";
	}
	
	if (_overdrive.ui.vertResize) {
		var splitView = document.getElementById("overdrive-split");
		var torList = document.getElementById("overdrive-torrent-list");
		var details = document.getElementById("overdrive-tab-contents");
		splitView.style.height = (splitView.clientHeight + (event.clientY - _overdrive.ui.sideLastY)) + "px";
		torList.style.height = (splitView.clientHeight - (_overdrive.ui.listMargin + _overdrive.ui.listBorder)) + "px";
		var diff = window.innerHeight - document.getElementById("overdrive").clientHeight;
		details.style.height = ((details.clientHeight + diff) - (_overdrive.ui.detailsPadding + _overdrive.ui.detailsMargin)) + "px";
		_overdrive.ui.refreshDetails();
	}
	
	if (_overdrive.ui.windowDrag) {
		_overdrive.ui.activeWindow.style.left = (_overdrive.ui.activeWindow.offsetLeft + (event.clientX - _overdrive.ui.sideLastX)) + "px";
		_overdrive.ui.activeWindow.style.top = (_overdrive.ui.activeWindow.offsetTop + (event.clientY - _overdrive.ui.sideLastY)) + "px";
	}
	
	_overdrive.ui.sideLastX = event.clientX;
	_overdrive.ui.sideLastY = event.clientY;
};

// Pause click handler
_overdrive.ui.pauseClick = function()
{
	if (_overdrive.ui.pauseEnabled) {
		var request = {};
		request.method = "torrent-stop";
		request.arguments = {};
		request.arguments.ids = _overdrive.data.selected;
	
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
		xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
		xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
		var postData = JSON.stringify(request);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.send(postData);
	
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 409) {
					_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
					_overdrive.ui.pauseClick();
				} else if (xmlhttp.status == 200) {
					var response = JSON.parse(xmlhttp.responseText);
					if (response.result != "success")
						alert("pauseClick() failed: " + response.result);
				}
			}
		};
	}
};

// Peer header column click handler
_overdrive.ui.peerHeaderColClick = function(event)
{
	var search = "overdrive-peer-column-";
	var colName = event.currentTarget.className.substr(event.currentTarget.className.indexOf(search) + search.length);
	if (colName == _overdrive.ui.peerSortCol) {
		_overdrive.ui.peerSortAsc = !_overdrive.ui.peerSortAsc;
	} else {
		_overdrive.ui.peerSortCol = colName;
		_overdrive.ui.peerSortAsc = true;
	}
	
	_overdrive.ui.refreshDetails();
};

// Peer list scroll handler
_overdrive.ui.peerListScroll = function()
{
	_overdrive.ui.peerListScrollY = document.getElementById("overdrive-peer-list").scrollTop;
	_overdrive.ui.peerListScrollX = document.getElementById("overdrive-peer-list").scrollLeft;
	
	document.getElementById("overdrive-peer-list-header").style.top = _overdrive.ui.peerListScrollY + "px";
};

// Refresh the controls at the top
_overdrive.ui.refreshControls = function()
{
	var pauseButton = document.getElementById("overdrive-pause-button");
	var resumeButton = document.getElementById("overdrive-resume-button");
	var deleteButton = document.getElementById("overdrive-delete-button");
	_overdrive.ui.pauseEnabled = false;
	_overdrive.ui.resumeEnabled = false;
	
	for (var i = 0; i < _overdrive.data.selected.length; i++) {
		var curTorrent = _overdrive.data.getTorrentById(_overdrive.data.selected[i]);
		if (curTorrent.status == _overdrive.data.torrentStat.stopped)
			_overdrive.ui.resumeEnabled = true;
		else
			_overdrive.ui.pauseEnabled = true;
	}
	
	_overdrive.ui.deleteEnabled = (_overdrive.data.selected.length > 0);
	
	if (_overdrive.ui.pauseEnabled)
		pauseButton.src = _overdrive.ui.pauseImg;
	else
		pauseButton.src = _overdrive.ui.pauseImgDisabled;
	
	if (_overdrive.ui.resumeEnabled)
		resumeButton.src = _overdrive.ui.resumeImg;
	else
		resumeButton.src = _overdrive.ui.resumeImgDisabled;
	
	if (_overdrive.ui.deleteEnabled)
		deleteButton.src = _overdrive.ui.deleteImg;
	else
		deleteButton.src = _overdrive.ui.deleteImgDisabled;
};

// Refresh the torrent details section
_overdrive.ui.refreshDetails = function()
{
	if (_overdrive.data.selected.length == 0)
		_overdrive.data.torrentsDetail = [];
	
	var tab = document.getElementsByClassName("overdrive-tab-active")[0].id;
	tab = tab.slice(tab.indexOf('-') + 1, tab.lastIndexOf('-'));
	var tabContents = document.getElementById("overdrive-tab-contents");
	
	if (tab == "status") {
		// Create progress bar
		var canvas = document.getElementById("overdrive-progress-detail");
		canvas.height = canvas.clientHeight;
		canvas.width = canvas.clientWidth;
		
		// Calculate totals
		var totalValid = 0, totalUnchecked = 0, totalUp = 0, ratio = 0;
		var announce = 0, tracker = "", totalDownSpeed = 0, totalUpSpeed = 0;
		var eta = -Number.MAX_VALUE, pieces = "", connectedSeeds = 0, totalSeeds = 0;
		var connectedPeers = 0, totalPeers = 0, availability = 0;
		var activeTime = 0, seedTime = 0;
		for (var i = 0; i < _overdrive.data.torrentsDetail.length; i++) {
			totalValid += _overdrive.data.torrentsDetail[i].haveValid;
			totalUnchecked += _overdrive.data.torrentsDetail[i].haveUnchecked;
			totalUp += _overdrive.data.torrentsDetail[i].uploadedEver;
			totalDownSpeed += _overdrive.data.torrentsDetail[i].rateDownload;
			totalUpSpeed += _overdrive.data.torrentsDetail[i].rateUpload;
			activeTime += _overdrive.data.torrentsDetail[i].secondsDownloading;
			activeTime += _overdrive.data.torrentsDetail[i].secondsSeeding;
			seedTime += _overdrive.data.torrentsDetail[i].secondsSeeding;
			availability = (Number(availability) + _overdrive.data.torrentsDetail[i].percentDone).toFixed(4);
			
			for (var j = 0; j < _overdrive.data.torrentsDetail[i].peers.length; j++) {
				availability = (Number(availability) + _overdrive.data.torrentsDetail[i].peers[j].progress).toFixed(4);
				if (_overdrive.data.torrentsDetail[i].peers[j].progress == 1)
					connectedSeeds++;
				else
					connectedPeers++;
			}
			
			ratio = _overdrive.data.torrentsDetail[i].uploadRatio.toFixed(4);
			announce = Number.MAX_VALUE;
			for (var j = 0; j < _overdrive.data.torrentsDetail[i].trackerStats.length; j++) {
				if (_overdrive.data.torrentsDetail[i].trackerStats[j].nextAnnounceTime < announce)
					announce = _overdrive.data.friendlyTimeString(_overdrive.data.torrentsDetail[i].trackerStats[j].nextAnnounceTime - (new Date().getTime() / 1000));
				tracker += _overdrive.data.torrentsDetail[i].trackerStats[j].host;
				tracker += " - ";
				if (_overdrive.data.torrentsDetail[i].trackerStats[j].lastAnnounceResult == "Success")
					tracker += "<span class='overdrive-success-string'>";
				else
					tracker += "<span class='overdrive-fail-string'>";
				tracker += _overdrive.data.torrentsDetail[i].trackerStats[j].lastAnnounceResult;
				tracker += "</span><br />";
				
				if (_overdrive.data.torrentsDetail[i].trackerStats[j].seederCount > 0)
					totalSeeds += _overdrive.data.torrentsDetail[i].trackerStats[j].seederCount;
				if (_overdrive.data.torrentsDetail[i].trackerStats[j].leecherCount > 0)
					totalPeers += _overdrive.data.torrentsDetail[i].trackerStats[j].leecherCount;
			}
			
			if (_overdrive.data.torrentsDetail[i].eta > eta)
				eta = _overdrive.data.torrentsDetail[i].eta;
			pieces = _overdrive.data.torrentsDetail[i].pieceCount;
			pieces += " (";
			pieces += _overdrive.data.friendlyByteString(_overdrive.data.torrentsDetail[i].pieceSize);
			pieces += ")";
			
			if (i != 0) {
				ratio = "";
				announce = "";
				tracker = "";
				pieces = "";
				availability = "";
				ratio = (totalUp / totalValid).toFixed(4);
			}
		}
		
		// Define table information
		var tableInfo = [
			[
				[
					"Downloaded:",
					_overdrive.data.friendlyByteString(totalValid) + " (" +
						_overdrive.data.friendlyByteString(totalUnchecked) + ")"
				], [
					"Uploaded:",
					_overdrive.data.friendlyByteString(totalUp)
				], [
					"Share Ratio:",
					ratio
				], [
					"Next Announce:",
					announce
				], [
					"Tracker Status:",
					tracker
				]
			], [
				[
					"Down Speed:",
					_overdrive.data.friendlyByteString(totalDownSpeed) + "/s"
				], [
					"Up Speed:",
					_overdrive.data.friendlyByteString(totalUpSpeed) + "/s"
				], [
					"ETA:",
					_overdrive.data.friendlyTimeString(eta)
				], [
					"Pieces:",
					pieces
				]
			], [
				[
					"Seeders:",
					connectedSeeds + " (" + totalSeeds + ")"
				], [
					"Peers:",
					connectedPeers + " (" + totalPeers + ")"
				], [
					"Availability:",
					availability
				]
			], [
				[
					"Active Time:",
					_overdrive.data.friendlyTimeString(activeTime)
				], [
					"Seeding Time:",
					_overdrive.data.friendlyTimeString(seedTime)
				]
			]
		];
		
		// Create table
		var statusTable = document.getElementById("overdrive-status-table");
		statusTable.style.height = (Number(tabContents.style.height.slice(0, -2)) - canvas.height) + "px";
		statusTable.innerHTML = "";
		var statusTableBody = document.createElement("tbody");
		var statusTableBodyRow = document.createElement("tr");
		
		for (var i = 0; i < tableInfo.length; i++) {
			var statusTableBodyCol = document.createElement("td");
			statusTableBodyCol.style.width = (statusTable.clientWidth / tableInfo.length) + "px";
			var colTable = document.createElement("table");
			var colTableBody = document.createElement("tbody");
			
			for (var j = 0; j < tableInfo[i].length; j++) {
				var row = document.createElement("tr");
				var rowTitle = document.createElement("td");
				var rowBody = document.createElement("td");
				
				rowTitle.innerHTML = tableInfo[i][j][0];
				if (_overdrive.data.torrentsDetail.length == 0)
					rowBody.innerHTML = "";
				else
					rowBody.innerHTML = tableInfo[i][j][1];
				
				row.appendChild(rowTitle);
				row.appendChild(rowBody);
				colTableBody.appendChild(row);
			}
			
			colTable.appendChild(colTableBody);
			statusTableBodyCol.appendChild(colTable);
			statusTableBodyRow.appendChild(statusTableBodyCol);
		}
		
		statusTableBody.appendChild(statusTableBodyRow);
		statusTable.appendChild(statusTableBody);
		statusTable.scrollTop = _overdrive.ui.statusTablePos;
		
		// Draw to progress bar
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (_overdrive.data.torrentsDetail.length == 1) {
			ctx.fillStyle = _overdrive.ui.canvasColor;
			var bits = _overdrive.data.base64ToBits(_overdrive.data.torrentsDetail[0].pieces);
			var len = _overdrive.data.torrentsDetail[0].pieceCount;
			var i = 0, count = 0, cont = -1;
			while (i < len) {
				if (cont >= 0) {
					if (bits.charAt(i) == '1')
						count++;
					
					if (bits.charAt(i) == '0' || i == len - 1) {
						ctx.fillRect(cont / len * canvas.width, 0, count / len * canvas.width, canvas.height);
						cont = -1;
					}
				} else {
					if (bits.charAt(i) == '1') {
						cont = i;
						count = 1;
					}
				}
				
				i++;
			}
			
			var str = _overdrive.data.torrentsDetail[0].statusHTML + " " + _overdrive.data.torrentsDetail[0].percentDoneHTML;
			ctx.font = _overdrive.ui.fontSize + " " + _overdrive.ui.fontFamily;
			ctx.fillStyle = _overdrive.ui.fontColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(str, canvas.width / 2, canvas.height / 2);
		} else if (_overdrive.data.torrentsDetail.length > 1) {
			ctx.font = _overdrive.ui.fontSize + " " + _overdrive.ui.fontFamily;
			ctx.fillStyle = _overdrive.ui.fontColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Multiple selected", canvas.width / 2, canvas.height / 2);
		}
	} else if (tab == "files") {
		var files = [];
		for (var i = 0; i < _overdrive.data.torrentsDetail.length; i++) {
			for (var j = 0; j < _overdrive.data.torrentsDetail[i].files.length; j++) {
				var curFile = {};
				curFile.name = _overdrive.data.torrentsDetail[i].files[j].name;
				var slashInd = curFile.name.lastIndexOf("/");
				if (slashInd != -1) {
					curFile.nameHTML = "<span class='overdrive-folder-string'>" + curFile.name.substr(0, slashInd + 1) + "</span>";
					curFile.nameHTML += curFile.name.substr(slashInd + 1);
				} else {
					curFile.nameHTML = curFile.name;
				}
				curFile.totalSize = _overdrive.data.torrentsDetail[i].files[j].length;
				curFile.totalSizeHTML = _overdrive.data.friendlyByteString(curFile.totalSize);
				curFile.percentDone = _overdrive.data.torrentsDetail[i].files[j].bytesCompleted / _overdrive.data.torrentsDetail[i].files[j].length;
				curFile.percentDoneHTML = (curFile.percentDone * 100).toFixed(2) + "%";
				curFile.wanted = _overdrive.data.torrentsDetail[i].fileStats[j].wanted
				curFile.wantedHTML = "<input id='overdrive-file-wanted-" + _overdrive.data.torrentsDetail[i].id + "-" + j + "' ";
				curFile.wantedHTML += "class='overdrive-file-wanted' type='checkbox' ";
				if (curFile.wanted)
					curFile.wantedHTML += "checked ";
				curFile.wantedHTML += "/>";
				files[files.length] = curFile;
			}
		}
		
		var fileList = document.getElementById("overdrive-file-list");
		fileList.style.height = tabContents.style.height;
		var fileListHeader = document.getElementById("overdrive-file-list-header");
		fileListHeader.innerHTML = "";
		
		var columns = ["name", "totalSize", "wanted", "percentDone"];
		var stringCols = ["name"];
		var columnNames = {};
		columnNames.name = "Filename";
		columnNames.totalSize = "Size";
		columnNames.wanted = "Wanted";
		columnNames.percentDone = "Progress";
		
		// Sort files
		if (stringCols.indexOf(_overdrive.ui.fileSortCol) == -1) {
			if (_overdrive.ui.fileSortAsc) {
				files.sort(function(a, b)
				{
					return a[_overdrive.ui.fileSortCol] - b[_overdrive.ui.fileSortCol];
				});
			} else {
				files.sort(function(a, b)
				{
					return b[_overdrive.ui.fileSortCol] - a[_overdrive.ui.fileSortCol];
				});
			}
		} else {
			files.sort(function(a, b)
			{
				return a[_overdrive.ui.fileSortCol].toLowerCase().localeCompare(b[_overdrive.ui.fileSortCol].toLowerCase());
			});
			
			if (!_overdrive.ui.fileSortAsc)
				files.reverse();
		}
		
		for (var i = 0; i < columns.length; i++) {
			var column = document.createElement("div");
			column.className = "overdrive-header-column overdrive-file-column-" + columns[i];
			column.onmousedown = _overdrive.ui.fileHeaderColClick;
			column.innerHTML = columnNames[columns[i]];
			fileListHeader.appendChild(column);
		}
		
		var fileListBody = document.getElementById("overdrive-file-list-body");
		fileListBody.innerHTML = "";
		
		for (var i = 0; i < files.length; i++) {
			var curFile = document.createElement("div");
			curFile.className = "overdrive-file overdrive-table-entry";
			
			for (var j = 0; j < columns.length; j++) {
				var curCol = document.createElement("div");
				curCol.className = "overdrive-file-column-" + columns[j];
				curCol.innerHTML = files[i][columns[j] + "HTML"];
				curFile.appendChild(curCol);
			}
			
			fileListBody.appendChild(curFile);
			fileListBody.appendChild(document.createElement("br"));
		}
		
		// Attach event handlers to wanted checkboxes
		var wantedBoxes = document.getElementsByClassName("overdrive-file-wanted");
		for (var i = 0; i < wantedBoxes.length; i++)
			wantedBoxes[i].onchange = _overdrive.ui.wantedBoxClick;
		
		for (var i = 0; i < columns.length; i++) {
			var maxWidth = 0;
			var cells = document.getElementsByClassName("overdrive-file-column-" + columns[i]);
			for (var j = 0; j < cells.length; j++)
				maxWidth = Math.max(maxWidth, cells[j].scrollWidth - _overdrive.ui.tableCellPadding);
			for (var j = 0; j < cells.length; j++)
				cells[j].style.width = maxWidth + "px";
		}
		
		fileList.scrollTop = _overdrive.ui.fileListScrollY;
		fileList.scrollLeft = _overdrive.ui.fileListScrollX;
	} else if (tab == "peers") {
		var peers = [];
		for (var i = 0; i < _overdrive.data.torrentsDetail.length; i++) {
			for (var j = 0; j < _overdrive.data.torrentsDetail[i].peers.length; j++) {
				var curPeer = {};
				addressSeg = _overdrive.data.torrentsDetail[i].peers[j].address.split(".");
				curPeer.address = Number(addressSeg[3]);
				curPeer.address += Number(addressSeg[2]) << 8;
				curPeer.address += Number(addressSeg[1]) << 16;
				// Adding >>> 0 to the end makes the result get interpreted as unsigned
				// This is necessary when addressSeg[0] is 128 or higher (aka the upper half of IPv4 addresses)
				curPeer.address += Number(addressSeg[0]) << 24 >>> 0;
				curPeer.address += "." + _overdrive.data.torrentsDetail[i].peers[j].port;
				curPeer.address = Number(curPeer.address);
				curPeer.addressHTML = _overdrive.data.torrentsDetail[i].peers[j].address;
				curPeer.addressHTML += ":" + _overdrive.data.torrentsDetail[i].peers[j].port;
				curPeer.clientName = _overdrive.data.torrentsDetail[i].peers[j].clientName;
				curPeer.clientNameHTML = curPeer.clientName;
				curPeer.progress = _overdrive.data.torrentsDetail[i].peers[j].progress;
				curPeer.progressHTML = (curPeer.progress * 100).toFixed(2) + "%";
				curPeer.rateToClient = _overdrive.data.torrentsDetail[i].peers[j].rateToClient;
				curPeer.rateToClientHTML = _overdrive.data.friendlyByteString(curPeer.rateToClient) + "/s";
				curPeer.rateToPeer = _overdrive.data.torrentsDetail[i].peers[j].rateToPeer;
				curPeer.rateToPeerHTML = _overdrive.data.friendlyByteString(curPeer.rateToPeer) + "/s";
				peers[peers.length] = curPeer;
			}
		}
		
		var peerList = document.getElementById("overdrive-peer-list");
		peerList.style.height = tabContents.style.height;
		var peerListHeader = document.getElementById("overdrive-peer-list-header");
		peerListHeader.innerHTML = "";
		
		var columns = ["address", "clientName", "progress", "rateToClient", "rateToPeer"];
		var stringCols = ["clientName"];
		var columnNames = {};
		columnNames.address = "Address";
		columnNames.clientName = "Client";
		columnNames.progress = "Progress";
		columnNames.rateToClient = "Down Speed";
		columnNames.rateToPeer = "Up Speed";
		
		// Sort peers
		if (stringCols.indexOf(_overdrive.ui.peerSortCol) == -1) {
			if (_overdrive.ui.peerSortAsc) {
				peers.sort(function(a, b)
				{
					return a[_overdrive.ui.peerSortCol] - b[_overdrive.ui.peerSortCol];
				});
			} else {
				peers.sort(function(a, b)
				{
					return b[_overdrive.ui.peerSortCol] - a[_overdrive.ui.peerSortCol];
				});
			}
		} else {
			peers.sort(function(a, b)
			{
				return a[_overdrive.ui.peerSortCol].toLowerCase().localeCompare(b[_overdrive.ui.peerSortCol].toLowerCase());
			});
			
			if (!_overdrive.ui.peerSortAsc)
				peers.reverse();
		}
		
		for (var i = 0; i < columns.length; i++) {
			var column = document.createElement("div");
			column.className = "overdrive-header-column overdrive-peer-column-" + columns[i];
			column.onmousedown = _overdrive.ui.peerHeaderColClick;
			column.innerHTML = columnNames[columns[i]];
			peerListHeader.appendChild(column);
		}
		
		var peerListBody = document.getElementById("overdrive-peer-list-body");
		peerListBody.innerHTML = "";
		
		for (var i = 0; i < peers.length; i++) {
			var curPeer = document.createElement("div");
			curPeer.className = "overdrive-peer overdrive-table-entry";
			
			for (var j = 0; j < columns.length; j++) {
				var curCol = document.createElement("div");
				curCol.className = "overdrive-peer-column-" + columns[j];
				curCol.innerHTML = peers[i][columns[j] + "HTML"];
				curPeer.appendChild(curCol);
			}
			
			peerListBody.appendChild(curPeer);
			peerListBody.appendChild(document.createElement("br"));
		}
		
		for (var i = 0; i < columns.length; i++) {
			var maxWidth = 0;
			var cells = document.getElementsByClassName("overdrive-peer-column-" + columns[i]);
			for (var j = 0; j < cells.length; j++)
				maxWidth = Math.max(maxWidth, cells[j].scrollWidth - _overdrive.ui.tableCellPadding);
			for (var j = 0; j < cells.length; j++)
				cells[j].style.width = maxWidth + "px";
		}
		
		peerList.scrollTop = _overdrive.ui.peerListScrollY;
		peerList.scrollLeft = _overdrive.ui.peerListScrollX;
	}
};

// Refresh the torrent and state lists
_overdrive.ui.refreshList = function()
{
	var header = document.getElementById("overdrive-torrent-list-header");
	header.innerHTML = "";
	var list = document.getElementById("overdrive-torrent-list-body");
	list.innerHTML = "";
	var downloadCount = 0;
	var seedCount = 0;
	var activeCount = 0;
	var pauseCount = 0;
	
	// Generate list header
	for (var i = 0; i < _overdrive.settings.columns.length; i++) {
		var cell = document.createElement("div");
		cell.className = "overdrive-header-column overdrive-column-" + _overdrive.settings.columns[i];
		cell.innerHTML = _overdrive.data.columnNames[_overdrive.settings.columns[i]];
		cell.onmousedown = _overdrive.ui.headerColClick;
		header.appendChild(cell);
	}
	
	// Generate list body
	for (var i = 0; i < _overdrive.data.torrents.length; i++) {		
		if (_overdrive.ui.displayState.indexOf(_overdrive.data.torrents[i].status) != -1) {
			var row = document.createElement("div");
			row.id = "overdrive-torrent-" + _overdrive.data.torrents[i].id;
			row.className = "overdrive-torrent overdrive-table-entry";
			if (_overdrive.data.selected.indexOf(_overdrive.data.torrents[i].id) != -1)
				row.className += " overdrive-torrent-selected";
			
			for (var j = 0; j < _overdrive.settings.columns.length; j++) {
				var cell = document.createElement("div");
				cell.className = "overdrive-column-" + _overdrive.settings.columns[j];
				cell.innerHTML = _overdrive.data.torrents[i][_overdrive.settings.columns[j] + "HTML"];
				row.appendChild(cell);
			}
			
			row.onmousedown = _overdrive.ui.torrentClick;
			list.appendChild(row);
			list.appendChild(document.createElement("br"));
		}
		
		switch (_overdrive.data.torrents[i].status) {
			case _overdrive.data.torrentStat.stopped:
				pauseCount++;
				break;
			case _overdrive.data.torrentStat.downloadWait:
				downloadCount++;
				break;
			case _overdrive.data.torrentStat.download:
				activeCount++;
				downloadCount++;
				break;
			case _overdrive.data.torrentStat.seedWait:
				seedCount++;
				break;
			case _overdrive.data.torrentStat.seed:
				activeCount++;
				seedCount++;
				break;
		}
	}
	
	// Update state counters
	document.getElementById("overdrive-state-all").innerHTML = "All (" + _overdrive.data.torrents.length + ")";
	document.getElementById("overdrive-state-downloading").innerHTML = "Downloading (" + downloadCount + ")";
	document.getElementById("overdrive-state-seeding").innerHTML = "Seeding (" + seedCount + ")";
	document.getElementById("overdrive-state-active").innerHTML = "Active (" + activeCount + ")";
	document.getElementById("overdrive-state-paused").innerHTML = "Paused (" + pauseCount + ")";
	
	// Auto-resize list columns
	for (var i = 0; i < _overdrive.settings.columns.length; i++) {
		var maxWidth = 0;
		var cols = document.getElementsByClassName("overdrive-column-" + _overdrive.settings.columns[i]);
		for (var j = 0; j < cols.length; j++)
			maxWidth = Math.max(maxWidth, cols[j].scrollWidth - _overdrive.ui.tableCellPadding);
		for (var j = 0; j < cols.length; j++)
			cols[j].style.width = maxWidth + "px";
	}
	
	document.getElementById("overdrive-torrent-list").scrollTop = _overdrive.ui.listScrollY;
	document.getElementById("overdrive-torrent-list").scrollLeft = _overdrive.ui.listScrollX;
};

// Refresh settings windows
_overdrive.ui.refreshSettings = function()
{
	if (_overdrive.data.session["alt-speed-enabled"])
		document.getElementById("overdrive-alt-button").src = _overdrive.ui.altImg;
	else
		document.getElementById("overdrive-alt-button").src = _overdrive.ui.altImgDisabled;
};

// Resize handler
_overdrive.ui.resize = function()
{
	// Redraw the details pane
	_overdrive.ui.refreshDetails();
	
	// Make sure floating menus are still in the screen
	var menus = document.getElementsByClassName("overdrive-window");
	for (var i = 0; i < menus.length; i++) {
		if (menus[i].offsetLeft + menus[i].offsetWidth > window.innerWidth)
			menus[i].style.left = (window.innerWidth - menus[i].offsetWidth) + "px";
		if (menus[i].offsetTop + menus[i].offsetHeight > window.innerHeight)
			menus[i].style.top = (window.innerHeight - menus[i].offsetHeight) + "px";
	}
	
	// Resize the details pane with the window
	var splitView = document.getElementById("overdrive-split");
	var torList = document.getElementById("overdrive-torrent-list");
	var details = document.getElementById("overdrive-tab-contents");
	splitView.style.height = (splitView.clientHeight + (window.innerHeight - _overdrive.ui.lastHeight)) + "px";
	torList.style.height = (splitView.clientHeight - (_overdrive.ui.listMargin + _overdrive.ui.listBorder)) + "px";
	var diff = window.innerHeight - document.getElementById("overdrive").clientHeight;
	details.style.height = ((details.clientHeight + diff) - (_overdrive.ui.detailsPadding + _overdrive.ui.detailsMargin)) + "px";
	
	_overdrive.ui.lastHeight = window.innerHeight;
	_overdrive.ui.lastWidth = window.innerWidth;
};

// Resume click handler
_overdrive.ui.resumeClick = function()
{
	if (_overdrive.ui.resumeEnabled) {
		var request = {};
		request.method = "torrent-start";
		request.arguments = {};
		request.arguments.ids = _overdrive.data.selected;
	
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
		xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
		xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
		var postData = JSON.stringify(request);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.send(postData);
	
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 409) {
					_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
					_overdrive.ui.resumeClick();
				} else if (xmlhttp.status == 200) {
					var response = JSON.parse(xmlhttp.responseText);
					if (response.result != "success")
						alert("resumeClick() failed: " + response.result);
				}
			}
		};
	}
};

// State click handler
_overdrive.ui.stateClick = function(event)
{
	var state = event.currentTarget.id.substr("overdrive-state-".length);
	if (event.currentTarget.className.search("overdrive-state-active") != -1)
		return;
	
	if (state == "all") {
		_overdrive.ui.displayState = [
			_overdrive.data.torrentStat.stopped,
			_overdrive.data.torrentStat.checkWait,
			_overdrive.data.torrentStat.check,
			_overdrive.data.torrentStat.downloadWait,
			_overdrive.data.torrentStat.download,
			_overdrive.data.torrentStat.seedWait,
			_overdrive.data.torrentStat.seed
		];
	}
	else if (state == "downloading") {
		_overdrive.ui.displayState = [
			_overdrive.data.torrentStat.downloadWait,
			_overdrive.data.torrentStat.download
		];
	}
	else if (state == "seeding") {
		_overdrive.ui.displayState = [
			_overdrive.data.torrentStat.seedWait,
			_overdrive.data.torrentStat.seed
		];
	}
	else if (state == "active") {
		_overdrive.ui.displayState = [
			_overdrive.data.torrentStat.download,
			_overdrive.data.torrentStat.seed
		];
	}
	else if (state == "paused")
		_overdrive.ui.displayState = [_overdrive.data.torrentStat.stopped];
	
	var stateLabels = document.getElementsByClassName("overdrive-state");
	for (var i = 0; i < stateLabels.length; i++) {
		var className = "overdrive-state";
		if (stateLabels[i] == event.currentTarget)
			className += " overdrive-state-active";
		stateLabels[i].className = className;
	}
	
	_overdrive.data.selected = [];
	_overdrive.ui.refreshControls();
	_overdrive.ui.refreshList();
	_overdrive.data.getDetailedInfo();
};

// Status table scroll handler
_overdrive.ui.statusTableScroll = function()
{
	_overdrive.ui.statusTablePos = document.getElementById("overdrive-status-table").scrollTop;
};

// Tab click handler
_overdrive.ui.tabClick = function(event)
{
	var activeTab = document.getElementsByClassName("overdrive-tab-active")[0];
	if (event.currentTarget != activeTab) {
		activeTab.className = "overdrive-tab";
		event.currentTarget.className += " overdrive-tab-active";
		
		var tab = event.currentTarget.id;
		tab = tab.slice(tab.indexOf('-') + 1, tab.lastIndexOf('-'));
		var tabContents = document.getElementById("overdrive-tab-contents");
		tabContents.innerHTML = "";
		
		if (tab == "status") {
			var canvas = document.createElement("canvas");
			canvas.id = "overdrive-progress-detail";
			tabContents.appendChild(canvas);
			
			var statusTable = document.createElement("table");
			statusTable.id = "overdrive-status-table";
			statusTable.onscroll = _overdrive.ui.statusTableScroll;
			tabContents.appendChild(statusTable);
		} else if (tab == "files") {
			var fileList = document.createElement("div");
			fileList.id = "overdrive-file-list";
			fileList.className = "overdrive-table";
			fileList.onscroll = _overdrive.ui.fileListScroll;
			
			var fileListHeader = document.createElement("div");
			fileListHeader.id = "overdrive-file-list-header";
			fileListHeader.className = "overdrive-table-header";
			var loading = document.createElement("div");
			loading.innerHTML = "Loading...";
			fileListHeader.appendChild(loading);
			fileList.appendChild(fileListHeader);
			tabContents.appendChild(fileList);
			
			var fileListBody = document.createElement("div");
			fileListBody.id = "overdrive-file-list-body";
			fileListBody.className = "overdrive-table-body";
			fileListBody.style.paddingTop = fileListHeader.offsetHeight + "px";
			fileList.appendChild(fileListBody);
		} else if (tab == "peers") {
			var peerList = document.createElement("div");
			peerList.id = "overdrive-peer-list";
			peerList.className = "overdrive-table";
			peerList.onscroll = _overdrive.ui.peerListScroll;
			
			var peerListHeader = document.createElement("div");
			peerListHeader.id = "overdrive-peer-list-header";
			peerListHeader.className = "overdrive-table-header";
			var loading = document.createElement("div");
			loading.innerHTML = "Loading...";
			peerListHeader.appendChild(loading);
			peerList.appendChild(peerListHeader);
			tabContents.appendChild(peerList);
			
			var peerListBody = document.createElement("div");
			peerListBody.id = "overdrive-peer-list-body";
			peerListBody.className = "overdrive-table-body";
			peerListBody.style.paddingTop = peerListHeader.offsetHeight + "px";
			peerList.appendChild(peerListBody);
		} else {
			tabContents.innerHTML += tab;
		}
		
		_overdrive.ui.refreshDetails();
	}
};

// Torrent click handler (for selecting torrents)
_overdrive.ui.torrentClick = function(event)
{
	var num = Number(event.currentTarget.id.substr("overdrive-torrent-".length));
	
	if (!event.ctrlKey)
		_overdrive.data.selected = [];
	
	if (event.shiftKey) {
		if (_overdrive.ui.lastClickedTorrent == -1) {
			_overdrive.data.selected.push(num);
		} else {
			var numInd = _overdrive.data.indexOfID(num);
			var lastInd = _overdrive.data.indexOfID(_overdrive.ui.lastClickedTorrent);
			var start, end;
			if (numInd > lastInd) {
				start = lastInd;
				end = numInd;
			} else {
				start = numInd;
				end = lastInd;
			}
			
			for (var i = start; i <= end; i++) {
				if (_overdrive.ui.displayState.indexOf(_overdrive.data.torrents[i].status) != -1)
					_overdrive.data.selected.push(_overdrive.data.torrents[i].id);
			}
		}
	}
	else {
		if (event.ctrlKey) {
			var index = _overdrive.data.selected.indexOf(num);
			if (index == -1)
				_overdrive.data.selected.push(num);
			else
				_overdrive.data.selected.splice(index, 1);
		} else {
			_overdrive.data.selected.push(num);
		}
		
		_overdrive.ui.lastClickedTorrent = num;
	}
	
	_overdrive.ui.fileListScrollX = 0;
	_overdrive.ui.fileListScrollY = 0;
	_overdrive.ui.peerListScrollX = 0;
	_overdrive.ui.peerListScrollY = 0;
	_overdrive.ui.statusTablePos = 0;
	_overdrive.ui.refreshList();
	_overdrive.ui.refreshControls();
	_overdrive.data.getDetailedInfo();
	
	event.preventDefault();
};

// File wanted checkbox click handler
_overdrive.ui.wantedBoxClick = function(event)
{
	var boxID = event.currentTarget.id.split("-");
	var torrentID = Number(boxID[boxID.length - 2]);
	var fileID = Number(boxID[boxID.length - 1]);
	
	var request = {};
	request.method = "torrent-set";
	request.arguments = {};
	request.arguments.ids = [torrentID];
	if (event.currentTarget.checked)
		request.arguments["files-wanted"] = [fileID];
	else
		request.arguments["files-unwanted"] = [fileID];
	
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
	xmlhttp.open("POST", _overdrive.settings.rpcURL, true);
	xmlhttp.setRequestHeader("X-Transmission-Session-Id", _overdrive.settings.sessionID);
	var postData = JSON.stringify(request);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.send(postData);
	
	xmlhttp.onreadystatechange = function()
	{
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 409) {
				_overdrive.settings.sessionID = xmlhttp.getResponseHeader("X-Transmission-Session-Id");
				_overdrive.ui.wantedBoxClick(event);
			} else if (xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				if (response.result != "success")
					alert("wantedBoxClick() failed: " + response.result);
				else
					_overdrive.data.getEverything();
			}
		}
	};
};

// Window close button click handler
_overdrive.ui.windowCloseClick = function(event)
{
	event.currentTarget.parentNode.parentNode.style.display = "none";
};

// Titlebar mousedown handler
_overdrive.ui.windowTitleMouseDown = function(event)
{
	_overdrive.ui.activeWindow = event.currentTarget.parentNode;
	_overdrive.ui.windowDrag = true;
	event.preventDefault();
};

// Stuff to do when window is finished loading
_overdrive.onLoad = function()
{
	_overdrive.ui.lastHeight = window.innerHeight;
	_overdrive.ui.lastWidth = window.innerWidth;
	
	// Load some values from CSS sheet
	var cssSheet = null;
	for (var i = 0; i < document.styleSheets.length; i++) {
		if (document.styleSheets[i].href.indexOf("overdrive.css") != -1) {
			cssSheet = document.styleSheets[i];
			break;
		}
	}
	if (cssSheet != null) {
		for (var i = 0; i < cssSheet.cssRules.length; i++) {
			if (cssSheet.cssRules[i].selectorText == "#overdrive") {
				_overdrive.ui.fontColor = cssSheet.cssRules[i].style.color;
				_overdrive.ui.fontSize = cssSheet.cssRules[i].style.fontSize;
				_overdrive.ui.fontFamily = cssSheet.cssRules[i].style.fontFamily;
			} else if (cssSheet.cssRules[i].selectorText == "#overdrive-progress-detail") {
				_overdrive.ui.canvasColor = cssSheet.cssRules[i].style.color;
			} else if (cssSheet.cssRules[i].selectorText == "#overdrive-tab-contents") {
				var margin = cssSheet.cssRules[i].style.marginBottom.slice(0, cssSheet.cssRules[i].style.marginBottom.indexOf("px"));
				_overdrive.ui.detailsMargin = Number(margin);
				
				var padding = cssSheet.cssRules[i].style.padding.slice(0, cssSheet.cssRules[i].style.padding.indexOf("px"));
				_overdrive.ui.detailsPadding = Number(padding) * 2;
			} else if (cssSheet.cssRules[i].selectorText == "#overdrive-torrent-list") {
				var border = cssSheet.cssRules[i].style.border.slice(0, cssSheet.cssRules[i].style.border.indexOf("px"));
				_overdrive.ui.listBorder = Number(border) * 2;
				
				var margin = cssSheet.cssRules[i].style.margin.slice(0, cssSheet.cssRules[i].style.margin.indexOf("px"));
				_overdrive.ui.listMargin = Number(margin) * 2;
			} else if (cssSheet.cssRules[i].selectorText == ".overdrive-table-header div") {
				var padding = cssSheet.cssRules[i].style.paddingLeft.slice(0, cssSheet.cssRules[i].style.paddingLeft.indexOf("px"));
				_overdrive.ui.tableCellPadding = Number(padding) * 2;
			}
		}
	}
	
	// Attempt to load stored UI settings from localStorage
	_overdrive.settings.loadSettings();
	
	// Attach event handlers
	document.getElementById("overdrive-torrent-list").onmousedown = _overdrive.ui.listClick;
	document.getElementById("overdrive-torrent-list").onscroll = _overdrive.ui.listScroll;
	document.getElementById("overdrive-split-separator").onmousedown = function(event)
	{
		_overdrive.ui.sideResize = true;
		event.preventDefault();
	};
	document.getElementById("overdrive-vert-separator").onmousedown = function(event)
	{
		_overdrive.ui.vertResize = true;
		event.preventDefault();
	};
	document.getElementById("overdrive").onmouseup = function()
	{
		_overdrive.ui.sideResize = false;
		_overdrive.ui.vertResize = false;
		_overdrive.ui.windowDrag = false;
	};
	document.getElementById("overdrive").onmousemove = _overdrive.ui.mouseMove;
	document.getElementById("overdrive").onkeydown = _overdrive.ui.keyHandler;
	
	// Attach click handlers
	document.getElementById("overdrive-add-button").onclick = _overdrive.ui.addClick;
	document.getElementById("overdrive-add-cancel").onclick = _overdrive.ui.addCancelClick;
	document.getElementById("overdrive-add-upload").onclick = _overdrive.ui.addUploadClick;
	document.getElementById("overdrive-pause-button").onclick = _overdrive.ui.pauseClick;
	document.getElementById("overdrive-resume-button").onclick = _overdrive.ui.resumeClick;
	document.getElementById("overdrive-delete-button").onclick = _overdrive.ui.deleteClick;
	document.getElementById("overdrive-delete-cancel").onclick = _overdrive.ui.deleteCancelClick;
	document.getElementById("overdrive-delete-confirm").onclick = _overdrive.ui.deleteConfirmClick;
	document.getElementById("overdrive-alt-button").onclick = _overdrive.ui.altClick;
	
	var closeButtons = document.getElementsByClassName("overdrive-window-close");
	for (var i = 0; i < closeButtons.length; i++)
		closeButtons[i].onclick = _overdrive.ui.windowCloseClick;
	
	var titleBars = document.getElementsByClassName("overdrive-window-titlebar");
	for (var i = 0; i < titleBars.length; i++)
		titleBars[i].onmousedown = _overdrive.ui.windowTitleMouseDown;
	
	var stateLabels = document.getElementsByClassName("overdrive-state");
	for (var i = 0; i < stateLabels.length; i++)
		stateLabels[i].onmousedown = _overdrive.ui.stateClick;
	
	var tabs = document.getElementsByClassName("overdrive-tab");
	for (var i = 0; i < tabs.length; i++)
		tabs[i].onmousedown = _overdrive.ui.tabClick;
	
	document.getElementById("overdrive-status-table").onscroll = _overdrive.ui.statusTableScroll;
	
	// UI adjustments
	document.getElementById("overdrive-torrent-list-body").style.paddingTop = document.getElementById("overdrive-torrent-list-header").offsetHeight + "px";
	
	var floatMenus = document.getElementsByClassName("overdrive-window");
	for (var i = 0; i < floatMenus.length; i++) {
		floatMenus[i].style.left = ((window.innerWidth / 2) - (floatMenus[i].offsetWidth / 2)) + "px";
		floatMenus[i].style.top = ((window.innerHeight / 2) - (floatMenus[i].offsetHeight / 2)) + "px";
		floatMenus[i].style.display = "none";
		floatMenus[i].style.opacity = 1.0;
	}
	
	var details = document.getElementById("overdrive-tab-contents");
	var diff = window.innerHeight - document.getElementById("overdrive").clientHeight;
	details.style.height = ((details.clientHeight + diff) - (_overdrive.ui.detailsPadding + _overdrive.ui.detailsMargin)) + "px";
	
	// Start communicating with server
	window.setInterval(_overdrive.data.getEverything, _overdrive.settings.refreshRate);
};

// Attach onLoad handler
if (window.addEventListener) {
	window.addEventListener("load", _overdrive.onLoad, false);
	window.addEventListener("resize", _overdrive.ui.resize, false);
	window.addEventListener("unload", _overdrive.settings.saveSettings, false);
}
else if (window.attachEvent) {
	window.attachEvent("onload", _overdrive.onLoad);
	window.attachEvent("onresize", _overdrive.ui.resize);
	window.attachEvent("onunload", _overdrive.settings.saveSettings);
}
