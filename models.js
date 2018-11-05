const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const commentSchema = mongoose.Schema({ content: 'string' });

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  content: {
    type: String,
    required: true
  },
  comments: {
    type: [commentSchema]
  }

});

postSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

postSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

postSchema.virtual('authorName').get(function () {
  return `${this.author.firstName} ${this.author.lastName}`
});

postSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorName,
    content: this.content,
    comments: this.comments
  }
}

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.Author = mongoose.model('Author', authorSchema);