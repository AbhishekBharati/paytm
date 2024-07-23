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

// Create model from the Schema
const User = mongoose.model('User', userSchema);

module.exports = {
  User
}
