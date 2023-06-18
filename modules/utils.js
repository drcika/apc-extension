define(['exports'], function (exports) {
  exports.override = function (where, name, cb) {
    (function (original) {
      if (where?.prototype) {
        where.prototype[name] = function () {
          const t = this;
          const a = arguments;
          const res = cb.apply(this, [() => original?.apply(t, a), a]);
          return res;
        };
      }
    })(where?.prototype[name]);
  };

  exports.decorate =
    (this && this.__decorate) ||
    function (decorators, target, key, desc) {
      var c = arguments.length,
        r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
        d;
      if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') {
        r = Reflect.decorate(decorators, target, key, desc);
      } else {
        for (var i = decorators.length - 1; i >= 0; i--) {
          if ((d = decorators[i])) {
            r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
          }
        }
      }
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

  exports.param =
    (this && this.__param) ||
    function (paramIndex, decorator) {
      return function (target, key) {
        typeof decorator === 'function' && decorator(target, key, paramIndex);
      };
    };
});
