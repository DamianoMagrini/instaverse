__d(
  function(g, r, i, a, m, e, d) {
    'use strict';
    function t(t) {
      return function() {
        return t;
      };
    }
    var n = function() {};
    (n.thatReturns = t),
      (n.thatReturnsFalse = t(!1)),
      (n.thatReturnsTrue = t(!0)),
      (n.thatReturnsNull = t(null)),
      (n.thatReturnsThis = function() {
        return this;
      }),
      (n.thatReturnsArgument = function(t) {
        return t;
      }),
      (m.exports = n);
  },
  68,
  []
);
