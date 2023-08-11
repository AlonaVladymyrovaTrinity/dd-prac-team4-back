const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
      required: [true, 'Please provide artist name'],
      maxlength: [300, 'Artist name can not be more than 300 characters'],
      trim: true,
    },
    albumName: {
      type: String,
      required: [true, 'Please provide album name'],
      maxlength: [300, 'Album name can not be more than 300 characters'],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '/uploads/example.jpg',
    },
    releaseDate: {
      type: Date,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    spotifyUrl: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } //timestamps provides fields of createdAt , updatedAt... and exact time,
);

AlbumSchema.virtual('purchasedAlbums', {
  ref: 'PurchasedAlbum', //specifies that the virtual field purchasedAlbums is referencing the PurchasedAlbum model.
  localField: '_id', //_id field (from the db= id of the product) of the Album model is used as the local field to establish the relationship.
  foreignField: 'albumId' // albumId field in the PurchasedAlbum model is used as the foreign field to establish the relationship.
});

const Album = mongoose.model('Album', AlbumSchema);


module.exports = Album;
