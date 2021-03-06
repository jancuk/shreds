(function (Shreds) { 'use strict';
  var index_prefix = '$idx:-';
  var Models = {};
  var Context = {};

  Shreds.registerComponent('model', {
    init: function () { },

    import: function (modelName, data, options) {
      cleanUpContext(modelName, options);
      if (data instanceof Array) {
        var indexed = index_prefix + modelName;
        Models[indexed] || (Models[indexed] = {});
        Models[indexed] = data.reduce(function (prev, curr, idx, arr) {
          prev[curr.id] = curr;
          return prev;
        }, Models[indexed]);
        data.forEach(function (val, idx, arr) {
          for (var child in val.has) {
            this.import.call(this, modelName + '/' + val.has[child], val[val.has[child]]);
          }
        }.bind(this));
      } else if (typeof data === 'object') {
        Models[modelName] = data;
        for (var model in data) {
          this.import.call(this, modelName + '/' + model, data[model]);
        }
      }
    },

    find: function (model, id) {
      try {
        return Models[index_prefix + model][id];
      } catch (e) {
        return {};
      }
    },

    get: function (name) {
      try {
        return Models[name];
      } catch (e) {
        return {};
      }
    }
  });

  function cleanUpContext(modelName, options) {
    if (!options || !options.context) { return; }
    var ctx = Context[options.context];
    if (ctx) {
      for (var key in Models) {
        if (key.slice(0, ctx.length + 1) == (ctx + '/')) {
          delete(Models[key]);
        } else if (key.slice(0, ctx.length + index_prefix.length + 1) == (index_prefix + ctx + '/')) {
          delete(Models[key]);
        }
      }
      delete(Models[ctx]);
      delete(Models[index_prefix + ctx]);
    }
    Context[options.context] = modelName;
  }
})(window.Shreds);
