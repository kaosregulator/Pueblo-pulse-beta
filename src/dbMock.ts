import {
  NeighborhoodData,
  BusinessItem,
  EventItem,
  JobItem,
  LostFoundItem,
  SafetyAlert,
  MarketplaceItem,
  ForumPost,
  UserProfile
} from "./types";

// Default profile
export const defaultUserProfile: UserProfile = {
  id: "user_chris",
  name: "Christopher Osorio",
  email: "christopherosorio7@gmail.com",
  role: "Verified User",
  badges: ["Local Guide", "Historian"],
  points: 340,
  neighborhood: "mesa"
};

// Historic and Modern Neighborhoods list
export const INITIAL_NEIGHBORHOODS: NeighborhoodData[] = [
  {
    id: "downtown",
    name: "Downtown",
    type: "modern",
    overview: "Pueblo's civic and artistic center, home to museums, retail galleries, and the Riverwalk.",
    history: "Laid out in the 1870s alongside the Arkansas River, Downtown was rebuilt stronger and safer after the catastrophic Great Pueblo Flood of 1921.",
    timeline: [
      { year: "1872", title: "Incorporation", text: "Pueblo officially incorporates and establishes its downtown core." },
      { year: "1921", title: "The Great Flood", text: "A massive flood devastates downtown, prompting major civil engineering changes to reroute the Arkansas River." },
      { year: "2000", title: "Riverwalk Opening", text: "The Historic Arkansas Riverwalk of Pueblo opens to the public, reclaiming the historic river path." }
    ],
    notableResidents: ["Damon Runyon (Writer)", "David Packard (HP Co-founder)"],
    landmarks: ["Historic Arkansas Riverwalk", "El Pueblo History Museum", "Memorial Hall"],
    popularBusinessIds: ["shamrock_brew", "riverwalk_gondola", "solar_roast_downtown"],
    highlights: ["Sleek craft breweries", "River cruises", "Art deco architecture", "Year-round festivals"]
  },
  {
    id: "bessemer",
    name: "Bessemer",
    type: "heritage",
    overview: "The historic cradle of Colorado's steel industry, rich in diverse cultural heritages and industrial pride.",
    history: "Founded as a separate company town by the Colorado Fuel and Iron Company (CF&I) in the 1880s, it housed workers from all over the world who shaped Pueblo's culture.",
    timeline: [
      { year: "1882", title: "Minnequa Works Built", text: "Colorado Coal and Iron Company builds the steel mills, creating thousands of jobs." },
      { year: "1886", title: "Incorporation as Bessemer", text: "Named after the pioneering Bessemer steel process." },
      { year: "1913", title: "Annexation", text: "Bessemer merges into the City of Pueblo." },
      { year: "1993", title: "Steel Works Museum", text: "The CF&I archives are opened as the Steelworks Museum of the American West." }
    ],
    notableResidents: ["William J. Palmer (General & Railway Founder)", "Thousands of European and Mexican steelworkers"],
    landmarks: ["Steelworks Museum of the West", "Minnequa Lake Park", "The Historic CF&I Admin Building"],
    popularBusinessIds: ["coors_tavern", "gus_place"],
    highlights: ["Traditional Sloppers", "Steel mill history", "Close-knit multigenerational families"]
  },
  {
    id: "pueblo_west",
    name: "Pueblo West",
    type: "modern",
    overview: "A spacious, master-planned community to the west of the city limits, boasting scenic views of the Front Range.",
    history: "Pre-planned in 1969 by McCulloch Properties, Pueblo West has grown rapidly as a residential suburb near Lake Pueblo.",
    timeline: [
      { year: "1969", title: "Inception", text: "McCulloch Properties begins selling lots in the massive master-planned community." },
      { year: "1990", title: "Rapid Growth", text: "The community doubles in population as commuters seek mountain views." },
      { year: "2020", title: "Metro Status", text: "Pueblo West surpasses 33,000 residents, establishing its own robust commercial corridor." }
    ],
    notableResidents: ["Robert McCulloch (Founder)"],
    landmarks: ["Desert Hawk Golf Course", "Lake Pueblo State Park Entrance", "Civic Center Park"],
    popularBusinessIds: ["pueblo_west_diner", "sunset_coffee_pw"],
    highlights: ["Lake recreation", "Golf courses", "Scenic mountain views", "Large acre lots"]
  },
  {
    id: "mesa",
    name: "Mesa Area",
    type: "heritage",
    overview: "Cultivated flatlands of Pueblo County, famous for farming and the world-renowned Pueblo Chile.",
    history: "Settled by Italian and Slavic immigrant farmers in the late 19th century, the Mesa developed a highly productive irrigation system feeding rich volcanic soil.",
    timeline: [
      { year: "1890", title: "Farming Boom", text: "Immigrants build canal systems to tap the Arkansas River, planting the first Mira Sol chiles." },
      { year: "1994", title: "First Chile & Frijoles Festival", text: "The first annual festival is organized, cementing the crop's statewide popularity." }
    ],
    notableResidents: ["Pete Giadone (First grower of the original Giadone chile strain)"],
    landmarks: ["Farms on Lane 36", "Milberger Farms", "The Pumpkin Patch"],
    popularBusinessIds: ["milberg_farms", "chile_king_shack"],
    highlights: ["Mira Sol chiles", "Farm-to-table farm stands", "Autumn harvest tours"]
  },
  {
    id: "union_district",
    name: "Union Avenue District",
    type: "heritage",
    overview: "A Victorian-era shopping district featuring carefully preserved 1880s brick structures.",
    history: "Pueblo's primary trade hub during the late 1800s railway boom. It represents the architectural spirit of early Colorado merchants.",
    timeline: [
      { year: "1880", title: "Rail Station Trade", text: "The growth of the nearby Union Depot turns Union Ave into a bustling merchant street." },
      { year: "1982", title: "National Register", text: "Listed as a National Historic District, preserving its magnificent facades." }
    ],
    notableResidents: ["Jack Dempsey (Fought early matches nearby)"],
    landmarks: ["Union Depot Train Station", "Vail Hotel Building", "Union Avenue Bridge"],
    popularBusinessIds: ["pantry_cafe", "union_ave_antiques"],
    highlights: ["Antique shops", "Elegant brick facades", "Fine dining patio spots"]
  },
  {
    id: "belmont",
    name: "Belmont",
    type: "modern",
    overview: "A classic mid-century residential neighborhood in northeast Pueblo, home to CSU Pueblo.",
    history: "Developed in the 1950s as Pueblo expanded outward to support post-war suburban growth and higher education.",
    timeline: [
      { year: "1954", title: "Development Begins", text: "The Belmont subdivision is approved, bringing ranch-style homes to northeast Pueblo." },
      { year: "1965", title: "CSU Pueblo Founded", text: "Southern Colorado State College (now CSU Pueblo) moves to its expansive Belmont campus." }
    ],
    notableResidents: ["Hasan El-Deiry (Scholar)"],
    landmarks: ["CSU Pueblo ThunderBowl Stadium", "Belmont Plaza", "University Park"],
    popularBusinessIds: ["university_grill", "campus_brew"],
    highlights: ["Student life", "CSU Pueblo Athletics", "Spacious family parks"]
  },
  {
    id: "mesa_junction",
    name: "Mesa Junction",
    type: "heritage",
    overview: "A charming historic hill neighborhood overlook connecting Downtown to the South Side.",
    history: "Originally a cable car junction at the brow of the hill. Known for its independent spirit, bookstores, and local diners.",
    timeline: [
      { year: "1890", title: "Streetcar Terminus", text: "Pueblo's electric trolley line branches at the Junction, creating a vital commercial node." },
      { year: "1975", title: "Artisanal Revival", text: "Drawn by cheap rents, indie booksellers and bakers establish a creative community." }
    ],
    notableResidents: ["George L. McCarthy (Inventor)"],
    landmarks: ["Rawlings Public Library", "Orman Mansion", "The Historic Junction Trolley Stop"],
    popularBusinessIds: ["hopscotch_books", "junction_bakery"],
    highlights: ["Independent bookstores", "Slopper showdowns", "Trolley line histories"]
  },
  {
    id: "state_fair",
    name: "State Fair Area",
    type: "heritage",
    overview: "Home of the annual Colorado State Fair, boasting rich neighborhood blocks and deep cultural connections.",
    history: "The state fair has been hosted on these central Pueblo grounds since 1872, acting as a gathering spot for all of Colorado.",
    timeline: [
      { year: "1872", title: "First Colorado State Fair", text: "Four years before Colorado statehood, Pueblo hosts the territorial fair." },
      { year: "1938", title: "WPA Craftsmanship", text: "The Palace of Agriculture is built using native stone under the Works Progress Administration." }
    ],
    notableResidents: ["Alva Adams (Three-time Colorado Governor)"],
    landmarks: ["Palace of Agriculture", "Colorado State Fairgrounds Stadium", "Budweiser Rodeo Arena"],
    popularBusinessIds: ["fair_mexican_eats", "state_fair_barber"],
    highlights: ["State Fair fun", "WPA stonework buildings", "Rodeos and car shows"]
  }
];

export const INITIAL_BUSINESSES: BusinessItem[] = [
  {
    id: "coors_tavern",
    name: "The Famous Coors Tavern",
    tier: "Premium",
    category: "Mexican",
    description: "The official home of the legendary Pueblo Slopper! Smothered in the finest green chile since 1934. Family-owned, cold drafts, and historic Pueblo tavern vibe.",
    rating: 4.8,
    address: "515 W 4th St, Pueblo, CO 81003",
    phone: "(719) 542-9907",
    hours: "11:00 AM - 10:00 PM (Daily)",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=400",
    neighborhood: "bessemer",
    lat: 38.2544,
    lng: -104.6158,
    featured: true,
    menu: [
      { name: "Original Pueblo Slopper", price: "$11.50", description: "Hamburger patty open-faced on toasted buns, completely buried under our award-winning thick Pueblo spicy green chile and raw chopped white onions." },
      { name: "Double Slopper", price: "$14.25", description: "Two flame-kissed premium beef patties open-faced, double smothered in home-style green chile, topped with cheddar cheese." },
      { name: "Cold Pint Coors Banquet", price: "$3.50", description: "Ice cold mountain draft served in a traditional mug." }
    ],
    coupons: [
      { id: "coors_slopper_deal", code: "SLOPPERLOVE", title: "10% Off Any Slopper", description: "Present this coupon to your server to claim 10% off our world-famous original Pueblo Slopper.", expiry: "2026-09-30", isPremiumOnly: false }
    ]
  },
  {
    id: "shamrock_brew",
    name: "Shamrock Brewing Co.",
    tier: "Premium",
    category: "Burgers",
    description: "Voted Pueblo's top microbrewery and Irish pub. Handcrafted local ales, premium burgers, and authentic Irish pub fare in historic downtown.",
    rating: 4.6,
    address: "108 W 3rd St, Pueblo, CO 81003",
    phone: "(719) 542-9977",
    hours: "11:00 AM - 11:00 PM (Mon-Sat), 11:00 AM - 8:00 PM (Sun)",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=400",
    neighborhood: "downtown",
    lat: 38.2708,
    lng: -104.6095,
    featured: true,
    menu: [
      { name: "Steelworks Stout Burger", price: "$13.95", description: "Smoked bacon, pub-made stout reduction sauce, sharp cheddar, on a pretzel bun." },
      { name: "Fish and Chips", price: "$15.50", description: "Alaskan cod hand-battered with our signature Pueblo Golden Ale, crispy chips, house tartar." },
      { name: "Irish Red Ale Pint", price: "$5.75", description: "Malty, smooth, copper-colored ale brewed right in the building." }
    ],
    coupons: [
      { id: "shamrock_pint", code: "BREWBEER", title: "Free Pint with any Burger", description: "Buy any premium signature burger and receive a free pilot beer pint on us. Premium tier exclusive.", expiry: "2026-12-31", isPremiumOnly: true }
    ]
  },
  {
    id: "solar_roast_downtown",
    name: "Solar Roast Coffee",
    tier: "Premium",
    category: "Coffee",
    description: "The world's only solar-roasted coffee! Our beans are roasted using focused solar energy for a uniquely smooth, non-bitter cup.",
    rating: 4.7,
    address: "226 N Main St, Pueblo, CO 81003",
    phone: "(719) 544-3006",
    hours: "6:00 AM - 6:00 PM (Daily)",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400",
    neighborhood: "downtown",
    lat: 38.2702,
    lng: -104.6088,
    featured: false,
    menu: [
      { name: "Solar Flat White", price: "$4.50", description: "Rich solar-roasted espresso with microfoam." },
      { name: "Pueblo Chile Mocha", price: "$5.25", description: "Espresso, steamed milk, rich dark cocoa, and a hint of local spicy Pueblo red chile powder." },
      { name: "Mesa Breakfast Burrito", price: "$6.50", description: "Local eggs, potatoes, chorizo, wrapped and smothered with mild green chile." }
    ],
    coupons: [
      { id: "solar_discount", code: "SOLARSUN", title: "$1 Off Any Chile Specialty", description: "$1 off any specialty beverage featuring our Pueblo Chile Mocha or hot chile options.", expiry: "2026-08-15", isPremiumOnly: false }
    ]
  },
  {
    id: "milberg_farms",
    name: "Milberger Farms",
    tier: "Premium",
    category: "BBQ",
    description: "Famous farm store, bakery, and deli grill located on the fertile Pueblo Mesa. Come for the fresh produce, stay for the smokehouse BBQ and fresh-baked chile bread!",
    rating: 4.9,
    address: "28570 US-50, Pueblo, CO 81006",
    phone: "(719) 948-3305",
    hours: "8:00 AM - 6:00 PM (Daily)",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
    neighborhood: "mesa",
    lat: 38.2541,
    lng: -104.4985,
    featured: true,
    menu: [
      { name: "Chile Bread Pork BBQ Sandwich", price: "$12.95", description: "House smoked pulled pork topped with mild Pueblo roasted chile, served on fresh-baked chile cheese bread." },
      { name: "Pueblo Green Chili Bowl", price: "$7.50", description: "Thick, pork-loaded garden green chili served with a warm fresh tortilla." },
      { name: "The Harvest Slopper", price: "$12.00", description: "Farm fresh beef smothered in our own field-harvested dynamic autumn green chili." }
    ],
    coupons: [
      { id: "milberger_pumpkin", code: "MESAFARM", title: "Free Roasted Chile Bag with $20 Deli Order", description: "Get a free 1-quart bag of freshly roasted, mild, medium, or hot Pueblo chiles when you spend $20 or more in our deli restaurant.", expiry: "2026-10-31", isPremiumOnly: false }
    ]
  },
  {
    id: "tonys_pizza",
    name: "Tony's Alley Pizza",
    tier: "Free",
    category: "Pizza",
    description: "Generous hand-tossed thick crust pies loaded with spicy Italian sausage and local green chile. A South Side classic parlor.",
    rating: 4.4,
    address: "910 South Canyon, Pueblo, CO 81004",
    phone: "(719) 564-9844",
    hours: "4:00 PM - 10:00 PM (Wed-Sun)",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
    neighborhood: "south_side",
    lat: 38.2435,
    lng: -104.6221,
    menu: [
      { name: "Pueblo Pride Chile Pie", price: "$18.50", description: "Loaded with our signature sausage, pepperoni, and a double layer of diced hot local Pueblo chiles." },
      { name: "Classic Cheese Slice", price: "$3.50", description: "Gigantic slice of our high-pile mozzarella cheese pizza." }
    ],
    coupons: []
  },
  {
    id: "pueblo_west_diner",
    name: "Pueblo West Diner",
    tier: "Free",
    category: "Breakfast",
    description: "Classic American breakfast diner serving up massive plates, bottomless coffee, and Colorado specialties out west.",
    rating: 4.2,
    address: "740 E Industrial Blvd, Pueblo West, CO 81007",
    phone: "(719) 547-8902",
    hours: "6:00 AM - 2:00 PM (Daily)",
    image: "https://images.unsplash.com/photo-1552056124-222d593dbec5?auto=format&fit=crop&q=80&w=400",
    neighborhood: "pueblo_west",
    lat: 38.3188,
    lng: -104.7212,
    menu: [
      { name: "The Foothills Scramble", price: "$10.75", description: "Three eggs scrambled with ham, onions, and raw mushrooms, covered in green chili." }
    ],
    coupons: []
  },
  {
    id: "gantry_bbq_west_side",
    name: "Gantry Smokehouse",
    tier: "Premium",
    category: "BBQ",
    description: "Hardwood smoked brisket, glazed ribs, and unique smoky bean sides styled under West Side heritage.",
    rating: 4.5,
    address: "1401 W 17th St, Pueblo, CO 81003",
    phone: "(719) 545-0988",
    hours: "11:00 AM - 9:00 PM (Tues-Sat)",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    neighborhood: "west_side",
    lat: 38.2831,
    lng: -104.6305,
    menu: [
      { name: "Pitmaster Brisket Platter", price: "$17.95", description: "Half-pound beef brisket, slow hickory-smoked, potato salad, sweet cornbread slice." }
    ],
    coupons: [
      { id: "gantry_combo", code: "RIBMASTER", title: "$3 Off Rib Rack", description: "$3 off any full-slab rib rack reservation.", expiry: "2026-07-20", isPremiumOnly: true }
    ]
  },
  {
    id: "dragon_gate",
    name: "Dragon Gate Chinese Buffet",
    tier: "Free",
    category: "Chinese",
    description: "Wok-fried classics, beef broccoli, orange chicken, and delicious house noodles near Pueblo Mall.",
    rating: 4.1,
    address: "3212 N Elizabeth St, Pueblo, CO 81008",
    phone: "(719) 544-8888",
    hours: "11:00 AM - 9:30 PM (Daily)",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400",
    neighborhood: "north_side",
    lat: 38.3032,
    lng: -104.6145,
    menu: [
      { name: "Pueblo Fire Wok Chicken", price: "$11.95", description: "Spicy orange chicken wok-tossed with local Colorado chile flakes." }
    ],
    coupons: []
  }
];

export const INITIAL_EVENTS: EventItem[] = [];
export const INITIAL_JOBS: JobItem[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [];

export const lostFoundDataReconciler = (item: LostFoundItem): string => {
  return "Lost Pet";
};

export const INITIAL_ALERTS: SafetyAlert[] = [];
export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];
export const INITIAL_POSTS: ForumPost[] = [];


