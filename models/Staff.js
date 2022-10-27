const mongoose = require('mongoose');
const { Schema } = mongoose;

const StaffSchema = new Schema({
name:{
    type: String,
    required: true
},

email:{
    type: String,
    required: true
},

area:{
    type: String,
    required: true
},

phone:{
    type: String,
    required: true
},

status:{
    type: String,
    default:"No Work"
},

role:{
    type:String,
    default:"S"
},

password:{
    type: String,
    required: true
},

date:{
    type: Date,
    default:Date.now
}

});
const User = mongoose.model('staff', StaffSchema);
module.exports = User