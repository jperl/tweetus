Famous.loaded(function (require) {
    var Matrix = require("famous/Matrix"),
        Surface = require("famous/Surface"),
        LightBox = require("famous-views/LightBox");

    function TitleBar(options) {
        this.options = Object.create(TitleBar.DEFAULT_OPTIONS);
        this.lightbox = new LightBox;
        this._surfaces = {};

        if (options) this.setOptions(options);
    }

    TitleBar.DEFAULT_OPTIONS = {
        widget: Surface,
        inOrigin: [.5, 0],
        outOrigin: [.5, 0],
        showOrigin: [.5, 0],
        inTransition: !0,
        outTransition: !0,
        size: [undefined, 50],
        look: undefined
    };

    TitleBar.prototype.show = function (index) {
        var widget = this.options.widget;
        if (!(index in this._surfaces)) {
            var surface = new widget({
                size: this.options.size
            });
            surface.setOptions(this.options.look);
            surface.setContent(index);
            this._surfaces[index] = surface;
        }
        this.lightbox.show(this._surfaces[index]);
    };

    TitleBar.prototype.getSize = function () {
        return this.options.size
    };

    TitleBar.prototype.setOptions = function (options) {
        this.lightbox.setOptions(options);
        if (options.widget) {
            this.options.widget = options.widget;
            this._surfaces = {};
        }

        if (options.look) this.options.look = options.look;

        if (options.size) {
            this.options.size = options.size;
            var translate = Matrix.translate(0, -this.options.size[1]);
            this.lightbox.setOptions({
                inTransform: translate,
                outTransform: translate
            });
        }
    };

    TitleBar.prototype.render = function () {
        return this.lightbox.render();
    };

    Famous.TitleBar = TitleBar;
});