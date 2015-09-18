(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InstagramEmbedProcessor = function ($element, options) {
  this._settings = $.extend({
    instagramEmbedScriptUrl: '//platform.instagram.com/en_US/embeds.js'
  }, options);
  this.$container = $element;
  this.$container.data('pluginInstagramEmbedProcessor', this);
};

// store deferred for getting instagram object
InstagramEmbedProcessor.prototype.shared = {instagramLoaded: null};

InstagramEmbedProcessor.prototype._getInstagramEmbedScript = function () {
  if (!this.shared.instagramLoaded || this.shared.instagramLoaded.state() === 'rejected') {

    this.shared.instagramLoaded = $.Deferred();

    var self = this;
    $.getScript(this._settings.instagramEmbedScriptUrl)
      .done(function () {
        self.shared.instagramLoaded.resolve();
      })
      .fail(function () {
        self.shared.instagramLoaded.reject(arguments);
        console.error('Unable to load instagram embed script!', arguments);
      });
  }

  return this.shared.instagramLoaded;
};

InstagramEmbedProcessor.prototype.sanitizeHtml = function (html) {
  return $(html).not('script').prop('outerHTML');
};

InstagramEmbedProcessor.prototype.getVersion = function () {
  return '1.0.0';
};

InstagramEmbedProcessor.prototype.isRendered = function (val) {
  return this.$container.attr('instagram-embed-rendered') === true;
};

InstagramEmbedProcessor.prototype.prep = function (embedHtml) {
  var sanitized = this.sanitizeHtml(embedHtml);
  this.$container.attr('instagram-processor-version', this.getVersion());
  this.$container.attr('instagram-embed-html', escape(sanitized));
};

InstagramEmbedProcessor.prototype.render = function () {

  if (!this.isRendered()) {
    this._getInstagramEmbedScript().done(function () {
      var code = this.attr('instagram-embed-html');
      this.html(unescape(code));
      instgrm.Embeds.process();
      this.attr('instagram-embed-rendered', true);
    }.bind(this.$container));
  }

};

InstagramEmbedProcessor.prototype.clear = function () {
  this.$container.empty();
  this.$container.attr('instagram-embed-rendered', true);
};

var createInstagramEmbedProcessor = function (options) {
  this.each(function () {
    var $this = $(this);
    if (!$this.data('pluginInstagramEmbedProcessor')) {
      $this.data('pluginInstagramEmbedProcessor', new InstagramEmbedProcessor($this, options));
    }
  });

  return this;
};

$.fn.instagramEmbedProcessor = createInstagramEmbedProcessor;

},{}]},{},[1]);
