$(function() {
  var Post = Backbone.Model.extend({
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

    initialize: function() {
      _.bindAll(this, "render");

      this.render();
    },

    render: function() {
      this.el.innerHTML = this.template();
    }
  });

  var CalendarView = Backbone.View.extend({
    el: ".content",
    days: [],

    initialize: function(attrs) {
      _.bindAll(this, "render");

      this.entries = attrs.entries;
      this.render();
    }, 

    render: function() {
      for (var i = 0; i < 25; i++) {
        var day = new DayView({
          el: $("<div>").appendTo(this.$el)
        });
      }
    }
  });

  var SideView = Backbone.View.extend({
    editTemplate: templ(".templates .write-entry-template"),
    state: "list", // or "edit"
    events: {
      "click .add-entry": "addNewEntry",
      "change .textbox.title": "changeTitle",
      "change .textbox.body": "changeBody"
    },

    initialize: function(attrs) {
      _.bindAll(this, "toggleState", "addNewEntry", "render");

      this.entries = attrs.entries;

      this.render();
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

      console.log(html);

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

  var post1 = {
    entry_title: "Some title",
    entry_date: ("" + new Date()).substr(0, 10),
    entry_summary: "this is a compelling summary",
    entry_content: "lots and lots of compelling content goes here."
  };

  var post2 = {
    entry_title: "Some title",
    entry_date: ("" + new Date()).substr(0, 10),
    entry_summary: "this is a compelling summary",
    entry_content: "lots of compelling content goes here."
  };

  new CalendarView({
    el: $(".content")
  });

  console.log("bmm");

  var posts = new PostCollection();
  posts.fetch({
    success: function() {
      new SideView({
        el: $(".entry-list"),
        entries: posts
      });
    }
  });
});
