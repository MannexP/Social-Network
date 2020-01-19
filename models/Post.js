const mongoose = require("mongoose");

// not necessary but cleaner than constantly typing mongoose.schema
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  // this connects user to posts
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        // by tying likes to user and user and userId user cannot double like
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  comments: [
    {
      user: {
        // by tying likes to user and user and userId user cannot double like
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
