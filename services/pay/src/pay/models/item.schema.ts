
import { ISellerItem } from "@pay/dto/item.d";
import mongoose, { Model, Schema, model } from 'mongoose';

const itemSchema: Schema = new Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, index: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    categories: { type: String, required: true },
    subCategories: [{ type: String, required: true }],
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
    expectedDelivery: { type: String, default: '' },
    ratingsCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    ratingCategories: {
      five: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      four: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      three: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      two: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      one: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    },
    price: { type: Number, default: 0 },
    sortId: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, rec) {
        rec.id = rec._id;
        delete rec._id;
        return rec;
      }
    }
  }
);

itemSchema.virtual('id').get(function() {
  return this._id;
});

const ItemModel: Model<ISellerItem> = model<ISellerItem>('Item', itemSchema, 'Item');
export { ItemModel };
