const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const seedProducts = [
  // ==================== FURNITURE (10 PRODUCTS) ====================
  {
    title: 'Minimalist Lounge Chair',
    description: 'An elegant lounge chair featuring textured beige bouclé upholstery and a clean, slender charcoal-finished steel frame. Designed for ultimate comfort and architectural appeal.',
    features: [
      'Dimensions: 30" W x 32" D x 29" H',
      'Upholstery: Premium wool-blend bouclé fabric',
      'Frame: Matte-charcoal finished tubular steel',
      'Cushioning: High-density, resilient foam padding',
      'Assembly: Delivered fully assembled'
    ],
    price: 349.99,
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 8,
    reviews: [
      { username: 'Sarah M.', rating: 5, comment: 'This chair is stunning! The bouclé fabric is incredibly soft and looks premium.' },
      { username: 'David K.', rating: 4, comment: 'Great minimalist design. The steel frame feels very sturdy.' }
    ]
  },
  {
    title: 'Travertine Side Table',
    description: 'A sculptural side table carved entirely from creamy, honed travertine stone. The geometric interlocking base adds a subtle statement to any modern living room.',
    features: [
      'Dimensions: 16" W x 16" D x 18" H',
      'Material: 100% natural Italian travertine stone',
      'Finish: Honed matte finish, natural cavities left unfilled',
      'Weight: 42 lbs (heavy and stable)',
      'Maintenance: Seal annually, avoid acidic spills'
    ],
    price: 280.00,
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 5,
    reviews: [
      { username: 'Oliver H.', rating: 5, comment: 'An absolute masterpiece. Travertine stone is heavy and feels luxurious.' },
      { username: 'Emily B.', rating: 5, comment: 'Absolutely love the raw stone texture. Very fast delivery.' }
    ]
  },
  {
    title: 'Oak Dining Table',
    description: 'A classic, clean-lined dining table crafted from solid American white oak. Comfortably seats six and showcases the natural, beautiful wood grain.',
    features: [
      'Dimensions: 72" L x 36" W x 30" H',
      'Material: Solid American White Oak wood',
      'Finish: Matte clear protective lacquer',
      'Capacity: Seats 6 adults comfortably',
      'Assembly: Semi-assembled; legs require attachment'
    ],
    price: 799.00,
    imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 3,
    reviews: [
      { username: 'Marcus L.', rating: 5, comment: 'Solid oak, heavy, and beautiful grain detail. Worth every penny!' },
      { username: 'Clara J.', rating: 4, comment: 'Easy to attach the legs. Beautiful finish, but scratches easily without placemats.' }
    ]
  },
  {
    title: 'Ash Wood Credenza',
    description: 'A minimalist storage credenza featuring sliding slatted doors in natural ash wood. Perfect as a media console or dining room sideboard.',
    features: [
      'Dimensions: 60" W x 18" D x 26" H',
      'Material: Solid ash wood legs, ash veneer cabinet',
      'Doors: Quiet sliding slatted wood panels',
      'Storage: Adjustable inner shelves and cable cutouts',
      'Assembly: Delivered fully assembled'
    ],
    price: 520.00,
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 4,
    reviews: [
      { username: 'Rachel F.', rating: 5, comment: 'Absolutely beautiful console. The sliding slatted doors glide so smoothly.' },
      { username: 'Simon P.', rating: 5, comment: 'Hides all our media clutter perfectly. High quality ash wood finish.' }
    ]
  },
  {
    title: 'Bouclé Sofa',
    description: 'A curved, organic three-seater sofa wrapped in textured cream bouclé fabric. Bring modern architectural form and cozy warmth to your living room.',
    features: [
      'Dimensions: 86" W x 38" D x 28" H',
      'Fabric: Premium cream bouclé fabric upholstery',
      'Frame: Solid kiln-dried pine wood skeleton',
      'Support: Sinuous spring suspension with high foam cores',
      'Pillows: Includes two matching lumbar cushions'
    ],
    price: 950.00,
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 2,
    reviews: [
      { username: 'Jessica V.', rating: 5, comment: 'The center piece of our living room! Modern, chic, and very comfortable.' },
      { username: 'Tom B.', rating: 4, comment: 'Beautiful form. Soft fabric. The seating is slightly firm, which I prefer.' }
    ]
  },
  {
    title: 'Walnut Bed Frame',
    description: 'A platform bed frame showcasing the warm, deep grains of solid American walnut. Features a low profile and angled headboard.',
    features: [
      'Size: Queen (Dimensions: 64" W x 84" L x 38" Headboard H)',
      'Material: Solid American Walnut headboard and rails',
      'Base: Wooden slats (no box spring required)',
      'Height: Low-profile 10-inch platform elevation',
      'Assembly: Required (instructions and tools included)'
    ],
    price: 680.00,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 6,
    reviews: [
      { username: 'Aidan W.', rating: 5, comment: 'Gorgeous walnut grain. The frame is rock solid and doesn\'t squeak at all.' },
      { username: 'Sophia N.', rating: 4, comment: 'Assembly took about an hour with two people. The result is stunning!' }
    ]
  },
  {
    title: 'Modern Desk Chair',
    description: 'An ergonomic office task chair featuring a curved wood veneer shell and charcoal upholstered seat cushion, set on a rolling metal base.',
    features: [
      'Dimensions: 22" W x 22" D x 32"-36" H (adjustable)',
      'Shell: Molded walnut veneer plywood outer casing',
      'Seat: Premium charcoal wool fabric, foam padded',
      'Base: Chrome steel 5-star rolling casters base',
      'Functions: Height adjustable, 360-degree swivel'
    ],
    price: 189.00,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 10,
    reviews: [
      { username: 'Miles D.', rating: 5, comment: 'Stunning office chair. Perfect blend of mid-century aesthetics and comfort.' },
      { username: 'Laura K.', rating: 4, comment: 'Very easy to adjust. Looks beautiful in my home office workspace.' }
    ]
  },
  {
    title: 'Floating Shelf System',
    description: 'A set of three minimalist floating shelves crafted from solid white oak. Pre-drilled for heavy-duty hidden steel brackets.',
    features: [
      'Set Details: Includes three shelves (18", 24", and 30" Lengths)',
      'Dimensions: 6" Depth x 1.25" Thickness',
      'Material: Solid white oak wood',
      'Hardware: Includes hidden internal steel support rods',
      'Capacity: Supports up to 25 lbs per shelf when properly anchored'
    ],
    price: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1594235411782-b7e3e7f603c7?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 14,
    reviews: [
      { username: 'Eva G.', rating: 5, comment: 'Beautiful shelves, and the hidden brackets make them look super clean!' },
      { username: 'Chris J.', rating: 5, comment: 'Solid wood, very sturdy. The different lengths look great staggered.' }
    ]
  },
  {
    title: 'Leather Accent Bench',
    description: 'A modern entryway bench featuring a woven cognac leather seat set in a solid ash wood frame. Perfect for entryways or bedroom ends.',
    features: [
      'Dimensions: 48" W x 16" D x 18" H',
      'Seat: Hand-woven genuine vegetable-tanned leather straps',
      'Frame: Solid ash wood with natural clear finish',
      'Weight Capacity: Supports up to 350 lbs',
      'Assembly: Delivered fully assembled'
    ],
    price: 240.00,
    imageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 4,
    reviews: [
      { username: 'Derrick M.', rating: 5, comment: 'The leather smells amazing and is high quality. Looks great in my entryway.' },
      { username: 'Anna C.', rating: 5, comment: 'Elegant, simple, and the cognac leather goes beautifully with the ash frame.' }
    ]
  },
  {
    title: 'Stone Top Coffee Table',
    description: 'A round coffee table with a matte white Carrara marble top resting on three thick cylindrical oak legs. Simple and grounded.',
    features: [
      'Dimensions: 36" Diameter x 15" H',
      'Top: 20mm thick honed Carrara white marble slab',
      'Legs: Solid white oak cylinders (matte lacquer)',
      'Weight: 75 lbs',
      'Assembly: Easy 3-bolt legs attachment'
    ],
    price: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 3,
    reviews: [
      { username: 'Lucas G.', rating: 5, comment: 'Gorgeous Carrara marble table. The rounded edges make it very kid-friendly.' },
      { username: 'Mia R.', rating: 4, comment: 'Beautiful piece of furniture. Very heavy marble, require two people to lift.' }
    ]
  },

  // ==================== DECOR (10 PRODUCTS) ====================
  {
    title: 'Wabi-Sabi Ceramic Vase',
    description: 'Handcrafted stoneware vase with an organic, textured surface and a muted off-white matte glaze. Beautiful on its own or displaying dry botanicals.',
    features: [
      'Height: 12 inches | Diameter: 6 inches',
      'Material: 100% natural clay stoneware',
      'Finish: Hand-textured matte off-white glaze',
      'Usage: Best suited for dry flowers or decorative display',
      'Care: Wipe clean with a soft dry cloth'
    ],
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 15,
    reviews: [
      { username: 'Elena R.', rating: 5, comment: 'Perfect! The texture is gorgeous and organic.' },
      { username: 'Mark T.', rating: 5, comment: 'Beautiful wabi-sabi aesthetics.' }
    ]
  },
  {
    title: 'Solid Oak Serving Board',
    description: 'A minimalist kitchen essential made of premium solid oak. Finished with food-safe oils and featuring a carved carrying handle and leather hanging loop.',
    features: [
      'Dimensions: 18" L x 8" W x 0.8" Thickness',
      'Material: Solid white oak wood',
      'Finish: Food-grade organic mineral oil',
      'Details: Integrated handle with dark brown leather strap',
      'Care: Hand wash only, oil monthly'
    ],
    price: 38.00,
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 25,
    reviews: [
      { username: 'Lucia D.', rating: 5, comment: 'Charcuterie boards look restaurant-quality on this.' },
      { username: 'Ryan W.', rating: 4, comment: 'Thick, high quality board. Handle is very convenient.' }
    ]
  },
  {
    title: 'Minimalist Wall Clock',
    description: 'A silent sweep wall clock with a textured sand dial and slender charcoal-finished steel hands, housed in a thin, matching bezel.',
    features: [
      'Diameter: 12 inches | Depth: 1.5 inches',
      'Material: Steel bezel, mineral glass cover',
      'Movement: Silent sweep quartz (no ticking sound)',
      'Battery: Requires 1 AA battery (not included)',
      'Mount: Drywall anchor hanger included'
    ],
    price: 55.00,
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 7,
    reviews: [
      { username: 'Nathan K.', rating: 5, comment: 'I love that it is completely silent. Fits perfectly.' },
      { username: 'Clara M.', rating: 5, comment: 'Simple, modern, and elegant craftsmanship.' }
    ]
  },
  {
    title: 'Concrete Bookends',
    description: 'A pair of sculptural bookends made of solid, fine-grain concrete. Weighted to support heavy hardcovers and finished with protective felt bases.',
    features: [
      'Quantity: Set of 2 bookends',
      'Dimensions: 4.5" W x 4.5" D x 6" H (each)',
      'Material: Hand-poured concrete',
      'Weight: 4.5 lbs each (9 lbs total)',
      'Protection: Non-slip felt padding on bottom bases'
    ],
    price: 34.00,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 12,
    reviews: [
      { username: 'William O.', rating: 5, comment: 'Super heavy and easily hold up my massive design art books. Very raw and industrial.' },
      { username: 'Hailey F.', rating: 4, comment: 'Looks great on my bookshelf. The concrete texture is beautiful, although slightly dusty initially.' }
    ]
  },
  {
    title: 'Textured Wall Art',
    description: 'An abstract, minimalist plaster wall art piece in an ash wood frame. Features organic carved waves that capture shadows beautifully.',
    features: [
      'Dimensions: 24" W x 32" H x 1.5" D',
      'Medium: Textured acrylic and plaster on canvas',
      'Frame: Solid natural ash wood frame',
      'Hanging: Pre-installed heavy-duty D-rings',
      'Orientation: Can be hung vertically or horizontally'
    ],
    price: 110.00,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 8,
    reviews: [
      { username: 'Cynthia B.', rating: 5, comment: 'The depth and texture of this piece is beautiful. The ash frame is very high quality.' },
      { username: 'Alex R.', rating: 5, comment: 'Understated and elegant. Adds a lovely dimensional aspect to our living room.' }
    ]
  },
  {
    title: 'Brass Incense Holder',
    description: 'A solid brass block incense burner featuring a circular wells and brushed finish. Catches ash cleanly in its solid, heavyweight tray.',
    features: [
      'Dimensions: 5" Diameter x 0.75" H',
      'Material: 100% solid brass',
      'Finish: Dented and hand-brushed satin lacquer',
      'Aperture: Dual-size holes for thin Japanese or thick stick incense',
      'Care: Clean with brass polish'
    ],
    price: 24.00,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 30,
    reviews: [
      { username: 'Lila K.', rating: 5, comment: 'Heavy, solid, and fits my Shoyeido incense sticks perfectly. Beautiful warm brass.' },
      { username: 'Gregory W.', rating: 4, comment: 'Stunning burner. Takes a bit of cleaning since brass tarnishes over time, but gorgeous.' }
    ]
  },
  {
    title: 'Sculptural Stone Object',
    description: 'An abstract geometric sculpture carved from a solid block of beige sandstone. Adds architectural detail to shelves and desks.',
    features: [
      'Dimensions: 5" W x 5" D x 8" H',
      'Material: Solid natural sandstone block',
      'Finish: Rough carved matte exterior texture',
      'Weight: 3.2 lbs',
      'Design: Hand-sculpted modernist geometric shapes'
    ],
    price: 49.00,
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 9,
    reviews: [
      { username: 'Victoria J.', rating: 5, comment: 'A beautiful piece of shelf styling. The sandstone has lovely subtle color layers.' },
      { username: 'Ian M.', rating: 5, comment: 'Looks like a museum piece on my shelf. Very architectural.' }
    ]
  },
  {
    title: 'Arch Table Mirror',
    description: 'A freestanding vanity arch mirror featuring a polished glass plate set inside a thick, solid travertine stone base.',
    features: [
      'Dimensions: 9" W x 3" D x 12" H',
      'Mirror: High-definition distortion-free glass',
      'Base: Honed cream travertine stone block',
      'Tilt: Fixed angle for table or vanity display',
      'Backing: Black velvet scratch protection backing'
    ],
    price: 68.00,
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 11,
    reviews: [
      { username: 'Hannah E.', rating: 5, comment: 'The travertine base is lovely and heavy. The arch shape is extremely chic.' },
      { username: 'Nadia S.', rating: 4, comment: 'Very aesthetic vanity mirror. Make sure to place it carefully since the glass slips out of base for cleaning.' }
    ]
  },
  {
    title: 'Matte Ceramic Bowl Set',
    description: 'A nested set of three decorative ceramic bowls in shades of charcoal, sand, and cream. Finished in a soft matte glaze.',
    features: [
      'Quantity: Set of 3 nesting bowls',
      'Diameters: Large (8"), Medium (6"), Small (4")',
      'Material: Glazed ceramic stoneware',
      'Finish: Muted matte slip coating',
      'Food Safe: Yes, suitable for serving or decorative key trays'
    ],
    price: 42.00,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 18,
    reviews: [
      { username: 'Ethan H.', rating: 5, comment: 'Beautiful nesting set. I use the small one for rings and the large one on the dining table.' },
      { username: 'Grace P.', rating: 5, comment: 'Lovely organic colors and soft texture. Very versatile.' }
    ]
  },
  {
    title: 'Handcrafted Clay Pitcher',
    description: 'A rustic, hand-thrown terracotta pitcher with a handle and pouring spout, finished with an interior glaze for food safety.',
    features: [
      'Height: 9 inches | Capacity: 1.2 Liters',
      'Material: Red clay terracotta',
      'Finish: Glazed interior, unglazed raw exterior',
      'Usage: Handwash recommended, suitable for cold liquids',
      'Origin: Handcrafted by local artisans'
    ],
    price: 36.00,
    imageUrl: 'https://images.unsplash.com/photo-1576016770956-debb63d900ad?q=80&w=600&auto=format&fit=crop',
    category: 'Decor',
    stock: 10,
    reviews: [
      { username: 'Carla L.', rating: 5, comment: 'Stunning pitcher. I use it as a vase for wild flowers, and it looks beautiful.' },
      { username: 'Arthur S.', rating: 4, comment: 'Rough raw texture on the outside, glazed well on the inside. Pouring spout is clean.' }
    ]
  },

  // ==================== LIGHTING (10 PRODUCTS) ====================
  {
    title: 'Brushed Brass Pendant Light',
    description: 'A striking pendant lamp crafted from brushed brass, projecting warm directional light. Features a matching ceiling rose and a 1.5-meter black textile cord.',
    features: [
      'Shade Diameter: 8.5 inches | Height: 10 inches',
      'Material: Spun brass with brushed satin finish',
      'Cord: 1.5m adjustable black braided textile cable',
      'Socket Type: E26 medium base (LED bulb recommended)',
      'Installation: Professional hardwiring required'
    ],
    price: 120.00,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 12,
    reviews: [
      { username: 'Julian P.', rating: 4, comment: 'The brass finish is beautiful and has a lovely warm hue.' },
      { username: 'Sophia G.', rating: 5, comment: 'Exactly what I wanted for our kitchen island.' }
    ]
  },
  {
    title: 'Architectural Desk Lamp',
    description: 'A sleek, matte-charcoal task light with an adjustable pivoting arm and head, complete with integrated dimmable LED technology.',
    features: [
      'Max Height: 24 inches | Base Diameter: 7 inches',
      'Material: Aluminum body with steel base weighting',
      'Light Source: Dimmable 8W integrated LED (3000K warm white)',
      'Adjustability: 3-point articulation at base, elbow, and head',
      'Control: Touch-sensitive dimmer on base'
    ],
    price: 89.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 10,
    reviews: [
      { username: 'Aidan F.', rating: 5, comment: 'Super clean lines and very responsive touch control.' },
      { username: 'Megan S.', rating: 4, comment: 'Minimalist desk essential. Moves very smoothly.' }
    ]
  },
  {
    title: 'Opal Glass Globe Floor Lamp',
    description: 'A tall, elegant floor lamp featuring a hand-blown opal glass globe resting on a slender brass-finished stem and heavy black marble base.',
    features: [
      'Height: 62 inches | Globe Diameter: 10 inches',
      'Globe Material: Acid-etched hand-blown white opal glass',
      'Pole & Neck: Satin gold brass plated steel',
      'Base: 8-inch solid black Nero Marquina marble block',
      'Switch: Convenient inline foot switch on black cord'
    ],
    price: 199.99,
    imageUrl: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 8,
    reviews: [
      { username: 'Timothy V.', rating: 5, comment: 'Emits a lovely diffused, cozy light. The marble base makes it incredibly heavy and stable.' },
      { username: 'Claire H.', rating: 4, comment: 'Perfect addition to our living room corner. Assembly was quick, but bulb wasn\'t included.' }
    ]
  },
  {
    title: 'Ceramic Table Lamp',
    description: 'A warm table lamp featuring a ribbed ceramic base in a natural sand finish, topped with a drum-style oatmeal linen shade.',
    features: [
      'Overall Height: 21 inches | Shade Diameter: 12 inches',
      'Base: Stoneware ceramic with organic ribbed design',
      'Shade: Oatmeal textured woven linen fabric',
      'Control: Rotary switch on socket (supports 3-way bulbs)',
      'Max Wattage: 60W equivalent E26 LED'
    ],
    price: 75.00,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 15,
    reviews: [
      { username: 'Iris A.', rating: 5, comment: 'Gives off a warm, cozy light. The linen shade has a very nice texture.' },
      { username: 'Peter B.', rating: 5, comment: 'Simple, rustic, and warm. Fits my bedside tables beautifully.' }
    ]
  },
  {
    title: 'Pleated Paper Pendant Light',
    description: 'A light, origami-inspired pendant shade made of durable pleated paper. Diffuses a soft, sculptural glow over dining tables.',
    features: [
      'Diameter: 18 inches | Height: 12 inches',
      'Shade: Premium extra-thick pleated white craft paper',
      'Hardware: White canopy with 1.2m adjustable cord',
      'Socket: E26 medium base (LED bulb ONLY to avoid heat)',
      'Structure: Collapsible folding magnetic lock frame'
    ],
    price: 65.00,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 9,
    reviews: [
      { username: 'Gwen F.', rating: 5, comment: 'Origami design is beautiful. Looks like a designer lamp at a fraction of cost.' },
      { username: 'Leo D.', rating: 4, comment: 'Really soft light diffusion. Must use LED bulbs. Paper feels robust.' }
    ]
  },
  {
    title: 'Matte Black Wall Sconce',
    description: 'A minimalist wall sconce with a rotating cone shade in matte black powder coating, detailed with a warm brass pivot.',
    features: [
      'Dimensions: 6" W x 10" D x 8" H',
      'Material: Powder-coated steel cone, solid brass details',
      'Rotation: 180-degree swivel left-to-right, 90-degree tilt',
      'Wiring: Plug-in (6ft cord with switch) or convertible to hardwire',
      'Socket: E12 candelabra base bulb'
    ],
    price: 58.00,
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 16,
    reviews: [
      { username: 'Regina C.', rating: 5, comment: 'Perfect bedroom reading sconce. Swivel is smooth and matte finish is crisp.' },
      { username: 'Jared M.', rating: 4, comment: 'Great sconces. Switched them to hardwire for our headboard. Looks super clean.' }
    ]
  },
  {
    title: 'Cordless Brass LED Lamp',
    description: 'A portable, battery-powered rechargeable desk lamp crafted from brass. Offers three touch-dimming light levels.',
    features: [
      'Dimensions: 4.5" Base Diameter x 10" H',
      'Material: Solid aluminum housing with satin gold plating',
      'Battery: Built-in 4000mAh rechargeable lithium ion cell',
      'Run Time: 8 to 40 hours depending on brightness level',
      'Charging: USB-C port (cable included, adapter not included)'
    ],
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 22,
    reviews: [
      { username: 'Neil S.', rating: 5, comment: 'Excellent portable light! Very handy for outdoor dining tables.' },
      { username: 'Diana W.', rating: 5, comment: 'Three brightness levels work perfectly. Battery charge lasts for days.' }
    ]
  },
  {
    title: 'Concrete Pendant Light',
    description: 'An industrial pendant light fixture molded from raw concrete, featuring organic bubbles and a rough-textured rim.',
    features: [
      'Diameter: 5 inches | Height: 7 inches',
      'Material: Finely cast real concrete shade',
      'Cord: 1.2m adjustable grey woven cloth cord',
      'Socket: E26 medium base bulb (Max 40W)',
      'Canopy: Matching grey steel ceiling rose plate'
    ],
    price: 49.00,
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 11,
    reviews: [
      { username: 'Vince G.', rating: 5, comment: 'Provides a focused downlight. Concrete looks raw and beautiful.' },
      { username: 'Kelly P.', rating: 4, comment: 'Perfect addition over our concrete kitchen bar. Cable is a good length.' }
    ]
  },
  {
    title: 'Linear Dining Chandelier',
    description: 'A modern linear suspension chandelier with four frosted glass globes set on a horizontal matte black iron bar.',
    features: [
      'Dimensions: 42" L x 6" W x 12"-48" H (adjustable drop)',
      'Material: Matte black iron tube bar with brass knuckles',
      'Globes: Frosted white hand-blown glass spheres (5" diameter)',
      'Bulbs: Includes 4 warm LED G9 base bulbs',
      'Mount: Suitable for flat or sloped ceilings'
    ],
    price: 249.00,
    imageUrl: 'https://images.unsplash.com/photo-1543083477-4f7f010a6675?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 5,
    reviews: [
      { username: 'Rebecca F.', rating: 5, comment: 'Stunning centerpiece over our oak dining table. Easy to assemble.' },
      { username: 'Lucas C.', rating: 5, comment: 'The lighting is perfectly balanced. Highly recommended for dining rooms.' }
    ]
  },
  {
    title: 'Sculptural Glass Sconce',
    description: 'A wall light fixture featuring a ribbed glass dome that refracts light across the wall, finished with a black steel base.',
    features: [
      'Dome Diameter: 7 inches | Depth: 4 inches',
      'Glass: Clear heavy ribbed glass shade',
      'Base: Powder-coated matte black iron disc',
      'Installation: Wall hardwired only (dimmable)',
      'Socket: E12 base, LED bulb included'
    ],
    price: 78.00,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'Lighting',
    stock: 14,
    reviews: [
      { username: 'Audrey T.', rating: 5, comment: 'The ribbed glass throws the most beautiful pattern of light onto the wall.' },
      { username: 'Ian R.', rating: 4, comment: 'High quality glass, very heavy. Fast shipping and look great in my hallway.' }
    ]
  },

  // ==================== TEXTILES (10 PRODUCTS) ====================
  {
    title: 'Linen Throw Blanket',
    description: 'Crafted from 100% European flax, this sand-colored throw blanket is pre-washed for exceptional softness and features delicate fringed edges.',
    features: [
      'Dimensions: 50" W x 70" L',
      'Material: 100% European linen flax',
      'Detailing: 1-inch eyelash fringe on all sides',
      'Weight: Lightweight, breathable for all seasons',
      'Care: Machine wash cold, tumble dry low'
    ],
    price: 65.00,
    imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 20,
    reviews: [
      { username: 'Chloe L.', rating: 4, comment: 'Super soft and light. Perfect for warm summer evenings.' },
      { username: 'James V.', rating: 5, comment: 'Very high quality linen throw. It washes well.' }
    ]
  },
  {
    title: 'Waffle Hand Towel Set',
    description: 'A set of two oversized hand towels woven from organic cotton. Features a deep waffle structure that is exceptionally quick-drying.',
    features: [
      'Quantity: Set of 2 hand towels',
      'Dimensions: 18" W x 32" L (each)',
      'Material: 100% organic cotton, GOTS certified',
      'Weave: 400 GSM textured honeycomb waffle weave',
      'Loops: Features integrated cotton loop hangers'
    ],
    price: 28.00,
    imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 25,
    reviews: [
      { username: 'Emma D.', rating: 5, comment: 'Dry so quickly and look incredibly elegant in my bathroom. Thick waffle texture.' },
      { username: 'Kyle M.', rating: 5, comment: 'Super absorbent and minimal. Waffle design stays soft after washing.' }
    ]
  },
  {
    title: 'Linen Pillow Cover',
    description: 'A minimalist square cushion cover made of thick, heavy-textured flax linen in a neutral charcoal grey color.',
    features: [
      'Dimensions: 20" x 20" (standard square)',
      'Material: 100% heavy-weight flax linen',
      'Closure: Invisible hidden metal zipper design',
      'Detail: Knife-edge finish seams',
      'Insert: Cushion insert NOT included (22" insert recommended)'
    ],
    price: 24.00,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 40,
    reviews: [
      { username: 'Stella V.', rating: 5, comment: 'Very thick and rustic linen fabric. Perfect charcoal shade.' },
      { username: 'Brandon B.', rating: 4, comment: 'Heavy weight fabric and solid zipper. Looks great on my light grey sofa.' }
    ]
  },
  {
    title: 'Jute Area Rug',
    description: 'A hand-woven area rug crafted from natural, sustainably-sourced jute fibers. Sturdy, textured, and perfect for high-traffic zones.',
    features: [
      'Dimensions: 5\' W x 8\' L',
      'Material: 100% organic natural jute fiber',
      'Weave: Hand-loomed chunky loop weave',
      'Thickness: 0.5 inches height profile',
      'Backing: Reversible design (same weave on both sides)'
    ],
    price: 145.00,
    imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 5,
    reviews: [
      { username: 'Victor K.', rating: 5, comment: 'Heavy and stable. Adds a beautiful warm texture. Perfect under my coffee table.' },
      { username: 'Alice D.', rating: 4, comment: 'Chunky loops are very soft. Jute sheds slightly in the first week, but settles down.' }
    ]
  },
  {
    title: 'Wool Knit Cushion Cover',
    description: 'A cozy, cable-knit pillow cover made from a chunky wool blend. Adds chunky sweater-like texture to sofas and armchairs.',
    features: [
      'Dimensions: 18" x 18" (square)',
      'Material: 80% natural wool, 20% organic cotton',
      'Backing: Smooth cotton canvas backing (solid cream)',
      'Closure: Hidden zip lining',
      'Care: Dry clean recommended'
    ],
    price: 35.00,
    imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 12,
    reviews: [
      { username: 'Melanie S.', rating: 5, comment: 'Super chunky and cozy! Matches my beige bouclé chair perfectly.' },
      { username: 'Daniel W.', rating: 5, comment: 'Excellent quality wool. Heavy knit pattern, feels very premium.' }
    ]
  },
  {
    title: 'Linen Duvet Cover Set',
    description: 'A luxurious bedding set including a queen duvet cover and two standard pillowcases, woven from premium pre-washed Belgian flax.',
    features: [
      'Size: Queen (Duvet: 90" W x 92" L | Shams: 20" W x 26" L)',
      'Material: 100% Belgian Flax Linen (160 GSM)',
      'Closure: Inside corner ties, hidden button closure',
      'Finish: Pre-washed for maximum softness and vintage rumpled look',
      'Care: Machine wash warm, tumble dry'
    ],
    price: 185.00,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 4,
    reviews: [
      { username: 'Felicia G.', rating: 5, comment: 'Sleeping in this feels like a luxury hotel. Breathable, cool, and soft.' },
      { username: 'George L.', rating: 5, comment: 'Beautiful soft flax. Duvet button stitching is solid and corner ties hold well.' }
    ]
  },
  {
    title: 'Cotton Grid Quilt',
    description: 'A modern lightweight coverlet featuring a simple stitched grid pattern on organic white cotton. Ideal for layering.',
    features: [
      'Size: Full/Queen (Dimensions: 92" W x 96" L)',
      'Material: 100% organic cotton shell and batting filler',
      'Pattern: 2-inch stitched square grid quilting',
      'Weight: Lightweight coverlet layer',
      'Color: Crisp off-white cream'
    ],
    price: 120.00,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 8,
    reviews: [
      { username: 'Sonia A.', rating: 5, comment: 'Love the minimalist grid stitch. Lightweight but keeps me warm in spring.' },
      { username: 'Brad M.', rating: 4, comment: 'Very clean lines. True white/off-white color. Fits our platform bed beautifully.' }
    ]
  },
  {
    title: 'Alpaca Throw Blanket',
    description: 'An ultra-soft, warm accent blanket woven from premium Peruvian baby alpaca wool, finished with long twisted fringes.',
    features: [
      'Dimensions: 50" W x 70" L',
      'Material: 100% Peruvian baby alpaca wool',
      'Weight: Medium weight, exceptionally warm',
      'Detail: 3-inch hand-twisted fringe details',
      'Hypoallergenic: Yes, wool contains no lanolin'
    ],
    price: 135.00,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 10,
    reviews: [
      { username: 'Oliver T.', rating: 5, comment: 'Unbelievably soft blanket. Light but much warmer than standard wool throws.' },
      { username: 'Zoe E.', rating: 5, comment: 'High-end alpaca fiber. The fringing is lovely and looks elegant draped over my sofa.' }
    ]
  },
  {
    title: 'Handwoven Runner Rug',
    description: 'A flat-weave runner rug woven from wool and cotton yarns, displaying a subtle sand-colored stripe pattern. Perfect for hallways.',
    features: [
      'Dimensions: 2.5\' W x 8\' L',
      'Material: 80% natural wool, 20% cotton base yarns',
      'Weave: Handwoven flat-weave Kilim style',
      'Reversible: Yes, identical pattern on both sides',
      'Care: Vacuum regularly without brush bar, spot clean'
    ],
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 7,
    reviews: [
      { username: 'Marcus V.', rating: 5, comment: 'Beautiful neutral hallway runner. Flat weave is low profile and doors glide over it.' },
      { username: 'Linda J.', rating: 4, comment: 'High quality wool runner. Requires a non-slip rug pad underneath on hardwood.' }
    ]
  },
  {
    title: 'Velvet Accent Pillow',
    description: 'A rectangular lumbar pillow cover made of cotton velvet in a deep forest olive green shade, adding plush texture to seating.',
    features: [
      'Dimensions: 12" H x 20" W (lumbar rectangular)',
      'Material: 100% cotton velvet pile, canvas back backing',
      'Closure: Heavy-duty concealed metal zipper',
      'Stitching: Double-needle reinforced seams',
      'Care: Dry clean or spot wash interior'
    ],
    price: 29.00,
    imageUrl: 'https://images.unsplash.com/photo-1582282276538-4e8c1482f073?q=80&w=600&auto=format&fit=crop',
    category: 'Textiles',
    stock: 15,
    reviews: [
      { username: 'Talia R.', rating: 5, comment: 'Velvet is very plush and organic feeling. The olive color adds a beautiful pop to my beige couch.' },
      { username: 'Devon K.', rating: 5, comment: 'Solid construction and beautiful dark green tone. Looks very premium.' }
    ]
  }
];

async function seedDB() {
  try {
    // Delete existing products
    await Product.deleteMany({});
    console.log('Cleared existing products...');

    // Seed new products
    const seeded = await Product.insertMany(seedProducts);
    console.log(`Seeded ${seeded.length} products successfully.`);

    // Seed default test user if database is empty
    const userCount = await User.countDocuments();
    let testUser;
    if (userCount === 0) {
      console.log('Seeding a default test user...');
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await testUser.save();
      console.log('Default test user seeded: test@example.com / password123');
    } else {
      console.log('Users already exist. Skipping user seeding.');
      testUser = await User.findOne({ email: 'test@example.com' });
    }

    // Seed a mock checkout order if order database is empty
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && testUser) {
      console.log('Seeding a mock checkout order...');
      const sampleProducts = await Product.find().limit(2);
      if (sampleProducts.length >= 2) {
        const mockOrder = new Order({
          user: testUser._id,
          items: [
            {
              product: sampleProducts[0]._id,
              quantity: 1,
              price: sampleProducts[0].price
            },
            {
              product: sampleProducts[1]._id,
              quantity: 2,
              price: sampleProducts[1].price
            }
          ],
          totalAmount: sampleProducts[0].price + (sampleProducts[1].price * 2),
          shippingAddress: {
            fullName: 'John Doe',
            addressLine1: '123 Minimalist Way',
            city: 'Design City',
            postalCode: '10001',
            country: 'United States'
          },
          status: 'Processing'
        });
        await mockOrder.save();
        console.log('Mock order seeded successfully.');
      }
    } else {
      console.log('Orders already exist or no test user found. Skipping order seeding.');
    }
  } catch (error) {
    console.error('Seeding database failed:', error);
  }
}

module.exports = seedDB;
