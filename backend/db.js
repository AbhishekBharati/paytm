const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Abhishek:1212@cluster0.u6tquvd.mongodb.net/paytm")
  .then(() => {
    console.log("Db is connected");
  })

const schema = mongoose.Schema;

const userSchema = new schema({
  username: String,
  password: String,
  firstname: String,
  lastname: String
});

const accountSchema = new schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true
  }
});

// Create model from the Schema
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

module.exports = {
  User,
  Account
}
