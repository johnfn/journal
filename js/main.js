$(function() {
	var Post = Backbone.Model.extend({
	
	});

	var templ = function(template) {
		return _.template(_.unescape($(template)[0].innerHTML));
	};

	var PostView = Backbone.View.extend({
		template: templ(".templates .entry-template"),
	
		initialize: function (attrs) {
			this.render();
		},
	
		render: function() {
			this.el.innerHTML = this.template(this.model);
			
			return this;
		}
	});

	var AddEntryButton = Backbone.View.extend({
		template: templ(".templates .add-entry-template"),

		initialize: function() {
			this.render();
		},

		render: function() {
			this.el.innerHTML = this.template();

			return this;
		}
	});

	var SideView = Backbone.View.extend({
		entries: [],

		initialize: function(attrs) {
			this.entries = attrs.entries;

			this.render();
		},

		//TODO: is there a cleaner way to do this than creating these els on the fly?
		render: function() {
			var self = this;
			var addButton = new AddEntryButton({
				el: $("<div>").appendTo(self.$el)
			});

			_.each(this.entries, function(e) {
				new PostView({
					model: e,
					el: $("<div>").appendTo(self.$el)
				});
			});
		}
	});

	var post1 = {
		entry_title: "Some title",
		entry_date: ("" + new Date).substr(0, 10),
		entry_summary: "this is a compelling summary"
	};

	var post2 = {
		entry_title: "Some title",
		entry_date: ("" + new Date).substr(0, 10),
		entry_summary: "this is a compelling summary"
	};


	new SideView({ 
		el: $(".entry-list"),
		entries: [post1, post2]
	});

	console.log("bmm");
});
