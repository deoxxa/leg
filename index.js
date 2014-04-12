module.exports = function leg(stream, options) {
  stream = stream || process.stderr;
  options = options || {};

  if (options.object) {
    _log = function _log(level, summary, info) {
      stream.write(JSON.stringify({
        time: new Date(),
        level: level.toUpperCase(),
        summary: summary,
        info: info,
      }) + "\n");
    };
  } else {
    var _log = function _log(level, summary, info) {
      stream.write(JSON.stringify([
        new Date(),
        level.toUpperCase(),
        summary,
        info,
      ]) + "\n");
    };
  }

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

    var _summary = ctx.namespace.slice().reverse().map(function(e) {
      return "[" + e + "]";
    });

    var body = ctx.namespace.slice().reverse().reduce(function(i, v) {
      return "{\"" + v.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\":" + i + "}";
    }, "e");

    var _transform = new Function("e", "return " + body + ";");

    var log = function log(level, summary, info) {
      return _log(level, [summary].concat(_summary).join(" "), _transform(info));
    };

    log.__proto__ = _log;

    log.namespace = function namespace(newNamespace) {
      return createLog(ctx.namespace.slice().concat([newNamespace]), this);
    };

    return log;
  };

  return createLog();
};
