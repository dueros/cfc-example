const Bot = require('bot-sdk');
const UUID = require('node-uuid');
const TextCard = Bot.Card.TextCard;
const VideoPlay = Bot.Directive.VideoPlayer.Play;
const VideoStop = Bot.Directive.VideoPlayer.Stop;
const AudioPlay = Bot.Directive.AudioPlayer.Play;
const AudioStop = Bot.Directive.AudioPlayer.Stop;
const Config = {
    'video_url': 'http://baobaozhidao.bj.bcebos.com/dbp_video%2Fwork%20and%20cat.mp4',
    'audio_url': 'http://baobaozhidao.cdn.bcebos.com/dbp_video/闲暇时光.mp3',
    'bot_name': '闲暇时光'
};

class VideoBot extends Bot {
    constructor(postData) {
        super(postData);

        this.botName = Config['bot_name'];

        let ability = this.request.getData()['context']['System']['device']['supportedInterfaces'];
        if (ability && ability.Display) {
            this.client = 'video';
        } else {
            this.client = 'audio';
        }

        this.addLaunchHandler(this.launch);
        this.addDefaultEventListener(this.defaultEvent);
        this.addIntentHandler('ai.dueros.common.default_intent', this.defaultIntent);
        this.addSessionEndedHandler(() => {
            return null;
        });
    }

    launch() {
        if (this.client === 'video') {
            return this.launchVideo();
        } else {
            return this.launchAudio();
        }
    }

    launchVideo() {
        this.waitAnswer();
        this.setExpectSpeech(false);

        let botId = this.request.getBotId();
        let url = Config['video_url'];
        let speech = `欢迎来到${Config['bot_name']}`;

        let directive = this.getVideoPlay({
            botId: botId,
            url: url,
            offset: 0,
            playBehavior: "REPLACE_ALL",
            isSameHash: 1
        });
        return {
            card: new TextCard(),
            outputSpeech: speech,
            directives: [directive],
        };
    }

    launchAudio() {
        this.waitAnswer();
        this.setExpectSpeech(false);

        let botId = this.request.getBotId();
        let url = Config['audio_url'];
        let speech = `欢迎来到${Config['bot_name']}`;

        let directive = this.getAudioPlay({
            botId: botId,
            url: url,
            offset: 0,
            playBehavior: "REPLACE_ALL",
            isSameHash: 1
        });
        return {
            outputSpeech: speech,
            directives: [directive],
        };
    }

    getVideoPlay(playInfo) {
        let {botId, url, offset, playBehavior, isSameHash} = playInfo;
        this.setExpectSpeech(false);
        let hash = UUID.v1();
        if (isSameHash) {
            hash = this.getSessionAttribute('video_hash');
        }
        this.setSessionAttribute('video_hash', hash);
        let token = {
            bot_id: botId,
            url: url,
            hash: hash
        };
        let directive = new VideoPlay(url, playBehavior);
        directive.setToken(this.genToken(token));
        directive.setOffsetInMilliseconds(offset);
        directive.setReportIntervalInMs(10000);
        directive.setReportDelayInMs(10000);
        return directive;
    }

    getAudioPlay(playInfo) {
        let {botId, url, offset, playBehavior, isSameHash} = playInfo;
        this.setExpectSpeech(false);
        let hash = UUID.v1();
        if (isSameHash) {
            hash = this.getSessionAttribute('video_hash');
        }
        this.setSessionAttribute('video_hash', hash);

        let token = {
            botId: botId,
            url: url,
            hash: hash
        };
        let directive = new AudioPlay(url, playBehavior);
        directive.setToken(this.genToken(token));
        directive.setOffsetInMilliseconds(offset);
        return directive;
    }

    genToken(obj) {
        let json = JSON.stringify(obj);
        let b = new Buffer(json);
        return b.toString('base64');
    }

    defaultEvent(event) {
        this.waitAnswer();
        this.setExpectSpeech(false);
    }

    defaultIntent() {
        this.waitAnswer();
        this.setExpectSpeech(false);
        return {
            'outputSpeech': `${this.botName}不理解您的问题，您可以问我其他问题，如果不想看了可以说退出`
        };
    }
}

exports.handler = function(event, context, callback) {
    try {
        let b = new VideoBot(event);
        // 0: debug  1: online
        // b.botMonitor.setEnvironmentInfo(privateKey, 0);
        b.run().then(function(result) {
            callback(null, result);
        }).catch(callback);
    } catch (e) {
        callback(e);
    }
};
