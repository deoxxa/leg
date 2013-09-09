module.exports = function leg(stream) {
  stream = stream || process.stderr;

  var createLog = function createLog(currentNamespace) {
    currentNamespace = currentNamespace || [];

    var log = function log(level, summary, info) {
      info = currentNamespace.slice().reverse().reduce(function(i, v) {
        var o = {};

        o[v] = i || null;

        return o;
      }, info);

      summary = [summary].concat(currentNamespace.slice().reverse().map(function(e) {
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
      log[level] = log.bind(null, level);
    });

    log.namespace = function namespace(extraNamespace) {
      return createLog(currentNamespace.slice().concat([extraNamespace]));
    };

    return log;
  };

  return createLog();
};
