Famous.loaded(function (require) {
    var Matrix = require("famous/Matrix"),
        Modifier = require("famous/Modifier"),
        RenderNode = require("famous/RenderNode"),
        Utility = require("famous/Utility");

    function LightBox(options) {
        this.options = {
            inTransform: Matrix.scale(.001, .001, .001),
            inOpacity: 0,
            inOrigin: [.5, .5],
            outTransform: Matrix.scale(.001, .001, .001),
            outOpacity: 0,
            outOrigin: [.5, .5],
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [.5, .5],
            inTransition: !0,
            outTransition: !0,
            overlap: !1
        };

        options && this.setOptions(options);

        this._showing = !1;
        this.nodes = [];
        this.transforms = [];
    }

    LightBox.prototype.getOptions = function () {
        return this.options
    };

    LightBox.prototype.setOptions = function (options) {
        void 0 !== options.inTransform && (this.options.inTransform = options.inTransform);

        void 0 !== options.inOpacity && (this.options.inOpacity = options.inOpacity);
        void 0 !== options.inOrigin && (this.options.inOrigin = options.inOrigin);
        void 0 !== options.outTransform && (this.options.outTransform = options.outTransform);
        void 0 !== options.outOpacity && (this.options.outOpacity = options.outOpacity);
        void 0 !== options.outOrigin && (this.options.outOrigin = options.outOrigin);
        void 0 !== options.showTransform && (this.options.showTransform = options.showTransform);
        void 0 !== options.showOpacity && (this.options.showOpacity = options.showOpacity);
        void 0 !== options.showOrigin && (this.options.showOrigin = options.showOrigin);
        void 0 !== options.inTransition && (this.options.inTransition = options.inTransition);
        void 0 !== options.outTransition && (this.options.outTransition = options.outTransition);
        void 0 !== options.overlap && (this.options.overlap = options.overlap);
    };

    LightBox.prototype.show = function (surface, i, onComplete) {
        if (!surface)
            return this.hide(onComplete);

        if (i instanceof Function && (onComplete = i, i = void 0), this._showing) {
            if (!this.options.overlap)
                return this.hide(this.show.bind(this, surface, onComplete)), void 0;
            this.hide()
        }

        this._showing = !0;
        var modifier = new Modifier({
            transform: this.options.inTransform,
            opacity: this.options.inOpacity,
            origin: this.options.inOrigin
        });

        var modifierNode = new RenderNode;
        modifierNode.link(modifier).link(surface);
        this.nodes.push(modifierNode);
        this.transforms.push(modifier);

        var after = onComplete ? Utility.after(3, onComplete) : void 0;
        i || (i = this.options.inTransition);
        modifier.setTransform(this.options.showTransform, i, after);
        modifier.setOpacity(this.options.showOpacity, i, after);
        modifier.setOrigin(this.options.showOrigin, i, after);
    };

    LightBox.prototype.hide = function (outTransform, onComplete) {
        if (this._showing) {
            this._showing = !1;
            outTransform instanceof Function && (onComplete = outTransform, outTransform = void 0);

            var node = this.nodes[this.nodes.length - 1];
            var transform = this.transforms[this.transforms.length - 1];
            var after = Utility.after(3, function () {
                this.nodes.splice(this.nodes.indexOf(node), 1);
                this.transforms.splice(this.transforms.indexOf(transform), 1);
                onComplete && onComplete.call(this);
            }.bind(this));

            outTransform || (outTransform = this.options.outTransition);
            transform.setTransform(this.options.outTransform, outTransform, after);
            transform.setOpacity(this.options.outOpacity, outTransform, after);
            transform.setOrigin(this.options.outOrigin, outTransform, after);
        }
    };

    LightBox.prototype.render = function () {
        for (var nodes = [], i = 0; i < this.nodes.length; i++)
            nodes.push(this.nodes[i].render());

        return nodes;
    };

    Famous.LightBox = LightBox;
});