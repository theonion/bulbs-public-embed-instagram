var InstagramEmbedProcessor = function ($element, options) {
  this._settings = $.extend({
    instagramEmbedScriptUrl: '//platform.instagram.com/en_US/embeds.js'
  }, options);
  this.$container = $element;
  this.$container.data('pluginInstagramEmbedProcessor', this);

  this.$container.attr('instagram-processor-version', this._getVersion());
};

// store deferred for getting instagram object, use same deferred accross all instances
InstagramEmbedProcessor.prototype._shared = {instagramLoaded: null};

InstagramEmbedProcessor.prototype._getInstagramEmbedScript = function () {
  if (!this._shared.instagramLoaded || this._shared.instagramLoaded.state() === 'rejected') {

    this._shared.instagramLoaded = $.Deferred();

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

  return this._shared.instagramLoaded.promise();
};

InstagramEmbedProcessor.prototype._sanitizeHtml = function (html) {
  return $(html).not('script').prop('outerHTML');
};

InstagramEmbedProcessor.prototype._getVersion = function () {
  return '1.0.0';
};

InstagramEmbedProcessor.prototype.html = function (unescapedHtml) {
  if (typeof(unescapedHtml) === 'string') {
    this.$container.attr('instagram-embed-html', escape(unescapedHtml));
  }

  return unescape(this.$container.attr('instagram-embed-html'));
};

InstagramEmbedProcessor.prototype.isRendered = function (val) {
  return this.$container.data('instagramEmbedRendered') === true;
};

InstagramEmbedProcessor.prototype.prep = function (embedHtml) {
  var html;
  if (typeof(embedHtml) !== 'string') {
    html = this.$container.attr('instagram-embed-html-unsanitized');
    this.$container.attr('instagram-embed-html-unsanitized', '');
  } else {
    html = embedHtml;
  }

  var sanitized = this._sanitizeHtml(html);
  this.html(sanitized);
};

InstagramEmbedProcessor.prototype.render = function () {
  var rendered;

  if (!this.isRendered()) {
    var self = this;
    rendered = this._getInstagramEmbedScript().done(function () {
      self.$container.html(self.html());
      instgrm.Embeds.process();

      self.$container.data('instagramEmbedRendered', true);
    });
  } else {
    rendered = this._getInstagramEmbedScript();
  }

  return rendered;
};

InstagramEmbedProcessor.prototype.clear = function () {
  this.$container.empty();
  this.$container.data('instagramEmbedRendered', false);
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
