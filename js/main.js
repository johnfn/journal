$(function() {
	var Post = Backbone.Model.extend({
	
	});

	var templ = function(template) {
		return _.template(_.unescape($(template)[0].innerHTML));
	};

	var PostView = Backbone.View.extend({
		template: templ(".templates .entry"),
	
		initialize: function (attrs) {
			this.render();
		},
	
		render: function() {
			this.el.innerHTML = this.template(this.model);
			
			return this;
		}
	});

	var AddEntryButton = Backbone.View.extend({
		template: templ(".templates .add-entry"),
	});

	var SideView = Backbone.View.extend({
		entries: [],

		initialize: function(attrs) {
			this.entries = attrs.entries;

			this.render();
		},

		render: function() {
			var addButton = new AddEntryButton();
			var self = this;

			//TODO: is there a cleaner way to do this than creating these els on the fly?
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
