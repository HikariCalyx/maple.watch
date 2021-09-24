/* Copyright 2015, All Rights Reserved. */
var checkTimeout = 1500,
    checkDelay = 100,
    showIPPort = true,
    showConnection = true,
    clickToRefresh = false,
    fixPing = true,
    selected = "Main",
    subSelection = "",
    processing = 0,
    hash = window.location.hash.split('-'),
    alreadyProcessed = [],
    rendered = 0,
    loadingTimers = [],
    loadingArr = [{
        loading: true,
        unknown: true
    }],
    clockTicking = false;

if (hash.length) {
    switch (hash[0]) {
        case "#CMS":
            selected = hash[0].replace('#', '');
            break;
        default:
            break;
    }
}

if (hash.length > 1) {
    subSelection = hash[1];
} else {
    subSelection = GetDefaultSubSelectionForVersion(selected);
}

function ping(ip, callback) {
    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        this.start = 0;
        var _that = this;
        this.img = new Image();
        this.img.onload = function(e) {
            window.clearInterval(_that.timer);
            _that.inUse = false;
            _that.callback('responded', +(new Date()) - _that.start);
            if (--processing == 0)
                if (window.stop) {
                    window.stop();
                } else if (document.execCommand) {
                document.execCommand('Stop');
            };
        };
        this.img.onerror = function(e, error, errorThrown) {
            if (_that.inUse) {
                window.clearInterval(_that.timer);
                _that.inUse = false;
                _that.callback('responded', +(new Date()) - _that.start, e);
                if (--processing == 0)
                    if (window.stop) {
                        window.stop();
                    } else if (document.execCommand) {
                    document.execCommand('Stop');
                };
                return true;
            }
        };
        this.start = +(new Date());
        this.img.src = "http://" + ip + "/?cachebreaker=" + (+(new Date()));
        this.timer = setTimeout(function() {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout', false);
                if (--processing == 0)
                    if (window.stop) {
                        window.stop();
                    } else if (document.execCommand) {
                    document.execCommand('Stop');
                };
            }
        }, GetCheckTimeout());
    }
}

var PingModel = function(servers) {
    var addr = servers[0].address;

    // Hacky, for some reason the foreach binding fires twice.
    if (!(servers[0].name == 'Self') && alreadyProcessed.indexOf(addr) == -1) {
        alreadyProcessed.push(servers[0].address);
        return;
    }

    var serversArr = [];

    var x = servers;

    for (var i = 0; i < servers.length; i++)
        for (var j = 0; j < servers[i].length; j++)
            serversArr.push(servers[i][j]);

    var self = this;
    var myServers = [];
    var offset = 1;
    ko.utils.arrayForEach(serversArr, function(server) {
        if (!server.isMapleStoryGameServer || server.rel == subSelection || (server.rel == "Login" && (selected != 'GMS' && selected != 'MSEA'))) {
            myServers.push({
                icon: server.icon,
                name: server.name,
                sub: server.sub || false,
                interval: server.interval || false,
                address: server.address,
                port: server.port,
                unknown: server.unknown || false,
                status: ko.observable('unchecked'),
                time: ko.observable(""),
                values: ko.observableArray(),
                rel: server.rel
            });
        }
    });

    self.servers = ko.observableArray(myServers);
    processing += self.servers().length;
    ko.utils.arrayForEach(self.servers(), function(s) {
        s.status('checking');

        function doPing() {
            new ping(s.address + ":" + s.port, function(status, time, e) {
                s.status(status);
                s.time(time);
                s.values.push(time);
                if (s.name == "Self") {
                    SetPingOffset(time);
                }
                console.clear();
                /*if (s.interval) {
                	setTimeout(doPing, s.interval);
                }*/
            });
        }
        setTimeout(function() {
            doPing();
        }, checkDelay * offset++)
    });
};

var GameServer = function(version, timeOffset, icons, servers) {
    return {
        name: "Game Servers",
        description: "以上是" + version + "的游戏服务器列表。",
        selectedServers: ko.observable(loadingArr),
        icons: icons,
        timeOffset: timeOffset,
        content: function() {
            return new PingModel(servers)
        }
    }
}

var servers = {
    CMS: {
        Login: [{
            icon: "serviceStatus-Mushroom_16.png",
            english: "Gateway of Wind",
            name: "风之大陆",
            address: "159.75.223.31",
            port: "8484",
            interval: 1500,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        },
        {
            icon: "serviceStatus-Mushroom_16.png",
            english: "Gateway of Light",
            name: "光之大陆",
            address: "109.244.2.229",
            port: "8484",
            interval: 1500,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        },
        {
            icon: "serviceStatus-Mushroom_16.png",
            english: "Gateway of Clouds",
            name: "云之大陆",
            address: "109.244.2.214",
            port: "8484",
            interval: 1500,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        },
        {
            icon: "serviceStatus-Mushroom_16.png",
            english: "Gateway of Darkness",
            name: "暗之大陆",
            address: "109.244.2.219",
            port: "8484",
            interval: 1500,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        },
        {
            icon: "serviceStatus-Mushroom_16.png",
            english: "Gateway of Water",
            name: "水之大陆",
            address: "159.75.223.108",
            port: "8484",
            interval: 1500,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        }],
            Lucid: [
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 1",
                    address: "159.75.223.83",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 2",
                    address: "159.75.223.84",
                    port: "8586",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 3 贵宾",
                    address: "159.75.223.85",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 4 贵宾",
                    address: "159.75.223.86",
                    port: "8586",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 5",
                    address: "159.75.223.87",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 6",
                    address: "159.75.223.88",
                    port: "8586",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 7",
                    address: "159.75.223.89",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 8",
                    address: "159.75.223.90",
                    port: "8586",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 9",
                    address: "159.75.223.91",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 10",
                    address: "159.75.223.92",
                    port: "8586",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 11",
                    address: "159.75.223.93",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 12",
                    address: "159.75.223.94",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 13",
                    address: "159.75.223.95",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 14",
                    address: "159.75.223.96",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 15",
                    address: "159.75.223.97",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 16",
                    address: "159.75.223.98",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 17",
                    address: "159.75.223.99",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 18",
                    address: "159.75.223.100",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 19",
                    address: "159.75.223.101",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "频道 20",
                    address: "159.75.223.102",
                    port: "8585",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "商城",
                    address: "159.75.223.37",
                    port: "8700",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                },
                {
                    icon: "serviceStatus-Lucid.png",
                    english: "路西德",
                    name: "拍卖场",
                    address: "159.75.223.23",
                    port: "8795",
                    interval: 1500,
                    values: [],
                    isMapleStoryGameServer: true,
                    rel: "Lucid"
                }
            ],
                Will: [
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 1",
                        address: "159.75.223.62",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 2",
                        address: "159.75.223.63",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 3 贵宾",
                        address: "159.75.223.64",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 4 贵宾",
                        address: "159.75.223.65",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 5",
                        address: "159.75.223.66",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 6",
                        address: "159.75.223.67",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 7",
                        address: "159.75.223.68",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 8",
                        address: "159.75.223.69",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 9",
                        address: "159.75.223.70",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 10",
                        address: "159.75.223.71",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 11",
                        address: "159.75.223.72",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 12",
                        address: "159.75.223.73",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 13",
                        address: "159.75.223.74",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 14",
                        address: "159.75.223.75",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 15",
                        address: "159.75.223.76",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 16",
                        address: "159.75.223.77",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 17",
                        address: "159.75.223.78",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 18",
                        address: "159.75.223.79",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 19",
                        address: "159.75.223.80",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "频道 20",
                        address: "159.75.223.81",
                        port: "8585",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "商城",
                        address: "159.75.223.38",
                        port: "8701",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        english: "威尔",
                        name: "拍卖场",
                        address: "159.75.223.23",
                        port: "8796",
                        interval: 1500,
                        values: [],
                        isMapleStoryGameServer: true,
                        rel: "Will"
                    }
                ],
                    Orchid: [
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 1",
                            address: "159.75.223.41",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 2",
                            address: "159.75.223.42",
                            port: "8586",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 3 贵宾",
                            address: "159.75.223.43",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 4 贵宾",
                            address: "159.75.223.44",
                            port: "8586",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 5",
                            address: "159.75.223.45",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 6",
                            address: "159.75.223.46",
                            port: "8586",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 7",
                            address: "159.75.223.47",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 8",
                            address: "159.75.223.48",
                            port: "8586",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 9",
                            address: "159.75.223.49",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 10",
                            address: "159.75.223.50",
                            port: "8586",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 11",
                            address: "159.75.223.51",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 12",
                            address: "159.75.223.52",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 13",
                            address: "159.75.223.53",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 14",
                            address: "159.75.223.54",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 15",
                            address: "159.75.223.55",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 16",
                            address: "159.75.223.56",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 17",
                            address: "159.75.223.57",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 18",
                            address: "159.75.223.58",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 19",
                            address: "159.75.223.59",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "频道 20",
                            address: "159.75.223.60",
                            port: "8585",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "商城",
                            address: "159.75.223.39",
                            port: "8702",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        },
                        {
                            icon: "serviceStatus-Orchid_CN.png",
                            english: "奥尔卡",
                            name: "拍卖场",
                            address: "159.75.223.23",
                            port: "8797",
                            interval: 1500,
                            values: [],
                            isMapleStoryGameServer: true,
                            rel: "Orchid"
                        }
                    ],
                        Damien: [
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 1",
                                address: "109.244.2.233",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 2",
                                address: "109.244.2.234",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 3 贵宾",
                                address: "109.244.2.235",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 4 贵宾",
                                address: "109.244.2.236",
                                port: "8586",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 5",
                                address: "109.244.2.237",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 6",
                                address: "109.244.2.238",
                                port: "8586",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 7",
                                address: "109.244.2.239",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 8",
                                address: "109.244.2.240",
                                port: "8586",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 9",
                                address: "109.244.2.241",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 10",
                                address: "109.244.2.242",
                                port: "8586",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 11",
                                address: "109.244.2.243",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 12",
                                address: "109.244.2.244",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 13",
                                address: "109.244.2.245",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 14",
                                address: "109.244.2.246",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 15",
                                address: "109.244.2.247",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 16",
                                address: "109.244.2.248",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 17",
                                address: "109.244.2.249",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 18",
                                address: "109.244.2.250",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 19",
                                address: "109.244.2.251",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "频道 20",
                                address: "109.244.2.252",
                                port: "8585",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "商城",
                                address: "109.244.2.232",
                                port: "8730",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            },
                            {
                                icon: "serviceStatus-Damien.png",
                                english: "戴米安",
                                name: "拍卖场",
                                address: "109.244.2.159",
                                port: "8795",
                                interval: 1500,
                                values: [],
                                isMapleStoryGameServer: true,
                                rel: "Damien"
                            }
                        ],
                            Hilla: [
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 1",
                                    address: "109.244.2.187",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 2",
                                    address: "109.244.2.193",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 3 贵宾",
                                    address: "109.244.2.188",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 4 贵宾",
                                    address: "109.244.2.188",
                                    port: "8586",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 5",
                                    address: "109.244.2.189",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 6",
                                    address: "109.244.2.194",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 7",
                                    address: "109.244.2.190",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 8",
                                    address: "109.244.2.190",
                                    port: "8586",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 9",
                                    address: "109.244.2.191",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 10",
                                    address: "109.244.2.191",
                                    port: "8586",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 11",
                                    address: "109.244.2.192",
                                    port: "8585",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "频道 12",
                                    address: "109.244.2.192",
                                    port: "8586",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "商城",
                                    address: "109.244.2.208",
                                    port: "8760",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                },
                                {
                                    icon: "serviceStatus-Hilla.png",
                                    name: "拍卖场",
                                    address: "109.244.2.206",
                                    port: "8795",
                                    interval: 1500,
                                    values: [],
                                    isMapleStoryGameServer: true,
                                    rel: "Hilla"
                                }
                            ],
                                VonLeon: [
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 1",
                                        address: "109.244.2.198",
                                        port: "8585",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 2",
                                        address: "109.244.2.198",
                                        port: "8586",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 3",
                                        address: "109.244.2.199",
                                        port: "8585",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 4",
                                        address: "109.244.2.199",
                                        port: "8586",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 5",
                                        address: "109.244.2.200",
                                        port: "8585",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 6",
                                        address: "109.244.2.200",
                                        port: "8586",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 7",
                                        address: "109.244.2.201",
                                        port: "8585",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 8",
                                        address: "109.244.2.201",
                                        port: "8586",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 9",
                                        address: "109.244.2.202",
                                        port: "8585",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "频道 10",
                                        address: "109.244.2.202",
                                        port: "8586",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "商城",
                                        address: "109.244.2.209",
                                        port: "8790",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    },
                                    {
                                        icon: "serviceStatus-VonLeon.png",
                                        english: "班·雷昂",
                                        name: "拍卖场",
                                        address: "109.244.2.207",
                                        port: "8795",
                                        interval: 1500,
                                        values: [],
                                        isMapleStoryGameServer: true,
                                        rel: "VonLeon"
                                    }
                                ],
                                    Magnus: [
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 1",
                                            address: "159.75.223.22",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 2",
                                            address: "159.75.223.115",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 3 贵宾",
                                            address: "159.75.223.116",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 4 贵宾",
                                            address: "159.75.223.117",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 5",
                                            address: "159.75.223.118",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 6",
                                            address: "159.75.223.119",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 7",
                                            address: "159.75.223.120",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 8",
                                            address: "159.75.223.121",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 9",
                                            address: "159.75.223.122",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 10",
                                            address: "159.75.223.123",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 11",
                                            address: "159.75.223.124",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "频道 12",
                                            address: "159.75.223.125",
                                            port: "8585",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "商城",
                                            address: "159.75.223.113",
                                            port: "7120",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        },
                                        {
                                            icon: "serviceStatus-Magnus.png",
                                            english: "麦格纳斯",
                                            name: "拍卖场",
                                            address: "159.75.223.103",
                                            port: "8795",
                                            interval: 1500,
                                            values: [],
                                            isMapleStoryGameServer: true,
                                            rel: "Magnus"
                                        }
                                    ],
    }
}

var checker = {
    isMainPage: ko.observable(selected == "Main"),
    selected: ko.observable(selected),
    subSelection: ko.observable(subSelection),
    getDefaultSubSelectionForVersion: GetDefaultSubSelectionForVersion,
    modifySettings: ModifySettings,
    defaultSettings: DefaultSettings,
    getServersCountForApplication: GetServersCountForApplication,
    versions: [
        {
            abbr: "CMS",
            name: "冒险岛 Online <small>(国服)</small>",
            available: true,
            complete: true,
            icon: "serviceStatus-Lucid.png",
            short: "国服",
            serverCount: [
                9
            ],
            applications: [
                GameServer("国服", 8, [{
                        icon: "serviceStatus-Mushroom_16.png",
                        name: "Login",
                        english: "登录服务器",
                        sub: ""
                    },
                    {
                        icon: "serviceStatus-Lucid.png",
                        name: "Lucid",
                        english: "路西德",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-Will.png",
                        name: "Will",
                        english: "威尔",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-Orchid_CN.png",
                        name: "Orchid",
                        english: "奥尔卡",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-Damien.png",
                        name: "Damien",
                        english: "戴米安",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-Hilla.png",
                        name: "Hilla",
                        english: "希拉",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-VonLeon.png",
                        name: "VonLeon",
                        english: "班·雷昂",
                        sub: "World"
                    },
                    {
                        icon: "serviceStatus-Magnus.png",
                        name: "Magnus",
                        english: "麦格纳斯",
                        sub: "World"
                    }
                ], [
                    servers.CMS.Login,
                    servers.CMS.Lucid,
                    servers.CMS.Will,
                    servers.CMS.Orchid,
                    servers.CMS.Damien,
                    servers.CMS.Hilla,
                    servers.CMS.VonLeon,
                    servers.CMS.Magnus
                ])
            ]
        }
    ],
    updateSelectedServers: UpdateSelectedServers,
    selectedIcon: ko.observable(GetEnglishIconNameForServer(this.subSelection)),
    settings: {
        pingOffset: ko.observable(0),
        delay: ko.observable(readCookie("Delay") ? readCookie("Delay") : 100),
        clickToRefresh: ko.observable(readCookie("ClickToRefresh") == "false" ? false : false),
        fixPing: ko.observable(readCookie("FixPing") == "false" ? false : true),
        showConnection: ko.observable(readCookie("ShowConnection") == "false" ? false : true),
        showIPPort: ko.observable(readCookie("ShowIPPort") == "false" ? false : false),
        timeout: ko.observable(readCookie("Timeout") ? readCookie("Timeout") : 5000),
        showControls: ko.observable(false)
    },
    currentTime: ko.observable('<span><i class="fa fa-cog fa-spin"></i> 正在检查服务器时间...</span>')
};

checker.subSelection.subscribe(function(newValue) {
    checker.selectedIcon(GetEnglishIconNameForServer(newValue));
});

if (selected != 'Main') {
    GetPingOffset();
}

ko.applyBindings(checker);

function GetEnglishIconNameForServer(serverName) {
    switch (serverName) {
        case "Login":
            return "Mushroom";
        case "Lucid":
            return "serviceStatus-Lucid";
        case "Will":
            return "serviceStatus-Will";
        case "Orchid":
            return "serviceStatus-Orchid_CN";
        case "Damien":
            return "serviceStatus-Damien";
        case "Hilla":
            return "serviceStatus-Hilla";
        case "VonLeon":
            return "serviceStatus-VonLeon";
        case "Magnus":
            return "serviceStatus-Magnus";
        case "TestWorld":
            return "serviceStatus-TestWorld";
        default:
            return serverName;
    }
}

function UpdateSelectedServers(parent, index, name) {
    var name = name || checker.subSelection();

    if (loadingTimers.length > index) {
        window.clearInterval(loadingTimers[index]);
    }

    if (parent.name == "Game Servers" && !clockTicking) {
        clockTicking = true;
        setInterval(function() {
            var d = new Date(),
                o = d.getTimezoneOffset() / 60;

            d.setHours(d.getHours() + o + parent.timeOffset);
            checker.currentTime('<span><i class="fa fa-clock-o"></i> 服务器时间：</span> ' + moment(d).format('HH:mm:ss'));
        }, 1000);
    }

    parent.selectedServers(loadingArr);
    window.location.hash = '#' + checker.selected() + '-' + name;
    subSelection = name;
    checker.subSelection(name);

    loadingTimers.push(setTimeout(function() {
        var content = parent.content();
        parent.selectedServers(parent.content().servers());
    }, 300));
}

function GetCheckTimeout() {
    return checker.settings.timeout();
}

function GetPingOffset() {
    return new PingModel([{
        icon: "serviceStatus-Mushroom_16.png",
        name: "Self",
        address: "127.0.0.1",
        port: "80",
        interval: 1500,
        values: [],
        unknown: true,
        rel: "Self"
    }]);
}

function GetDefaultSubSelectionForVersion(version) {
    switch (version) {
        case 'CMS':
            return 'Login';
        default:
            return;
    }
}

function SetPingOffset(offset) {
    checker.settings.pingOffset(offset);
}

function ModifySettings() {
    var delay = checker.settings.delay(),
        timeout = checker.settings.timeout();

    createCookie("Delay", delay > 10000 ? 10000 : (delay < 50 ? 50 : delay), 3650);
    createCookie("Timeout", timeout > 60000 ? 60000 : (timeout < 500 ? 500 : timeout), 3650);
    createCookie("ShowIPPort", checker.settings.showIPPort(), 3650);
    createCookie("ShowConnection", checker.settings.showConnection(), 3650);
    createCookie("ClickToRefresh", checker.settings.clickToRefresh(), 3650);
    createCookie("FixPing", checker.settings.fixPing(), 3650);

    window.location.reload();
}

function DefaultSettings() {
    checker.settings.delay(checkDelay);
    checker.settings.timeout(checkTimeout);
    checker.settings.showIPPort(showIPPort);
    checker.settings.showConnection(showConnection);
    checker.settings.clickToRefresh(clickToRefresh);
    checker.settings.fixPing(fixPing);
}

function GetServersCountForApplication(version, name) {
    var v = false;
    for (var i = 0; i < checker.versions.length; i++) {
        if (checker.versions[i].name == version) {
            v = checker.versions[i];
            break;
        }
    }

    if (v == false) {
        return 0;
    }

    for (var j = 0; j < v.applications.length; j++) {
        if (v.applications[j].name == name) {
            return v.serverCount[j];
        }
    }

    return 0;
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
