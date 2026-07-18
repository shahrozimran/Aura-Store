import mongoose from 'mongoose';

export interface IInventoryLocation extends mongoose.Document {
  name: string;
  type: 'Warehouse' | 'RetailStore';
  address: {
    addressLine1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  isActive: boolean;
}

const inventoryLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Warehouse', 'RetailStore'], required: true },
  address: {
    addressLine1: String,
    city: String,
    postalCode: String,
    country: String
  },
  isActive: { type: Boolean, default: true }
});

const InventoryLocation = mongoose.models.InventoryLocation || mongoose.model<IInventoryLocation>('InventoryLocation', inventoryLocationSchema);
export default InventoryLocation;
