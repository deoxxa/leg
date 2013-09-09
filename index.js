module.exports = function leg(stream) {
  stream = stream || process.stderr;

  var _log = function _log(level, summary, info) {
    info = this.namespace.slice().reverse().reduce(function(i, v) {
      var o = {};

      o[v] = i || null;

      return o;
    }, info);

    summary = [summary].concat(this.namespace.slice().reverse().map(function(e) {
      return "[" + e + "]";
    })).join(" ");

    stream.write(JSON.stringify([
      (new Date()).toISOString(),
      level.toUpperCase(),
      summary,
      info,
    ]) + "\n");
  };

  ["debug", "info", "warn", "error"].forEach(function(level) {
    _log[level] = function() {
      return this.apply(this, [level].concat([].slice.call(arguments)));
    };
  });

  var createLog = function createLog(namespace, parent) {
    var ctx = Object.create(parent || null, {
      namespace: {
        value: namespace || [],
      },
    });

    var log = function log() {
      return _log.apply(ctx, arguments);
    };

    log.__proto__ = _log;

    log.namespace = function namespace(newNamespace) {
      return createLog(ctx.namespace.slice().concat([newNamespace]), this);
    };

    return log;
  };

  return createLog();
};
