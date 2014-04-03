Famous.loaded(function (require) {
    var Entity = require("famous/Entity"),
        RenderNode = require("famous/RenderNode"),
        Matrix = require("famous/Matrix");

    function HeaderFooterLayout(options) {
        this.options = Object.create(HeaderFooterLayout.DEFAULT_OPTIONS);

        if (options) this.setOptions(options);

        this._entityId = Entity.register(this);
        this._header = new RenderNode;
        this._footer = new RenderNode;
        this._content = new RenderNode;
        this.id = {
            header: this._header,
            footer: this._footer,
            content: this._content
        };
    }

    HeaderFooterLayout.DIRECTION_X = 0;
    HeaderFooterLayout.DIRECTION_Y = 1;
    HeaderFooterLayout.DEFAULT_OPTIONS = {
        direction: HeaderFooterLayout.DIRECTION_Y,
        footerSize: 0,
        headerSize: 0
    };

    HeaderFooterLayout.prototype.render = function () {
        return this._entityId;
    };

    HeaderFooterLayout.prototype.setOptions = function (options) {
        for (var i in HeaderFooterLayout.DEFAULT_OPTIONS) {
            if (options[i] !== undefined) this.options[i] = options[i];
        }
    };

    HeaderFooterLayout.prototype.commit = function (context, transform, opacity, origin, size) {
        function getWidthOrHeight(headerOrFooter, defaultSize) {
            var node = headerOrFooter.get();
            if (!node || !node.getSize)
                return defaultSize;

            var size = node.getSize();
            return size[this.options.direction] || defaultSize;
        }

        function getTransform(size) {
            return this.options.direction == HeaderFooterLayout.DIRECTION_X ? Matrix.translate(size, 0, 0) : Matrix.translate(0, size, 0)
        }

        function getSize(relevantDimensionSize) {
            return this.options.direction == HeaderFooterLayout.DIRECTION_X ? [relevantDimensionSize, size[1]] : [size[0], relevantDimensionSize]
        }

        var headerWidthOrHeight = getWidthOrHeight.call(this, this._header, this.options.headerSize),
            footerWidthOrHeight = getWidthOrHeight.call(this, this._footer, this.options.footerSize),
            contentSize = size[this.options.direction] - headerWidthOrHeight - footerWidthOrHeight,
            headerOrigin = [.5, .5],
            footerOrigin = [.5, .5];

        headerOrigin[this.options.direction] = 0;
        footerOrigin[this.options.direction] = 1;

        var target = [
            {
                origin: headerOrigin,
                size: getSize.call(this, headerWidthOrHeight),
                target: this._header.render()
            },
            {
                transform: getTransform.call(this, headerWidthOrHeight),
                origin: headerOrigin,
                size: getSize.call(this, contentSize),
                target: this._content.render()
            },
            {
                origin: footerOrigin,
                size: getSize.call(this, footerWidthOrHeight),
                target: this._footer.render()
            }
        ];
        transform = Matrix.move(transform, [-size[0] * origin[0], -size[1] * origin[1], 0]);

        var commit = {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: target
        };
        return commit;
    };

    Famous.HeaderFooterLayout = HeaderFooterLayout;
});