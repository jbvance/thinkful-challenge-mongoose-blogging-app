const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  content: {
    type: String,
    required: true
  }

});

postSchema.virtual('authorString').get(function () {
  return `${this.author.firstName} ${this.author.lastName}`
});

postSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorString,
    content: this.content
  }
}

module.exports.Post = mongoose.model('Post', postSchema);