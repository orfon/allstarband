var {tokenKwargs} = require('reinhardt/token');
var {TemplateSyntaxError} = require('reinhardt/errors');
var {Node} = require('reinhardt/nodes');
var {urlFor} = require('stick/helpers');

var UrlNode = function(view, bindings) {
   this.view = view;
   this.bindings = bindings;
   return this;
}
UrlNode.prototype.getByType = Node.prototype.getByType;
UrlNode.prototype.render = function(context) {
   var binding = {};
   Object.keys(this.bindings).forEach(function(key) {
      binding[key] = this.bindings[key].resolve(context, true);
   }, this);
   binding.action = this.view.resolve(context, true);
   try {
      return urlFor(module.resolve('./views'), binding);
   } catch (e) {
      return '';
   }
}

/*
 *   {% url "index" id=5 user=user.firstname|lower %}
 */
exports.url = function(parser, token) {
   var bits = token.splitContents();
   if (bits.length < 2) {
      throw new TemplateSyntaxError('"url" tag requires at least one argument: the view name');
   }
   var view = parser.compileFilter(bits[1]);
   var remainingBits = bits.splice(2);
   var bindings = tokenKwargs(remainingBits, parser);
   return new UrlNode(view, bindings);
}
