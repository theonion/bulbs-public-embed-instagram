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

  return this.shared.instagramLoaded.promise();
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
  var html;
  if (typeof(embedHtml) !== 'string') {
    html = this.$container.attr('instagram-embed-html-unsanitized');
    this.$container.attr('instagram-embed-html-unsanitized', '');
  } else {
    html = embedHtml;
  }

  var sanitized = this.sanitizeHtml(html);
  this.$container.attr('instagram-processor-version', this.getVersion());
  this.$container.attr('instagram-embed-html', escape(sanitized));
};

InstagramEmbedProcessor.prototype.render = function () {
  var rendered;

  if (!this.isRendered()) {
    rendered = this._getInstagramEmbedScript().done(function () {
      var code = this.attr('instagram-embed-html');
      this.html(unescape(code));
      instgrm.Embeds.process();
      this.attr('instagram-embed-rendered', true);
    }.bind(this.$container));
  } else {
    rendered = this._getInstagramEmbedScript();
  }

  return rendered;
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
