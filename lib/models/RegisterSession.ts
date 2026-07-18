import mongoose from 'mongoose';

export interface IRegisterSession extends mongoose.Document {
  cashierId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  openingFloat: number;
  closingFloat?: number;
  salesCashTotal: number;
  salesCardTotal: number;
  actualCashInDrawer?: number;
  status: 'Open' | 'Closed';
  openedAt: Date;
  closedAt?: Date;
}

const registerSessionSchema = new mongoose.Schema({
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryLocation', required: true },
  openingFloat: { type: Number, required: true },
  closingFloat: Number,
  salesCashTotal: { type: Number, default: 0 },
  salesCardTotal: { type: Number, default: 0 },
  actualCashInDrawer: Number,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  openedAt: { type: Date, default: Date.now },
  closedAt: Date
});

const RegisterSession = mongoose.models.RegisterSession || mongoose.model<IRegisterSession>('RegisterSession', registerSessionSchema);
export default RegisterSession;
