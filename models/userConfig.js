const mongoose = require('mongoose')
      ,Schema  = mongoose.Schema

const requirecredentials = function(field) {
  return !(field.apiKey !== "" && field.apiSecret !== "")
}

const userConfigSchema = new Schema({
  user_id: {type: String, required: true},
  google_drive_credentials: {
    //apiKey: {type: String, required: requirecredentials(this.google_drive_credentials)},
   // apiSecret: {type: String, required: requirecredentials(this.google_drive_credentials)}
  },
  dropbox_credentials: {
    // apiKey: {type:String, required: requirecredentials(this.dropbox_credentials)},
    apiKey: {type:String},
    apiSecret: {type:String},
    access_token:{type:String},
    uid:{type:String},
    account_id:{type:String}
    //apiSecret: { type:String, required: requirecredentials(this.dropbox_credentials)},
  },

  syncWith: { type: String, required: false, enum: ["googledrive", "dropbox", "all"] }
})      

module.exports = mongoose.model("UserConfig", userConfigSchema);