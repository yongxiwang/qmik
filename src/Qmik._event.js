/**
 * @author:leochen
 * @email:cwq0312@163.com
 * @version:0.91.008
 */
(function(Q) { /* event */
	var win = Q.global, doc = win.document;
	var readyRE = /complete|loaded/, // /complete|loaded|interactive/
	ek = "$QmikEvents", liveFuns = {};
	var isNull = Q.isNull, isFun = Q.isFun, isDom = Q.isDom, each = Q.each;
	function SE() {
		return !isNull(doc.addEventListener)
	}
	Q.ready = Q.fn.ready = function(fun) {
		// SE() ? Q(doc).bind('DOMContentLoaded', fun) : doc.onreadystatechange =
		// function(e) {
		// readyRE.test(doc.readyState) && fun(e)
		// }
		var node = this[0] || doc;
		function ready(e) {
			(readyRE.test(node.readyState) || node._loadState == "ok") && fun.call(node, e)
		}
		if (readyRE.test(node.readyState)) {
			ready(doc.createEvent("MouseEvents"))
		} else {
			Q(doc).on({
				"readystatechange" : ready,
				"load" : ready
			});
			isNull(node._loadState) && Q.delay(function() {
				node._loadState = "ok"
			}, 3000);
			node._loadState = "load"
		}
		return this
	}
	function Eadd(dom, name, fun, paramArray) {
		var t = Q(dom), d = t.data(ek) || {}, h = d[name];
		t.data(ek, d);
		if (!h) {
			d[name] = h = [];
			isFun(dom['on' + name]) ? (h[0] = dom['on' + name]) : SE() ? dom.addEventListener(name, handle, !1) : dom["on" + name] = handle
		}
		isFun(fun) && h.push({
			fun : fun,
			param : paramArray || []
		})
	}
	function Erm(dom, name, fun) {
		var s = Q(dom).data(ek) || {}, h = s[name] || [], i = h.length - 1;
		if (fun) {
			for (; i >= 0; i--)
				h[i].fun == fun && h.splice(i, 1)
		} else {
			SE() ? dom.removeEventListener(name, handle, !1) : delete dom["on" + name];
			delete s[name]
		}
	}
	function Etrig(dom, name) {
		var e;
		if (SE()) {
			switch (name) {
			case "hashchange":
				e = doc.createEvent("HashChangeEvent");
				break
			default:
				e = doc.createEvent("MouseEvents");
			}
			e.initEvent(name, !0, !0);
			dom.dispatchEvent(e)
		} else dom.fireEvent('on' + name)
	}
	function handle(e) {
		e = e || fixEvent(win.event);
		var m = SE() ? this : (e.target || e.srcElement), fun, param, events = Q(m).data(ek) || {};
		each(events[e.type], function(i, v) {
			fun = v.fun;
			param = v.param || [];
			isFun(fun) && fun.apply(m, [
				e
			].concat(param))
		})
	}
	function fixEvent(e) {
		e.preventDefault = function() {
			this.returnValue = !0
		};
		e.stopPropagation = function() {
			this.cancelBubble = !0
		};
		return e
	}
	function getLiveName(selector, type, callback) {
		return selector + ":live:" + type + ":" + (callback || "").toString()
	}
	Q.fn.extend({
		on : function(name, callback) {
			var p = Array.prototype.slice.call(arguments, 2);
			each(this, function(k, v) {
				Q.isPlainObject(name) ? each(name, function(k, j) {
					Eadd(v, k, j, callback)
				}) : Eadd(v, name, callback, p)
			});
			return this
		},
		un : function(name, callback) {
			each(this, function(k, v) {
				Erm(v, name, callback)
			});
			return this
		},
		once : function(name, callback) {// 只执行一次触发事件,执行后删除
			var me = this;
			function oneexec(e) {
				callback(e);
				me.un(name, oneexec)
			}
			me.on(name, oneexec)
		},
		trigger : function(name) {
			each(this, function(k, v) {
				Etrig(v, name)
			});
			return this
		},
		live : function(name, callback) {
			var select = this.selector, fun = liveFuns[getLiveName(this.selector, name, callback)] = function(e) {
				if (Q(e.target || e.srcElement).closest(select).length > 0) {
					callback.apply(event.target, [
						e
					]);
				}
			}
			Q("body").on(name, fun)
			return this
		},
		die : function(name, callback) {
			var fun = liveFuns[getLiveName(this.selector, name, callback)];
			each(Q(document.body), function(k, dom) {
				Erm(dom, name, fun)
			});
			return this
		}
	});
	Q.fn.extend({
		bind : Q.fn.on,
		unbind : Q.fn.un
	});
})(Qmik);
