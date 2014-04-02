Famous.loaded(function (require) {
    var Surface = require('famous/Surface');
    var View = require('famous/View');

    var TimeAgo = require('famous-utils/TimeAgo');

    function FeedItem(options) {
        View.apply(this, arguments);

        this.surface = new Surface({size: this.options.size, classes: this.options.classes});

        this.surface.pipe(this.eventInput);

        this.optionsManager.on('change', function (option) {
            if ('content' == option.id) {
                this.setContent(option.value);
            } else {
                var opt = {};
                opt[option.id] = option.value;
                this.surface.setOptions(opt);
            }
        }.bind(this));

        if (options) this.setOptions(options);

        this.node.link(this.surface);
    }

    FeedItem.prototype = Object.create(View.prototype);

    FeedItem.prototype.constructor = FeedItem;

    FeedItem.DEFAULT_OPTIONS = {
        classes: ['feedItem'],
        size: [void 0, 80],
        content: {icon: void 0, source: void 0, time: void 0, text: ''}
    };

    FeedItem.prototype.setContent = function (item) {
        this.options.content = item;
        var i = .6 * this.options.size[1];
        var icon = item.icon ? '<img src="' + item.icon + '" class="icon" width="' + i + '" height="' + i + '" />' : "";
        var when = '<p class="time">' + TimeAgo.parse(item.time) + "</p>";
        var source = '<p class="source">' + item.source + "</p>";
        var text = '<p class="text">' + item.text + "</p>";
        this.surface.setContent(icon + when + source + text);
    };

    Famous.FeedItem = FeedItem;
});