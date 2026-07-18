import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../lib/models/Product';
import InventoryLocation from '../lib/models/InventoryLocation';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/minimalist-store';

const mockReviews = [
  { username: 'Sophia L.', rating: 5, comment: 'Exquisite craftsmanship. Fits beautifully in my neutral-toned living room.' },
  { username: 'Oliver H.', rating: 4, comment: 'Very minimalist and clean. Minor delay in shipping but product is top-tier.' },
  { username: 'Emma D.', rating: 5, comment: 'Perfect addition to a wabi-sabi aesthetic. Highly recommended!' },
  { username: 'Liam K.', rating: 5, comment: 'Extremely high quality. The materials feel solid and premium.' }
];

const products = [
  // ================= FURNITURE (10 products) =================
  {
    title: 'Minimalist Lounge Chair',
    description: 'A low-profile lounge chair made from solid white oak and upholstered in natural bouclé fabric. Perfect for modern study spaces or quiet reading corners.',
    features: ['Solid White Oak structure', 'Premium natural bouclé upholstery', 'High-density foam padding', 'Dimensions: W 78cm x D 82cm x H 70cm'],
    price: 649.00,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 12,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Travertine Coffee Table',
    description: 'A sculptural coffee table carved from premium beige travertine limestone, showcasing rich natural textures and geometric pillar supports.',
    features: ['100% natural honed travertine', 'Two cylindrical base column legs', 'Sealed finish for stain protection', 'Dimensions: L 100cm x W 60cm x H 38cm'],
    price: 899.00,
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 5,
    reviews: mockReviews.slice(1, 4)
  },
  {
    title: 'Ash Wood Credenza',
    description: 'A minimalist storage sideboard featuring soft-closing tambour doors and structured shelves, made from olive ash wood veneer.',
    features: ['Olive ash wood frame & veneer', ' Tambour sliding doors', 'Internal adjustable shelving', 'Wire management ports in rear panel'],
    price: 1250.00,
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 4,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Oak Dining Table',
    description: 'A spacious and sturdy dining table constructed from sustainably harvested solid European oak. Designed to seat up to 8 guests comfortably.',
    features: ['Solid European oak timber', 'Matte water-based polyurethane coating', 'Detachable legs for easy shipping', 'Dimensions: L 200cm x W 90cm x H 75cm'],
    price: 1450.00,
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 6,
    reviews: [mockReviews[0]]
  },
  {
    title: 'Rattan Armchair',
    description: 'A classic mid-century lounge chair featuring a hand-woven rattan backrest and seat, built on a robust black ash frame.',
    features: ['Natural hand-woven Indonesian rattan', 'Solid black dyed ash wood legs', 'Slightly angled seat for ergonomic support', 'Lightweight and easy to move'],
    price: 320.00,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 15,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Sculptural Bouclé Ottoman',
    description: 'A rounded, clover-shaped ottoman stool designed as a versatile accent piece. Can be used as extra seating or a comfortable footrest.',
    features: ['Clover-leaf structural core', 'Premium dense ivory bouclé yarn', 'Non-scratch rubber feet', 'Diameter: 45cm, Height: 42cm'],
    price: 180.00,
    imageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 20,
    reviews: mockReviews.slice(0, 1)
  },
  {
    title: 'Minimalist Oak Bench',
    description: 'A narrow entryway bench built from premium oak wood planks, showcasing fine joints and clean rectangular lines.',
    features: ['Solid oak planks', 'Exposed dowel joint detailing', 'Matte clear finish', 'Dimensions: L 120cm x W 30cm x H 45cm'],
    price: 260.00,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 8,
    reviews: mockReviews.slice(1, 3)
  },
  {
    title: 'Walnut Bedside Table',
    description: 'A sleek walnut nightstand featuring a single soft-close drawer and a lower open display shelf for books and essentials.',
    features: ['Solid North American walnut drawer fronts', 'High-quality soft-close drawer slides', 'Slim silhouette base', 'Dimensions: W 45cm x D 40cm x H 55cm'],
    price: 290.00,
    imageUrl: 'https://images.unsplash.com/photo-1532372320978-9b4d6a3a854c?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 14,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Bouclé Armchair',
    description: 'A beautifully rounded armchair enveloped in lush beige bouclé fabric with black steel tubular legs.',
    features: ['Curved barrel back styling', 'Beige bouclé fabric', 'Matte black steel framework', 'Weight capacity: 120kg'],
    price: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 10,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Ash Wood Dining Chair',
    description: 'A dining chair carved from premium ash timber, displaying a curved backrest splat and a woven paper cord seat.',
    features: ['Solid ash timber framing', 'Hand-woven natural paper cord seat', 'Sturdy tapered legs', 'Smooth sanded joints'],
    price: 195.00,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 24,
    reviews: mockReviews.slice(1, 3)
  },

  // ================= DECOR (10 products) =================
  {
    title: 'Wabi-Sabi Ceramic Vase',
    description: 'A hand-thrown stoneware vase with a rough, textured finish and an organic, slightly asymmetrical silhouette.',
    features: ['Stoneware clay', 'Hand-crafted in local studios', 'Matte unglazed exterior, glazed interior', 'Height: 28cm'],
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 30,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Concrete Arch Bookends',
    description: 'A pair of heavy concrete bookends shaped as architectural arches, bringing structured stone aesthetics to your bookshelves.',
    features: ['Cast concrete compound', 'Non-slip felt base padding', 'Sold as a set of two', 'Weight: 1.8kg each'],
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 45,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Abstract Plaster Sculpture',
    description: 'A hand-molded abstract tabletop sculpture featuring clean flowing lines, mounted on a solid black marble base.',
    features: ['Reinforced plaster core', 'Hand-finished matte texture', 'Real black marble base stand', 'Height: 35cm'],
    price: 110.00,
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 15,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Terracotta Planter',
    description: 'A minimalist terracotta flowerpot featuring a clean cylinder shape and a matching flush saucer tray.',
    features: ['Breathable raw Italian terracotta', 'Pre-drilled bottom drainage hole', 'Matching saucer included', 'Diameter: 20cm, Height: 18cm'],
    price: 38.00,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 40,
    reviews: mockReviews.slice(1, 4)
  },
  {
    title: 'Travertine Decorative Bowl',
    description: 'A shallow display bowl carved from polished travertine, perfect for holding keys, jewelry, or styled alone.',
    features: ['Natural honed travertine stone', 'Polished interior, matte exterior', 'Diameter: 25cm', 'Felt bumper pads underneath'],
    price: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 18,
    reviews: mockReviews.slice(0, 1)
  },
  {
    title: 'Brass Incense Burner',
    description: 'A heavy brass incense holder featuring a solid spherical core and a matching circular tray to catch falling ash.',
    features: ['Solid cast brass core', 'Suitable for stick & cone incense', 'Brushed metallic finish', 'Diameter: 12cm'],
    price: 55.00,
    imageUrl: 'https://images.unsplash.com/photo-1602872030219-5fb6de9d9f27?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 25,
    reviews: mockReviews.slice(1, 3)
  },
  {
    title: 'Scented Soy Wax Candle',
    description: 'A hand-poured soy wax candle inside an artisanal ceramic jar, scented with essential oils of cedarwood, amber, and patchouli.',
    features: ['100% natural soy wax core', 'Eco-friendly double wood wick', 'Artisanal refillable stoneware jar', 'Burn time: approximately 60 hours'],
    price: 32.00,
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 50,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Minimalist Wall Mirror',
    description: 'A round vanity mirror featuring an extremely thin anodized aluminum frame in matte black. Clean lines for any modern bathroom or corridor.',
    features: ['High-definition lead-free mirror', 'Anodized aluminum thin framing', 'Pre-installed mounting hooks', 'Diameter: 60cm'],
    price: 145.00,
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 12,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Marble Jewelry Tray',
    description: 'A rectangular catch-all tray carved from real Carrara white marble, featuring raised geometric guard rails.',
    features: ['100% genuine Carrara marble', 'Honed matte silk surface finish', 'Dimensions: L 30cm x W 15cm x H 2.5cm', 'Rich natural grey veining'],
    price: 75.00,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cb94801759?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 22,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Artisanal Ceramic Pitcher',
    description: 'A stoneware pitcher displaying a textured raw clay body and a contrasting white glazed spout. Safe for hot and cold beverages.',
    features: ['Food-grade durable stoneware', 'Raw textured base with satin glazed handle', 'Capacity: 1.5 Liters', 'Dishwasher and microwave safe'],
    price: 68.00,
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 16,
    reviews: mockReviews.slice(1, 3)
  },

  // ================= LIGHTING (10 products) =================
  {
    title: 'Brass Pendant Light',
    description: 'A classic cone pendant ceiling lamp made from solid spun brass, hanging from a premium black fabric-wrapped cord.',
    features: ['Solid spun brass shade', 'Black fabric electrical cord (L 1.5m)', 'E26 socket, Max 60W (LED compatible)', 'Dimensions: D 32cm x H 24cm'],
    price: 195.00,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 18,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Opal Globe Floor Lamp',
    description: 'A beautiful standing floor lamp showcasing a translucent hand-blown white opal glass sphere set on a slender matte black steel rod.',
    features: ['Hand-blown opal white glass sphere', 'Matte black powder-coated steel frame', 'Heavy circular base for stability', 'Foot-switch control cable'],
    price: 285.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 10,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Rechargeable LED Desk Lamp',
    description: 'A portable, cordless dome task lamp equipped with 3 dimming levels and a long-life rechargeable battery.',
    features: ['Integrated dimmable LED ring', 'USB-C charging port (cable included)', 'Up to 24 hours of light per charge', 'Touch-sensitive top button control'],
    price: 89.00,
    imageUrl: 'https://images.unsplash.com/photo-1542728929-14a35640090a?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 35,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Pleated Ceramic Table Lamp',
    description: 'A classical table lamp featuring a ribbed ceramic base in off-white, topped with a structured white linen pleated shade.',
    features: ['Ribbed unglazed ceramic base', 'White natural linen shade', 'Clear cord with inline toggle switch', 'Height: 48cm'],
    price: 160.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 15,
    reviews: mockReviews.slice(1, 3)
  },
  {
    title: 'Linear Wooden Chandelier',
    description: 'A sculptural linear pendant lamp carved from solid oak wood, integrated with a soft diffused downward-facing LED strip.',
    features: ['Solid oak wood block structure', 'Dimmable integrated warm LED (3000K)', 'Adjustable hanging steel cables', 'Dimensions: L 120cm x W 5cm x H 8cm'],
    price: 420.00,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 8,
    reviews: mockReviews.slice(0, 1)
  },
  {
    title: 'Paper Lantern Floor Lamp',
    description: 'A classic triangular-legged floor lamp made from hand-made mulberry paper, casting a warm diffused ambient light.',
    features: ['Traditional handmade mulberry paper shade', 'Powder-coated black steel wire legs', 'Warm LED bulb included', 'Height: 65cm'],
    price: 110.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 25,
    reviews: mockReviews.slice(1, 4)
  },
  {
    title: 'Industrial Swivel Sconce',
    description: 'A wall-mounted reading light featuring a pivot swing-arm constructed from matte black iron with brass detailing.',
    features: ['Heavy iron construction', '180-degree horizontal pivot swing-arm', 'Direct plug-in cord or hardwire options', 'Bulb socket E26'],
    price: 125.00,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 14,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Smoked Glass Table Lamp',
    description: 'A dome-shaped lamp made from translucent dark grey smoked glass, revealing a glowing filament bulb when switched on.',
    features: ['Mouth-blown dark smoked glass body', 'Includes dimmable Edison filament bulb', 'Fabric-wound cord cable', 'Dimensions: D 22cm x H 30cm'],
    price: 140.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 16,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Concrete Base Task Lamp',
    description: 'A minimalist task light featuring a raw cast concrete cylindrical base and a flexible directional spotlight head.',
    features: ['Raw concrete base weight', 'Adjustable black anodized aluminum neck', 'Bright spotlight focus lens', 'Perfect for workspaces'],
    price: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1542728929-14a35640090a?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 22,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Sculptural Marble Desk Lamp',
    description: 'A small accent table light crafted from a solid block of Nero Marquina black marble, highlighting a bare globe bulb.',
    features: ['Solid block of Nero Marquina marble', 'Brass hardware details', 'Fits G25 globe bulb (not included)', 'Dimensions: W 10cm x D 10cm x H 10cm'],
    price: 135.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 12,
    reviews: mockReviews.slice(1, 3)
  },

  // ================= TEXTILES (10 products) =================
  {
    title: 'European Linen Throw',
    description: 'A lightweight and breathable blanket woven from 100% natural European flax fibers, finished with clean fringed edges.',
    features: ['100% organic European flax linen', 'Breathable lightweight weave', 'Pre-washed for extra softness', 'Dimensions: 130cm x 170cm'],
    price: 120.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 25,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Belgian Flax Duvet Set',
    description: 'A luxurious queen bedding set including a duvet cover and two pillow shams, made from sustainable Belgian flax.',
    features: ['Includes: 1 Queen Duvet Cover, 2 Pillow Shams', '100% Belgian flax linen construction', 'Internal corner ties to secure duvet', 'Button closure at cover bottom'],
    price: 240.00,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 10,
    reviews: mockReviews.slice(1, 4)
  },
  {
    title: 'Waffle Cotton Towels Set',
    description: 'A set of quick-drying bath towels woven with a deep honeycombed waffle texture from organic long-staple cotton.',
    features: ['Set includes: 2 Bath Towels, 2 Hand Towels', '100% organic long-staple cotton', 'Super absorbent waffle honeycomb weave', 'Hanging hook loops sewn in'],
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 30,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Wool Bouclé Cushion Cover',
    description: 'A textured, thick throw pillow case made from blended wool and alpaca bouclé fibers, in a natural oatmeal hue.',
    features: ['Wool, alpaca, and cotton blend', 'Invisible hidden zipper lock closure', 'Insert cushion not included', 'Dimensions: 50cm x 50cm'],
    price: 48.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 40,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Heavyweight Linen Curtains',
    description: 'A pair of floor-length drapery panels woven from thick, heavy flax linen, adding structural warmth to window frames.',
    features: ['Set of 2 panels', 'Thick heavyweight weave block blocks 50% light', 'Dual back tabs and rod pocket tops', 'Dimensions: W 125cm x H 240cm per panel'],
    price: 195.00,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 12,
    reviews: mockReviews.slice(0, 1)
  },
  {
    title: 'Organic Cotton Bath Mat',
    description: 'A thick, plush bath rug made from high-pile looped organic cotton, designed to be ultra-soft underfoot.',
    features: ['100% organic cotton high pile loops', 'Slip-resistant natural latex spray backing', 'Machine washable', 'Dimensions: 50cm x 80cm'],
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 20,
    reviews: mockReviews.slice(1, 3)
  },
  {
    title: 'Merino Wool Throw Blanket',
    description: 'An incredibly soft throw blanket woven from premium extra-fine Merino wool, featuring a modern check grid pattern.',
    features: ['100% extra-fine Merino wool', 'Naturally temperature-regulating', 'Dry clean recommended', 'Dimensions: 140cm x 180cm'],
    price: 165.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 15,
    reviews: mockReviews.slice(0, 2)
  },
  {
    title: 'Linen Table Runner',
    description: 'A simple, rustic table runner woven from heavy flax fibers, adding organic texture to dining table layouts.',
    features: ['100% pre-washed linen', 'Double stitched hems', 'Dimensions: W 40cm x L 220cm', 'Machine washable, iron optional'],
    price: 52.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 25,
    reviews: mockReviews.slice(2, 4)
  },
  {
    title: 'Organic Cotton Napkins',
    description: 'A set of four soft cotton cloth napkins, woven with a subtle herringbone texture in warm taupe.',
    features: ['Set of 4 napkins', '100% organic cotton herringbone weave', 'Dimensions: 45cm x 45cm each', 'Reusable and eco-friendly'],
    price: 28.00,
    imageUrl: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 35,
    reviews: mockReviews.slice(0, 3)
  },
  {
    title: 'Alpaca Wool Bed Runner',
    description: 'A soft accents bed scarf woven from premium Peruvian alpaca wool, providing warmth at the foot of the bed.',
    features: ['80% Alpaca wool, 20% Acrylic for durability', 'Handcrafted fringed hem borders', 'Dimensions: W 60cm x L 200cm', 'Naturally hypoallergenic'],
    price: 115.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 10,
    reviews: mockReviews.slice(1, 3)
  }
];

async function seed() {
  try {
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully. Cleaning up old collections...');

    await Product.deleteMany({});
    await InventoryLocation.deleteMany({});
    console.log('Deleted existing products and locations.');

    // Seed default locations
    console.log('Seeding inventory locations...');
    const warehouse = await InventoryLocation.create({
      name: 'Central Warehouse',
      type: 'Warehouse',
      address: {
        addressLine1: '404 Industrial Parkway',
        city: 'Logistics City',
        postalCode: '90001',
        country: 'USA'
      }
    });

    const flagshipStore = await InventoryLocation.create({
      name: 'Aura Flagship Store',
      type: 'RetailStore',
      address: {
        addressLine1: '789 Design Boulevard',
        city: 'New York',
        postalCode: '10003',
        country: 'USA'
      }
    });

    console.log(`Created Locations: Warehouse (${warehouse._id}), Retail Store (${flagshipStore._id})`);

    // Map products to locations with barcodes & SKUs
    const productsWithPOS = products.map((p, index) => {
      const categoryCode = p.category.toUpperCase().slice(0, 4);
      const sku = `AUR-${categoryCode}-${String(index + 1).padStart(2, '0')}`;
      const barcode = `75010203${String(index + 1).padStart(4, '0')}`;
      
      // Store inventory is 5-20 units, online is the original stock
      const storeStock = Math.floor(Math.random() * 16) + 5;

      return {
        ...p,
        sku,
        barcode,
        stockAtLocations: [
          { locationId: warehouse._id, stock: p.stock },
          { locationId: flagshipStore._id, stock: storeStock }
        ]
      };
    });

    console.log('Seeding new 40 catalog items with locations...');
    const seeded = await Product.insertMany(productsWithPOS);
    console.log(`Successfully seeded ${seeded.length} products with POS records!`);

    await mongoose.disconnect();
    console.log('Database disconnected. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
    process.exit(1);
  }
}

seed();
