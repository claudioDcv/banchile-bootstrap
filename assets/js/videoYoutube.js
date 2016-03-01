var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playerInfoList = [{
    id: 'player1',
    height: '100%',
    width: '100%',
    videoId: 'kGdsHo13LEo'
}, {
    id: 'player2',
    height: '100%',
    width: '100%',
    videoId: 'P5_GlAOCHyE'
}, {
    id: 'player3',
    height: '100%',
    width: '100%',
    videoId: 'sKafQbM0J_8'
}];

function onYouTubeIframeAPIReady() {
    if (typeof playerInfoList === 'undefined') return;

    for (var i = 0; i < playerInfoList.length; i++) {
        var curplayer = createPlayer(playerInfoList[i]);
        players[i] = curplayer;
    }
}

var players = new Array();

function createPlayer(playerInfo) {
    return new YT.Player(playerInfo.id, {
        height: playerInfo.height,
        width: playerInfo.width,
        videoId: playerInfo.videoId,
    });
}

var displayDate = function() {
    for (var i = 0; i < playerInfoList.length; i++) {
        players[i].stopVideo();
    }
};

var classname = document.getElementsByClassName("bullet-video");

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('click', displayDate, false);
}
