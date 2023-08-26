const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{2,3}-\d{7,}$/.test(value);
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
});


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
