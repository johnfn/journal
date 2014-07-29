$(function() {
  var Post = Backbone.Model.extend({
    url: "/posts",
    parse: function(data) {
      return data;
    }
  });

  var templ = function(template) {
    return _.template(_.unescape($(template)[0].innerHTML));
  };

  var PostCollection = Backbone.Collection.extend({
    url: "/posts",
    model: Post
  });

  var PostView = Backbone.View.extend({
    template: templ(".templates .entry-template"),
  
    initialize: function (attrs) {
      this.render();
    },
  
    render: function() {
      this.el.innerHTML = this.template(this.model.toJSON());
      
      return this;
    }
  });

  var AddEntryButton = Backbone.View.extend({
    template: templ(".templates .add-entry-template"),
    text: "",

    initialize: function(attrs) {
      _.bindAll(this, "render");

      this.text = attrs.text || "Add New Entry";
      this.render();
    },

    render: function() {
      this.el.innerHTML = this.template({ content: this.text });

      return this;
    }
  });

  var DayView = Backbone.View.extend({
    template: templ(".templates .day-template"),

    initialize: function(attrs) {
      _.bindAll(this, "render");

      this.render(attrs);
    },

    render: function(attrs) {
      this.el.innerHTML = this.template(attrs);
    }
  });

  var CalendarView = Backbone.View.extend({
    el: ".content .row",

    initialize: function(attrs) {
      _.bindAll(this, "render");

      this.collection = attrs.collection;
      this.entries = attrs.entries;

      this.listenTo(this.collection, 'sync', this.render);
    }, 

    render: function() {
      var self = this;

      var groups = this.collection.groupBy(function (model) {
        var newDate = new Date(model.get('date'));
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        return +newDate;
      });

      var sortedKeys = _.sortBy(_.keys(groups), function(key) {
        return new Date(key);
      });

      _.each(sortedKeys, function(date) {
        var readableDate = ("" + new Date(parseInt(date))).substring(4, 15);

        var day = new DayView({
          el: $("<div>").appendTo(self.$el),
          date: readableDate,
          number: groups[date].length
        });
      });
    }
  });

  var SideView = Backbone.View.extend({
    editTemplate: templ(".templates .write-entry-template"),
    state: "list", // or "edit"
    events: {
      "click .add-entry": "addNewEntry",
      "change .textbox.title": "changeTitle",
      "change .textbox.body": "changeBody",
      "click .finish-post": "finishPost"
    },

    initialize: function(attrs) {
      _.bindAll(this, "toggleState", "addNewEntry", "render", "htmlToText", "getText", "getTitle", "finishPost");

      this.entries = attrs.entries;

      this.render();
    },

    getText: function() {
      return this.htmlToText(this.$(".textbox.body").html());
    },

    getTitle: function() {
      return this.htmlToText(this.$(".textbox.title").html());
    },

    finishPost: function(e) {
      var date = new Date();
      var content = this.getText();
      var title = this.getTitle();

      var post = new Post({
        date: date,
        content: content,
        title: title
      });


      post.save().always(function() {
        console.log("done");
      });
    },

    toggleState: function() {
      if (this.state == "list") {
        this.state = "edit";
      } else {
        this.state = "list";
      }

      this.render();
    },

    addNewEntry: function(e) {
      var self = this;

      $(".entry-list")
        .children()
        .fadeOut(100, _.once(function() {
          $(".content")
            .animate({ width: "50%" }, 100);

          $(".entry-list")
            .animate({ width: "50%" }, 100.0, function() {
              // done!
              self.toggleState();
            });
        }));
    },

    //TODO: is there a cleaner way to do this than creating these els on the fly?
    render: function() {
      if (this.state == "edit") {
        this.renderEdit();
      } else {
        this.renderList();
      }
    },

    changeTitle: function(e) {

    },

    htmlToText: function(html) {
      // Yeah, I'm parsing HTML with regex. What are you going to do about it?
      // Come at me, bro.

      // the first one isn't wrapped in a div, for some reason, so wrap it.
      html = html.replace(/([^<]*)/, "<div>$1</div>");
      html = html.replace(/<div><br><\/div>/g, "\n");
      html = html.replace(/<div>(.*?)<\/div>/g, "$1\n");
      html = html.replace(/&nbsp;/g, " ");

      return html;
    },

    changeBody: function(e) {
      var content = this.htmlToText($(e.currentTarget).html());
      $(".content")[0].innerHTML = markdown.toHTML(content);
    },

    renderEdit: function() {
      var self = this;

      this.el.innerHTML = this.editTemplate();

      addEventsToContentEditable(".textbox.title");
      addEventsToContentEditable(".textbox.body");
    },

    renderList: function() {
      var self = this;
      var addButton = new AddEntryButton({
        el: $("<div>").appendTo(self.$el)
      });

      this.entries.each(function(e) {
        new PostView({
          model: e,
          el: $("<div>").appendTo(self.$el)
        });
      });
    }
  });

  var addEventsToContentEditable = function(selector) {
    $('body').on('focus', selector, function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur keyup paste input', selector, function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    });
  };

  var posts = new PostCollection();

  new CalendarView({
    el: $(".content"),
    collection: posts
  });

  posts.fetch({
    success: function() {
      new SideView({
        el: $(".entry-list"),
        entries: posts
      });
    }
  });
});
