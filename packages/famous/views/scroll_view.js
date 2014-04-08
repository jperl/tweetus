Famous.loaded(function (require) {
    function Scrollview(options) {
        this.options = {
            direction: Utility.Direction.Y,
            rails: !0,
            defaultItemSize: [100, 100],
            itemSpacing: 0,
            clipSize: void 0,
            margin: void 0,
            friction: .001,
            drag: 1e-4,
            edgeGrip: .5,
            edgePeriod: 300,
            edgeDamp: 1,
            paginated: !1,
            pagePeriod: 500,
            pageDamp: .8,
            pageStopSpeed: 1 / 0,
            pageSwitchSpeed: 1,
            speedLimit: 10
        };

        this.node = null;
        this.physicsEngine = new PhysicsEngine;
        this.particle = new Particle;
        this.physicsEngine.addBody(this.particle);
        this.spring = new Spring({anchor: [0, 0, 0]});
        this.drag = new Drag({forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC});
        this.friction = new Drag({forceFunction: Drag.FORCE_FUNCTIONS.LINEAR});
        this.sync = new GenericSync(function () {
            return -this.getPosition()
        }.bind(this), {
            direction: this.options.direction == Utility.Direction.X ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y
        });
        this.eventInput = new EventHandler;
        this.eventOutput = new EventHandler;
        this.sync.pipe(this.eventInput);
        this.sync.pipe(this.eventOutput);
        EventHandler.setOutputHandler(this, this.eventOutput);
        this._outputFunction = void 0;
        this._masterOutputFunction = void 0;
        this.setOutputFunction();
        this.touchCount = 0;
        this._springAttached = !1;
        this._onEdge = 0;
        this._springPosition = 0;
        this._touchVelocity = void 0;
        this._earlyEnd = !1;
        this._masterOffset = 0;
        this._lastFrameNode = void 0;
        options ? this.setOptions(options) : this.setOptions({});
        a.call(this);
        this.group = new Group;
        this.group.link({render: S.bind(this)});
        this._entityId = Entity.register(this);
        this._contextSize = [window.innerWidth, window.innerHeight];
        this._offsets = {};
    }

    function o(t) {
        this.touchCount = t.count, void 0 === t.count && (this.touchCount = 1), u.call(this), this.setVelocity(0), this._touchVelocity = 0, this._earlyEnd = !1
    }

    function n(t) {
        var i = -t.p, e = -t.v;
        this._onEdge && t.slip && (0 > e && this._onEdge < 0 || e > 0 && this._onEdge > 0 ? this._earlyEnd || (r.call(this, t), this._earlyEnd = !0) : this._earlyEnd && Math.abs(e) > Math.abs(this.particle.getVel()[0]) && o.call(this, t)), this._earlyEnd || (this._touchVelocity = e, this.setPosition(i))
    }

    function r(t) {
        if (this.touchCount = t.count || 0, !this.touchCount) {
            u.call(this), this._onEdge && (this._springAttached = !0), h.call(this);
            var i = -t.v, e = this.options.speedLimit;
            t.slip && (e *= this.options.edgeGrip), -e > i ? i = -e : i > e && (i = e), this.setVelocity(i), this._touchVelocity = void 0
        }
    }

    function a() {
        this.eventInput.on("start", o.bind(this)), this.eventInput.on("update", n.bind(this)), this.eventInput.on("end", r.bind(this))
    }

    function h() {
        this._springAttached ? this.physicsEngine.attach([this.spring], this.particle) : this.physicsEngine.attach([this.drag, this.friction], this.particle)
    }

    function u() {
        this._springAttached = !1, this.physicsEngine.detachAll()
    }

    function c(t) {
        return t || (t = this.options.defaultItemSize), t[this.options.direction == Utility.Direction.X ? 0 : 1]
    }

    function p(t) {
        this._springPosition += t, this.setPosition(this.getPosition() + t), this.spring.setOpts({anchor: [this._springPosition, 0, 0]})
    }

    function l() {
        for (var t = !1; !t && this.getPosition() < 0;) {
            var i = this.node.getPrevious ? this.node.getPrevious() : void 0;
            if (i) {
                var e = i.getSize ? i.getSize() : this.options.defaultItemSize, s = c.call(this, e) + this.options.itemSpacing;
                p.call(this, s), this._masterOffset -= s, this.node = i
            } else
                t = !0
        }
        for (var o = this.node && this.node.getSize ? this.node.getSize() : this.options.defaultItemSize; !t && this.getPosition() >= c.call(this, o) + this.options.itemSpacing;) {
            var n = this.node.getNext ? this.node.getNext() : void 0;
            if (n) {
                var s = c.call(this, o) + this.options.itemSpacing;
                p.call(this, -s), this._masterOffset += s, this.node = n, o = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize
            } else
                t = !0
        }
        Math.abs(this._masterOffset) > g.call(this) + this.options.margin && (this._masterOffset = 0)
    }

    function f(t) {
        !this._onEdge && t ? (this.sync.setOptions({scale: this.options.edgeGrip}), this.touchCount || this._springAttached || (this._springAttached = !0, this.physicsEngine.attach([this.spring], this.particle))) : this._onEdge && !t && (this.sync.setOptions({scale: 1}), this._springAttached && (u.call(this), h.call(this))), this._onEdge = t
    }

    function d() {
        if (0 == this.touchCount && !this._springAttached && !this._onEdge && this.options.paginated && Math.abs(this.getVelocity()) < this.options.pageStopSpeed) {
            var t = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize, i = Math.abs(this.getVelocity()) > this.options.pageSwitchSpeed, e = this.getVelocity() > 0, s = this.getPosition() > .5 * c.call(this, t);
            i && e || !i && s ? this.goToNextPage() : m.call(this)
        }
    }

    function m() {
        v.call(this, 0, {period: this.options.pagePeriod, damp: this.options.pageDamp}), this._springAttached || (this._springAttached = !0, this.physicsEngine.attach([this.spring], this.particle))
    }

    function v(t, i) {
        i || (i = {period: this.options.edgePeriod, damp: this.options.edgeDamp}), this._springPosition = t, this.spring.setOpts({anchor: [this._springPosition, 0, 0], period: i.period, dampingRatio: i.damp})
    }

    function y(t, i, e) {
        var s = t.getSize ? t.getSize() : this.options.defaultItemSize;
        s || (s = this.options.defaultItemSize);
        var o = this._outputFunction(i);
        return e.push({transform: o, target: t.render()}), s[this.options.direction == Utility.Direction.X ? 0 : 1]
    }

    function g() {
        return this.options.clipSize ? this.options.clipSize : c.call(this, this._contextSize)
    }

    function S() {
        var t = {}, i = this.getPosition(), e = [], s = 0, o = 0, n = this.node;
        for (t[n] = 0; n && o - i < g.call(this) + this.options.margin;)
            o += y.call(this, n, o + this._masterOffset, e) + this.options.itemSpacing, n = n.getNext ? n.getNext() : void 0, t[n] = o, !n && o - i - this.options.itemSpacing <= g.call(this) && (this._onEdge || v.call(this, o - g.call(this) - this.options.itemSpacing), s = 1);
        if (n = this.node && this.node.getPrevious ? this.node.getPrevious() : void 0, o = 0, n) {
            var r = n.getSize ? n.getSize() : this.options.defaultItemSize;
            o -= c.call(this, r) + this.options.itemSpacing
        } else
            0 >= i && (this._onEdge || v.call(this, 0), s = -1);
        for (; n && o - i > -(g.call(this) + this.options.margin);)
            if (t[n] = o, y.call(this, n, o + this._masterOffset, e), n = n.getPrevious ? n.getPrevious() : void 0) {
                var r = n.getSize ? n.getSize() : this.options.defaultItemSize;
                o -= c.call(this, r) + this.options.itemSpacing
            }
        return this._offsets = t, f.call(this, s), d.call(this), this.options.paginated && this._lastFrameNode !== this.node && (this.eventOutput.emit("pageChange"), this._lastFrameNode = this.node), e
    }

    var Utility = require("famous/Utility"),
        PhysicsEngine = require("famous-physics/PhysicsEngine"),
        Particle = require("famous-physics/bodies/Particle"),
        Drag = require("famous-physics/forces/Drag"),
        Spring = require("famous-physics/forces/Spring"),
        Matrix = require("famous/Matrix"),
        EventHandler = require("famous/EventHandler"),
        GenericSync = require("famous-sync/GenericSync"),
        ViewSequence = require("famous/ViewSequence"),
        Group = require("famous/Group"),
        Entity = require("famous/Entity");

    Scrollview.prototype.emit = function (t, i) {
        "update" == t || "start" == t || "end" == t ? this.eventInput.emit(t, i) : this.sync.emit(t, i)
    };

    Scrollview.prototype.getPosition = function (t) {
        var i = this.particle.getPos()[0];
        if (t) {
            var e = this._offsets[t];
            return void 0 !== e ? i - e : void 0
        }
        return i
    };

    Scrollview.prototype.setPosition = function (t) {
        this.particle.setPos([t, 0, 0])
    };

    Scrollview.prototype.getVelocity = function () {
        return this.touchCount ? this._touchVelocity : this.particle.getVel()[0]
    };

    Scrollview.prototype.setVelocity = function (t) {
        this.particle.setVel([t, 0, 0])
    };

    Scrollview.prototype.getOptions = function () {
        return this.options
    };

    Scrollview.prototype.setOptions = function (t) {
        void 0 !== t.direction && (this.options.direction = t.direction, "x" === this.options.direction ? this.options.direction = Utility.Direction.X : "y" === this.options.direction && (this.options.direction = Utility.Direction.Y)), void 0 !== t.rails && (this.options.rails = t.rails), void 0 !== t.defaultItemSize && (this.options.defaultItemSize = t.defaultItemSize), void 0 !== t.itemSpacing && (this.options.itemSpacing = t.itemSpacing), void 0 !== t.clipSize && (t.clipSize !== this.options.clipSize && (this._onEdge = 0), this.options.clipSize = t.clipSize), void 0 !== t.margin && (this.options.margin = t.margin), void 0 !== t.drag && (this.options.drag = t.drag), void 0 !== t.friction && (this.options.friction = t.friction), void 0 !== t.edgeGrip && (this.options.edgeGrip = t.edgeGrip), void 0 !== t.edgePeriod && (this.options.edgePeriod = t.edgePeriod), void 0 !== t.edgeDamp && (this.options.edgeDamp = t.edgeDamp), void 0 !== t.paginated && (this.options.paginated = t.paginated), void 0 !== t.pageStopSpeed && (this.options.pageStopSpeed = t.pageStopSpeed), void 0 !== t.pageSwitchSpeed && (this.options.pageSwitchSpeed = t.pageSwitchSpeed), void 0 !== t.pagePeriod && (this.options.pagePeriod = t.pagePeriod), void 0 !== t.pageDamp && (this.options.pageDamp = t.pageDamp), void 0 !== t.speedLimit && (this.options.speedLimit = t.speedLimit), void 0 === this.options.margin && (this.options.margin = .5 * Math.max(window.innerWidth, window.innerHeight)), this.drag.setOpts({strength: this.options.drag}), this.friction.setOpts({strength: this.options.friction}), this.spring.setOpts({period: this.options.edgePeriod, dampingRatio: this.options.edgeDamp}), this.sync.setOptions({rails: this.options.rails, direction: this.options.direction == Utility.Direction.X ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y})
    };

    Scrollview.prototype.setOutputFunction = function (t, i) {
        t || (t = function (t) {
            return this.options.direction == Utility.Direction.X ? Matrix.translate(t, 0) : Matrix.translate(0, t)
        }.bind(this), i = t), this._outputFunction = t, this._masterOutputFunction = i ? i : function (i) {
            return Matrix.inverse(t(-i))
        }
    };

    Scrollview.prototype.goToPreviousPage = function () {
        if (this.node) {
            var t = this.node.getPrevious ? this.node.getPrevious() : void 0;
            if (t) {
                var i = c.call(this, this.node.getSize()) + this.options.itemSpacing;
                this.setPosition(this.getPosition() + i), this.node = t;
                for (var e in this._offsets)
                    this._offsets[e] += i;
                m.call(this)
            }
            return t
        }
    };

    Scrollview.prototype.goToNextPage = function () {
        if (this.node) {
            var t = this.node.getNext ? this.node.getNext() : void 0;
            if (t) {
                var i = c.call(this, this.node.getSize()) + this.options.itemSpacing;
                this.setPosition(this.getPosition() - i), this.node = t;
                for (var e in this._offsets)
                    this._offsets[e] -= i;
                m.call(this)
            }
            return t
        }
    };

    Scrollview.prototype.getCurrentNode = function () {
        return this.node
    };

    Scrollview.prototype.sequenceFrom = function (t) {
        t instanceof Array && (t = new ViewSequence(t)), this.node = t, this._lastFrameNode = t
    };

    Scrollview.prototype.getSize = function () {
        return this.options.direction == Utility.Direction.X ? [g.call(this), void 0] : [void 0, g.call(this)]
    };

    Scrollview.prototype.render = function () {
        return this.node ? (this.physicsEngine.step(), this._entityId) : void 0
    };

    Scrollview.prototype.commit = function (t, i, e, s, o) {
        this.options.clipSize || o[0] == this._contextSize[0] && o[1] == this._contextSize[1] || (this._onEdge = 0, this._contextSize = o), l.call(this);
        var n = this.getPosition(), r = this._masterOutputFunction(-(n + this._masterOffset));
        return {transform: Matrix.moveThen([-s[0] * o[0], -s[1] * o[1], 0], i), opacity: e, origin: s, size: o, target: {transform: r, origin: s, target: this.group.render()}}
    };

    Famous.Scrollview = Scrollview;
});