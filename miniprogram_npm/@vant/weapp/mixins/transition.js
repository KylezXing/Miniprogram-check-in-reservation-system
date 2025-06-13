"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transition = void 0;
// @ts-nocheck
var utils_1 = require("../common/utils");
var validator_1 = require("../common/validator");
var getClassNames = function (name) { return ({
    enter: "van-".concat(name, "-enter van-").concat(name, "-enter-active enter-class enter-active-class"),
    'enter-to': "van-".concat(name, "-enter-to van-").concat(name, "-enter-active enter-to-class enter-active-class"),
    leave: "van-".concat(name, "-leave van-").concat(name, "-leave-active leave-class leave-active-class"),
    'leave-to': "van-".concat(name, "-leave-to van-").concat(name, "-leave-active leave-to-class leave-active-class"),
}); };
function transition(showDefaultValue) {
    return Behavior({
        properties: {
            customStyle: String,
            // @ts-ignore
            show: {
                type: Boolean,
                value: showDefaultValue,
                observer: 'observeShow',
            },
            // @ts-ignore
            duration: {
                type: null,
                value: 300,
            },
            name: {
                type: String,
                value: 'fade',
            },
        },
        data: {
            type: '',
            inited: false,
            display: false,
        },
        ready: function () {
            if (this.data.show === true) {
                this.observeShow(true, false);
            }
        },
        methods: {
            observeShow: function (value, old) {
                if (value === old) {
                    return;
                }
                value ? this.enureEnter() : this.enureLeave();
            },
            enureEnter: function () {
                var _this = this;
                if (this.enterPromise)
                    return;
                this.enterPromise = new Promise(function (resolve) { return _this.enter(resolve); });
            },
            enureLeave: function () {
                var _this = this;
                var enterPromise = this.enterPromise;
                if (!enterPromise)
                    return;
                enterPromise
                    .then(function () { return new Promise(function (resolve) { return _this.leave(resolve); }); })
                    .then(function () {
                    _this.enterPromise = null;
                });
            },
            enter: function (resolve) {
                var _this = this;
                var _a = this.data, duration = _a.duration, name = _a.name;
                var classNames = getClassNames(name);
                var currentDuration = (0, validator_1.isObj)(duration) ? duration.enter : duration;
                if (this.status === 'enter') {
                    return;
                }
                this.status = 'enter';
                this.$emit('before-enter');
                (0, utils_1.requestAnimationFrame)(function () {
                    if (_this.status !== 'enter') {
                        return;
                    }
                    _this.$emit('enter');
                    _this.setData({
                        inited: true,
                        display: true,
                        classes: classNames.enter,
                        currentDuration: currentDuration,
                    });
                    (0, utils_1.requestAnimationFrame)(function () {
                        if (_this.status !== 'enter') {
                            return;
                        }
                        _this.transitionEnded = false;
                        _this.setData({ classes: classNames['enter-to'] });
                        resolve();
                    });
                });
            },
            leave: function (resolve) {
                var _this = this;
                if (!this.data.display) {
                    return;
                }
                var _a = this.data, duration = _a.duration, name = _a.name;
                var classNames = getClassNames(name);
                var currentDuration = (0, validator_1.isObj)(duration) ? duration.leave : duration;
                this.status = 'leave';
                this.$emit('before-leave');
                (0, utils_1.requestAnimationFrame)(function () {
                    if (_this.status !== 'leave') {
                        return;
                    }
                    _this.$emit('leave');
                    _this.setData({
                        classes: classNames.leave,
                        currentDuration: currentDuration,
                    });
                    (0, utils_1.requestAnimationFrame)(function () {
                        if (_this.status !== 'leave') {
                            return;
                        }
                        _this.transitionEnded = false;
                        setTimeout(function () {
                            _this.onTransitionEnd();
                            resolve();
                        }, currentDuration);
                        _this.setData({ classes: classNames['leave-to'] });
                    });
                });
            },
            onTransitionEnd: function () {
                if (this.transitionEnded) {
                    return;
                }
                this.transitionEnded = true;
                this.$emit("after-".concat(this.status));
                var _a = this.data, show = _a.show, display = _a.display;
                if (!show && display) {
                    this.setData({ display: false });
                }
            },
        },
    });
}
exports.transition = transition;
