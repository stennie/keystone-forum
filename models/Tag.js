var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types;


// ==============================
// Forum Tags
// ==============================

var Tag = new keystone.List('Tag', {
	sortable: true,
	autokey: { from: 'name', path: 'key', unique: true },
	label: 'Tags',
	singular: 'Tag'
});

Tag.add({
	name: { type: String, required: true, initial: true, index: true }
});




// Meta
// ------------------------------

Tag.add('Meta', {
	topicCount: { type: Number, default: 0, collapse: true, noedit: true },
	replyCount: { type: Number, default: 0, collapse: true, noedit: true },
	lastActiveAt: { type: Date, collapse: true, noedit: true }
});




// Relationships
// ------------------------------

Tag.relationship({ path: 'topic', ref: 'Topic', refPath: 'tag' });




// Methods
// ------------------------------

Tag.schema.methods.wasActive = function() {
	this.lastActiveAt = new Date();
	return this;
}

Tag.schema.pre('save', function(next) {
	
	var tag = this;
	
	async.parallel([
		
		// cache the count of topics to this tag
		function(done) {
			keystone.list('Topic').model.count().where('tags').in([tag.id]).where('state', 'published').exec(function(err, count) {
				tag.topicCount = count || 0;
				done(err);
			});
		},
		
		// cache the count of replies to this tag
		function(done) {
			keystone.list('Reply').model.count().where('tag', tag.id).where('state', 'published').exec(function(err, count) {
				tag.replyCount = count || 0;
				done(err);
			});
		}
		
	], next);
	
});

Tag.defaultSort = 'sortOrder';
Tag.defaultColumns = 'name, topicCount,  replyCount, lastActiveAt';
Tag.register();
