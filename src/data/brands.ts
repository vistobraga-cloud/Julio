import { z } from 'zod';
import { faqSchema, seoSchema, slugSchema } from './services';

/**
 * Brand pages — the highest commercial intent on the site. Someone searching
 * "Peloton assembly near me" has already bought the thing and needs a person
 * this week.
 *
 * TRADEMARK POSITION. Every page here uses a third party's registered mark in
 * its title, heading and URL. That is lawful nominative fair use, but only
 * while two conditions hold, and both are enforced rather than remembered:
 *
 *   1. No brand logo, anywhere — not in an image, a favicon, an OG card or an
 *      SVG. Text only. A logo implies endorsement. scripts/seo-audit.mjs fails
 *      the build if any asset filename contains a trademark token, which is
 *      why brand pages reuse their parent service's generic photograph.
 *
 *   2. Every brand page carries an independence statement naming the marks it
 *      uses. The audit fails the build on a /brands/ page that lacks it.
 *
 * Language: "independent", "I assemble", "experienced with". Never "official",
 * "authorized", "certified installer" or "partner" — the audit rejects those
 * on brand pages too.
 *
 * Honesty: write the competence that actually exists. The assembly mechanism
 * is shared within a category, so experience genuinely transfers — but no page
 * claims a brand is routine work if it is not, and no model name is invented.
 */

export const brandCategories = {
  furniture: {
    label: 'Furniture retailers',
    blurb:
      'Flat-pack and boxed furniture from the retailers that actually deliver in southeastern New England.',
  },
  fitness: {
    label: 'Fitness equipment',
    blurb: 'Bikes, treadmills, rowers and racks — heavy, awkward and unforgiving of a bad build.',
  },
  outdoor: {
    label: 'Outdoor, grills and office',
    blurb: 'Playsets, sheds, grills and desks, built level and anchored where anchoring matters.',
  },
} as const;

export type BrandCategory = keyof typeof brandCategories;

const modelLineSchema = z.object({
  name: z.string().min(2),
  note: z.string().min(40),
});

const timeRangeSchema = z.object({
  item: z.string().min(3),
  /** Always a range. An exact figure is a promise nobody can keep. */
  range: z.string().regex(/–|-/, 'give a range, not a single figure'),
});

const brandSchema = z.object({
  slug: slugSchema,
  /** Display name for headings and prose. */
  name: z.string().min(2),
  category: z.enum(['furniture', 'fitness', 'outdoor']),
  order: z.number().int().nonnegative(),
  published: z.boolean(),

  /**
   * The third-party marks this page names, exactly as they should appear in
   * the independence statement. The audit also derives its forbidden-asset
   * tokens from this list.
   */
  trademarks: z.array(z.string().min(2)).min(1),

  seo: seoSchema,
  h1: z.string().min(10),
  intro: z.array(z.string().min(80)).min(2),

  /** Real product lines only. Never invent a model name. */
  modelLines: z.array(modelLineSchema).min(3),

  /** What is genuinely different about assembling THIS brand. */
  assemblyNotes: z.array(z.string().min(80)).min(3),

  timeRanges: z.array(timeRangeSchema).min(3),
  whatToHaveReady: z.array(z.string().min(30)).min(3),

  faq: z.array(faqSchema).min(3).max(4),

  /** Closing block, written per brand so no two pages share their last words. */
  cta: z.object({ heading: z.string().min(10), body: z.string().min(60) }),

  parentServiceSlug: slugSchema,
  /** Sibling brands. Validated as reciprocal in data/index.ts. */
  relatedBrandSlugs: z.array(slugSchema),
  /** Phase 3 fills these. Validated against problems.ts once it exists. */
  relatedProblemSlugs: z.array(slugSchema),

  whatsappMessage: z.string().min(20),
});

export type Brand = z.infer<typeof brandSchema>;

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const raw: unknown[] = [
  {
    slug: 'ikea-furniture-assembly',
    name: 'IKEA',
    category: 'furniture',
    order: 1,
    published: true,
    trademarks: ['IKEA'],
    seo: {
      title: 'IKEA Furniture Assembly in MA, RI & CT | Aplus',
      description:
        'PAX, MALM, BILLY, KALLAX and HEMNES built and anchored properly. Independent IKEA assembly across Massachusetts, Rhode Island and Connecticut.',
      primaryKeyword: 'ikea furniture assembly service',
    },
    h1: 'IKEA Furniture Assembly in MA, RI and CT',
    intro: [
      'IKEA furniture is engineered to survive a shipping container, not to be pleasant to build. The instructions carry no words at all, the fasteners are a system rather than a set of screws, and a large share of the panels are handed — identical at a glance, correct in one orientation only. The step that costs people their afternoon is almost never step 3. It is step 40, when a panel that went in backwards has to come out and take four cam locks with it.',
      'The fastener system is the thing to understand. A cam lock is a metal disc that rotates to grip a bolt, and it grips into particleboard, which is soft. Overtighten it and the disc spins free in a hole that no longer holds anything. Undertighten it and the carcass never squares up. There is a correct feel and it is learned rather than described, which is most of what separates a two-hour PAX from a six-hour one.',
      'I have built the common IKEA lines many times over. That means I know which panels are commonly mislabeled, which units need their back panel on before they will sit square, and which pieces must be assembled flat on the floor and then raised — which matters enormously in a room with a low ceiling.',
    ],
    modelLines: [
      {
        name: 'PAX',
        note: 'The wardrobe system, and the biggest job in the range. Frames are built flat and tilted upright, so ceiling clearance decides whether the tall frame is even possible. Sliding doors take considerably longer to align than hinged.',
      },
      {
        name: 'MALM',
        note: 'Beds and dressers. The dressers are tall, light when empty and heavy when loaded, which is exactly the profile that needs the supplied wall restraint fitted rather than left in the bag.',
      },
      {
        name: 'BILLY',
        note: 'The bookcase. Deceptively simple, with one detail that decides everything: the thin hardboard back is what squares the unit, so it goes on while the carcass is still adjustable, not after.',
      },
      {
        name: 'KALLAX',
        note: 'Cube shelving, used as a room divider as often as against a wall. Free-standing use puts load on joints from both sides, so the cross members need to be fully seated before anything goes on the shelves.',
      },
      {
        name: 'HEMNES',
        note: 'Solid pine rather than particleboard, so it takes real screws and forgives more — but it is much heavier, and the beds and dressers are genuinely awkward for one person to handle alone.',
      },
      {
        name: 'BESTÅ',
        note: 'Media and storage units, frequently wall-hung. Hung on the wall it stops being furniture and becomes a fixing job, and the wall type decides the anchor rather than the box contents.',
      },
    ],
    assemblyNotes: [
      'Cam lock and dowel construction is IKEA-specific in feel. The dowels set the alignment and the cam locks pull the joint closed, so both have to seat before anything is tightened. Tighten in the wrong order and the carcass locks up a fraction of an inch out of square, which shows as a door that will not sit flush.',
      'Handed panels are the single most common mistake. Two side panels look identical but their pre-drilled holes are mirrored. Fitted the wrong way round, everything continues to work until the back panel refuses to line up, at which point the fix is a full disassembly.',
      'Tall units come with a wall restraint in the box and the instructions require it. I fit it, and I pick the anchor for your actual wall rather than using the generic plug supplied — plaster and lath, common in older homes here, needs a different fixing from modern drywall.',
      'PAX in particular is built flat on the floor and raised into position. The taller frames, around 93 inches, need more clearance to swing up than most ceilings allow, and finding that out with the frame already assembled is a bad afternoon. Send me your ceiling height and I will tell you before you order.',
    ],
    timeRanges: [
      { item: 'BILLY bookcase', range: '30–45 minutes' },
      { item: 'MALM dresser or bed frame', range: '1–2 hours' },
      { item: 'KALLAX unit', range: '45 minutes – 1 hour' },
      { item: 'PAX wardrobe', range: '2–4 hours depending on width and door type' },
      { item: 'A full bedroom of several pieces', range: 'half a day – a full day' },
    ],
    whatToHaveReady: [
      'The boxes in the room where the furniture is going, still sealed — they are packed in build order.',
      'Roughly six feet of clear floor, because most of these are built flat and then stood up.',
      'For PAX or any tall frame, the ceiling height, ideally sent to me before the visit.',
      'The wall decided if anything is being anchored or hung, so nothing has to be moved twice.',
    ],
    faq: [
      {
        q: 'Can you build a PAX wardrobe in a room with a low ceiling?',
        a: 'Often yes, but it depends on the frame height. The frame is assembled flat and tilted upright, and the diagonal of a tall frame is longer than the frame itself, so it needs more headroom than its finished height. Tell me your ceiling height and the frame size and I will tell you honestly whether it will go up, before you buy.',
      },
      {
        q: 'Do you fit the wall anchors that come in the box?',
        a: 'Yes, on anything tall, and I would push you to have it done. The restraint IKEA supplies works, but the plug in the bag is made for one kind of wall. A lot of housing around here is plaster and lath rather than drywall, so I carry fixings for both and pick the one your wall actually needs.',
      },
      {
        q: 'A cam lock or dowel is missing from my box. Can you still build it?',
        a: 'Usually I can build everything except the affected joint and come back to close it out. IKEA supplies missing fittings free, and I will give you the exact part number from the manual so you are not describing a small metal disc over the phone. Bring it home and the second visit is short.',
      },
      {
        q: 'I bought secondhand IKEA that has been taken apart. Will it go back together?',
        a: 'Often, with a caveat worth knowing. Cam lock holes in particleboard wear each time a piece is dismantled and rebuilt, and a joint that has been apart three or four times may no longer hold tight. I can usually work around a couple of loose fittings, and I will tell you straight if a panel is past saving.',
      },
    ],
    cta: {
      heading: 'Send me your IKEA list',
      body: 'Product names or a photo of the box labels is all I need to give you a real price and a real time. A whole room at once is usually cheaper per piece than booking them separately.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['wayfair-furniture-assembly', 'costco-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have IKEA furniture that needs assembling:',
  },

  {
    slug: 'peloton-assembly',
    name: 'Peloton',
    category: 'fitness',
    order: 2,
    published: true,
    trademarks: ['Peloton'],
    seo: {
      title: 'Peloton Assembly in MA, RI & CT | Aplus Assemblers',
      description:
        'Bike, Bike+ and Tread set up, leveled and tested in your home. Independent Peloton assembly across Massachusetts, Rhode Island and Connecticut.',
      primaryKeyword: 'peloton assembly service',
    },
    h1: 'Peloton Bike, Bike+ and Tread Assembly',
    intro: [
      'A Peloton is not a difficult build. It is a heavy one, with two or three details that are unforgiving, and it lands in the category of jobs where the assembly takes an hour and moving the thing takes longer than that. The Bike is roughly 135 pounds in a single carton. The Tread is closer to 290 and arrives by freight, which means the driver leaves it at the curb and that is the end of their involvement.',
      'The detail that catches most people is the left pedal. It is reverse-threaded — it tightens counter-clockwise — and cross-threading it does not ruin the pedal, it ruins the crank arm, which is a considerably more expensive part. The second is the console cable, which runs up through the handlebar post and has to be seated before the shroud closes. Trap it and the screen works fine until the day it does not.',
      'Most of my Peloton work is not first delivery. It is bikes bought secondhand, bikes that came with a house move, and bikes going up or down a flight of stairs to a different room. Those are the jobs where having someone who has done it before is worth the money.',
    ],
    modelLines: [
      {
        name: 'Bike',
        note: 'The original. Straightforward once the frame is upright: seat post, handlebar post, pedals, console. The whole job is threading the pedals correctly and leveling the stabilizers so it does not rock under a hard standing effort.',
      },
      {
        name: 'Bike+',
        note: 'Heavier, with a rotating screen on a stronger bracket. The rotation mechanism has to be checked through its full travel before the covers go on, because a cable routed slightly short binds at the extreme of the swing.',
      },
      {
        name: 'Tread',
        note: 'A different job entirely. Freight delivery to the curb, substantial weight, and a belt that needs tracking and tensioning after assembly rather than being assumed correct out of the box.',
      },
      {
        name: 'Relocations',
        note: 'Moving an assembled unit between rooms, floors or homes. Usually partial disassembly rather than carrying it whole, which is safer for the frame, the screen and the staircase.',
      },
    ],
    assemblyNotes: [
      'The left pedal is reverse-threaded. This is standard across bikes and it is still the most common way a home build goes wrong, because it feels like it is tightening while it is stripping the crank. Pedals go in by hand first, several turns, before any tool touches them.',
      'The console cable runs through the handlebar post and connects behind the screen. It gets seated and dressed before the shroud is closed, so nothing is pinched. A pinched cable produces an intermittent screen fault weeks later that looks like a screen problem and is not.',
      'Leveling matters more than it sounds. The stabilizers are adjusted against the actual floor, not the frame, and basement slabs and older wood floors are rarely flat. A bike that rocks during a standing climb feels wrong and loosens its own hardware over time.',
      'Placement is decided before assembly, not after. At 135 pounds and up, this is not a machine you slide across a room to try a different corner, and the outlet has to reach — the touchscreen needs power even on the original Bike.',
    ],
    timeRanges: [
      { item: 'Bike or Bike+ assembly', range: '45 minutes – 1.5 hours' },
      { item: 'Tread assembly', range: '1.5 – 2.5 hours' },
      { item: 'Carrying a boxed unit up one flight', range: 'add 30 – 60 minutes' },
      { item: 'Relocation with partial disassembly', range: '1.5 – 3 hours' },
    ],
    whatToHaveReady: [
      'The final position decided, with an outlet in reach — the screen needs power on every model.',
      'The mat down first if you are using one, since it is far easier before the machine is standing on it.',
      'Your wifi password to hand, so setup can be finished rather than left at a login screen.',
      'For a Tread, a photo of the staircase or doorway before booking so I can confirm it will physically go.',
    ],
    faq: [
      {
        q: 'Peloton delivers and sets up. Why would I book you?',
        a: 'For a new order from Peloton, usually you would not, and I will say so. Where I get called is everything outside that: a bike bought secondhand or through a marketplace, one that arrived with a house move, one that needs to go up to a spare room or down to a basement, or one being taken apart for a move and rebuilt at the other end.',
      },
      {
        q: 'Can you move my Bike to another room or another house?',
        a: 'Yes, and it is one of the more common requests. For anything involving stairs I take the seat post, handlebars and screen off first — a partly stripped frame is safer to carry and much safer for the screen than maneuvering the whole machine around a turn in a staircase.',
      },
      {
        q: 'Does the Bike need to be near an outlet?',
        a: 'Yes. The frame itself is not powered, but the touchscreen is, on the Bike, the Bike+ and the Tread. Worth deciding placement around that before assembly, because moving the machine afterwards to reach a socket is exactly the job everyone wants to avoid.',
      },
      {
        q: 'My Tread is being delivered on a pallet. Can you take it from there?',
        a: 'Yes, and that is the sensible way to do it. Freight carriers deliver to the curb and no further, which catches a lot of people out. Tell me when the delivery window is and I can uncrate outside, bring the components in separately and build indoors, which beats trying to move an assembled machine through a doorway.',
      },
    ],
    cta: {
      heading: 'Getting a Peloton into the right room',
      body: 'Tell me the model, which floor it is going to and whether there are stairs. Those three things are the whole quote, and a photo of the staircase settles it in one message.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['nordictrack-assembly', 'tonal-installation'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I need a Peloton set up. Model and which floor:',
  },

  {
    slug: 'wayfair-furniture-assembly',
    name: 'Wayfair',
    category: 'furniture',
    order: 3,
    published: true,
    trademarks: ['Wayfair'],
    seo: {
      title: 'Wayfair Furniture Assembly in MA, RI & CT | Aplus',
      description:
        'Beds, sectionals, patio sets and storage from Wayfair, Birch Lane and AllModern, built where they live. Independent service in MA, RI and CT.',
      primaryKeyword: 'wayfair furniture assembly',
    },
    h1: 'Wayfair Furniture Assembly in MA, RI and CT',
    intro: [
      'Wayfair is a retailer rather than a factory, and that single fact explains almost everything about assembling its furniture. A bed sold under one name may be made by a different manufacturer this year than last. Two items in the same order can arrive with entirely different hardware systems, one with a clear exploded diagram and one with a photocopied sheet showing four steps for a forty-part piece. There is no house standard to learn, so the skill is reading an unfamiliar design quickly and correctly.',
      'The construction is generally bolt-and-barrel-nut rather than the cam locks of flat-pack from Europe: hex bolts through a frame into a captive nut. It is sturdier when it goes together well, and less forgiving when a bolt is a thread or two short or an insert sits slightly out of line. Getting every bolt started before any of them is tightened is what turns a fight into a straightforward build.',
      'The other thing that defines a Wayfair job is boxes. A sectional routinely ships as three cartons on three different days, and a patio set can be five. Nothing wastes a visit faster than discovering box two of three is still in transit, which is why the first question I ask is whether everything has landed.',
    ],
    modelLines: [
      {
        name: 'Upholstered beds and headboards',
        note: 'The most common single booking. Rails bolt into the headboard through captive inserts, and where an insert sits fractionally off the bolt has to be started by hand and coaxed rather than driven.',
      },
      {
        name: 'Sectionals and modular sofas',
        note: 'Usually shipped in several cartons and joined with metal brackets or interlocking clips. Assembled in the room they live in, because a joined sectional does not go back through a standard doorway.',
      },
      {
        name: 'Patio and outdoor sets',
        note: 'Dining sets, sofas, gazebos and umbrella bases. Outdoor hardware is coated or stainless and strips easily, so it is torqued by hand rather than driven home with an impact driver.',
      },
      {
        name: 'Storage, wardrobes and shelving',
        note: 'Tall units that need squaring before load and anchoring after. Ready-to-assemble storage is where variation between suppliers shows most, so panel quality is worth a look before the build starts.',
      },
      {
        name: 'Birch Lane, AllModern and Joss & Main',
        note: 'House brands sold through the same retailer, ordered the same way and built the same way. If it arrived in a Wayfair box, it is the same job.',
      },
    ],
    assemblyNotes: [
      'Every bolt gets started before any bolt is finished. Bolt-and-insert frames pull themselves into alignment as they close, so tightening one corner fully first locks the frame out of square and leaves the last bolt unable to find its thread at all.',
      'Instruction quality is genuinely inconsistent because the supplier changes. Some items arrive with a clear numbered diagram and some with a single sheet, so I check the parts against the listing before starting rather than trusting the sheet to be complete.',
      'Multi-carton items get counted first. A three-box sectional with two boxes present is not a job that can be finished, and it is far better to establish that in a message beforehand than with me standing in your living room.',
      'Upholstered pieces get built on a covering. The fabric is the part that cannot be repaired if it picks up a mark from a floor, and light upholstery on an unprotected hardwood floor is a genuine risk during a build with metal hardware in play.',
    ],
    timeRanges: [
      { item: 'Nightstand or small accent piece', range: '30–45 minutes' },
      { item: 'Upholstered bed frame', range: '1–2 hours' },
      { item: 'Sectional sofa', range: '1–2 hours' },
      { item: 'Patio dining set with chairs', range: '1.5–3 hours' },
      { item: 'Tall wardrobe or storage unit', range: '2–3 hours' },
    ],
    whatToHaveReady: [
      'Confirmation that every carton has actually arrived, which is the single biggest cause of a wasted visit.',
      'The boxes in the destination room, because a joined sectional will not fit back through the doorway.',
      'The packing slip or order page, so parts can be checked against what was supposed to ship.',
      'A decision on where it goes, especially for anything tall enough to want anchoring to the wall.',
    ],
    faq: [
      {
        q: 'Two of my three boxes have arrived. Should I still book?',
        a: 'Book, but tell me, and we will schedule for after the last one lands. Multi-carton items are the norm here and split deliveries are routine. I would rather move your slot by a few days than turn up, get halfway and have to come back — and you would rather that too.',
      },
      {
        q: 'Wayfair offers assembly at checkout. How is this different?',
        a: 'It is an independent service, booked directly with me, and you deal with the person doing the work rather than a dispatch queue. In practice the difference customers care about is scheduling: I confirm a window with you myself, and I can take on the items that were bought without assembly at the time.',
      },
      {
        q: 'My item is missing hardware. What happens?',
        a: 'It happens often enough that I carry a wide range of common bolts, barrel nuts and washers, and a good proportion of the time I can complete the build from what is in the van. Where a part is proprietary I identify exactly what is needed so you can request it, build everything else, and finish on a short return visit.',
      },
      {
        q: 'Do you assemble Birch Lane, AllModern and Joss & Main too?',
        a: 'Yes. Those are house brands of the same retailer, so they arrive through the same supply chain and use the same hardware conventions. If it came in a box from Wayfair, whatever name is on the listing, it is the same work.',
      },
    ],
    cta: {
      heading: 'Got everything out of the boxes yet?',
      body: 'Do not open them. Send me the item name from your order and confirm how many cartons arrived, and I will come back with a price and a window.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['ikea-furniture-assembly', 'ashley-furniture-assembly', 'pottery-barn-west-elm-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have Wayfair furniture to assemble:',
  },

  {
    slug: 'ashley-furniture-assembly',
    name: 'Ashley',
    category: 'furniture',
    order: 4,
    published: true,
    trademarks: ['Ashley'],
    seo: {
      title: 'Ashley Furniture Assembly in MA, RI & CT | Aplus',
      description:
        'Storage beds, upholstered headboards, dressers and sectionals built square and anchored. Independent Ashley assembly in Massachusetts, Rhode Island and CT.',
      primaryKeyword: 'ashley furniture assembly',
    },
    h1: 'Ashley Furniture Assembly in MA, RI and CT',
    intro: [
      'Ashley pieces reach people through several routes — company stores, independent dealers trading under the name, and online marketplaces — and what arrives at your door differs accordingly. Some items come fully built on a truck. Some come flat in cartons with a bolt bag taped inside. A good number arrive half and half: a dresser assembled, its mirror and the bed it matches still boxed.',
      'The construction across the ready-to-assemble side is bolt-through-bracket: steel rails engaging cast hooks or bolting through the headboard into captive inserts. It holds well and it is heavier than particleboard flat-pack, which changes the job from a puzzle into a lifting-and-alignment problem. On storage beds with drawers, the drawer boxes and their runners have to be squared to the frame rather than to each other, or the fronts sit proud on one side no matter how the slides are adjusted.',
      'Where I get called most is bedroom sets. Six or seven pieces, one delivery, and a room that has to be usable that night.',
    ],
    modelLines: [
      {
        name: 'Storage beds with drawers',
        note: 'The bulkiest single item in most orders. Rails, drawer boxes and runners all reference the frame, so the frame is squared and set on the floor first and nothing else is tightened until it is.',
      },
      {
        name: 'Upholstered headboards',
        note: 'Bolt into captive inserts through padded panels, where you cannot see the hole you are aiming at. Bolts get started by feel and by hand before any driver comes near them.',
      },
      {
        name: 'Dressers, chests and mirrors',
        note: 'Often delivered built, with the mirror separate. Mirror brackets bolt to the dresser back and the whole unit wants an anti-tip strap once it is loaded.',
      },
      {
        name: 'Sectionals and recliners',
        note: 'Sections clip or bracket together and power recliners have a transformer and a cable run that needs slack. Too little slack and the mechanism pulls the plug out at full extension.',
      },
      {
        name: 'Dining sets',
        note: 'Tables with extension leaves, benches and chairs. Chair hardware is snugged in sequence around the seat rather than one leg at a time, which is what stops a wobble appearing weeks later.',
      },
    ],
    assemblyNotes: [
      'Storage beds live or die on the frame being square before the drawers go in. Runners fitted to a frame that is out by a small amount will bind at one end of travel, and the usual instinct — adjusting the slides — makes it worse rather than better.',
      'Upholstered headboard bolts go in blind, through fabric, into inserts you cannot see. Each is started several turns by hand. Driving one in on a slight angle strips the insert, and an insert set into a padded panel is not a repair anyone wants to attempt.',
      'Power recliner cabling gets routed with slack at the hinge, checked through the full range before the sections are joined. A cable that is tight at full recline will unplug itself or chafe, and by then the sofa is assembled around it.',
      'Mixed deliveries get sorted before anything is opened. It is common for part of an Ashley order to arrive built and part boxed, and knowing which is which decides whether the visit is an hour or an afternoon.',
    ],
    timeRanges: [
      { item: 'Bed frame with storage drawers', range: '1.5–2.5 hours' },
      { item: 'Dresser with mirror', range: '45 minutes – 1.5 hours' },
      { item: 'Sectional with power recliners', range: '1.5–2.5 hours' },
      { item: 'Full bedroom set', range: 'half a day – a full day' },
      { item: 'Dining table with chairs', range: '1.5–3 hours' },
    ],
    whatToHaveReady: [
      'A note of which pieces arrived built and which are still boxed, since Ashley orders often split.',
      'The bed wall chosen, because a storage bed is not something to slide across a room afterwards.',
      'An outlet within reach if anything in the order reclines under power.',
      'The old bed or dresser moved out, or tell me and I will break it down on the same visit.',
    ],
    faq: [
      {
        q: 'My dresser came built but the bed came in boxes. Is that normal?',
        a: 'Yes, and it catches people out constantly. Ashley furniture reaches customers through company stores, independent dealers and marketplaces, and each handles assembly differently. Tell me what is boxed and what is not and I will quote the actual work rather than the whole order.',
      },
      {
        q: 'The drawers in my storage bed do not sit flush. Can that be fixed?',
        a: 'Usually, and it is rarely the drawers. It is almost always a frame that was tightened before it was squared, so the runners are pulling against each other. Loosening the frame, squaring it against the floor and retightening in the right order fixes most of these in under an hour.',
      },
      {
        q: 'Do you anchor the dressers?',
        a: 'Yes, on anything tall, and I would push for it in any room a child uses. A loaded chest is far heavier and far more top-weighted than it looks empty. I bring anchors for drywall and for plaster and lath, which is what a lot of older housing here actually has behind the paint.',
      },
      {
        q: 'Can you take the old bedroom set apart while you are here?',
        a: 'Yes, and doing both on one visit is cheaper than two. I will break the old pieces down so they fit through the door and into a truck or a dumpster. I do not haul them away, but getting them to that point is usually the part people dread.',
      },
    ],
    cta: {
      heading: 'One visit for the whole room',
      body: 'Send me the list of pieces and say which arrived built. Bedroom sets are quicker and cheaper done together than booked one at a time.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['wayfair-furniture-assembly', 'costco-furniture-assembly', 'pottery-barn-west-elm-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have Ashley furniture to put together:',
  },

  {
    slug: 'pottery-barn-west-elm-assembly',
    name: 'Pottery Barn and West Elm',
    category: 'furniture',
    order: 5,
    published: true,
    trademarks: ['Pottery Barn', 'West Elm'],
    seo: {
      title: 'Pottery Barn & West Elm Assembly | MA, RI & CT',
      description:
        'Solid-wood beds, media consoles and dining tables with threaded inserts, built without stripping them. Independent service in MA, RI and CT.',
      primaryKeyword: 'pottery barn and west elm assembly',
    },
    h1: 'Pottery Barn and West Elm Assembly',
    intro: [
      'These two sit at the heavier end of what arrives flat. Solid and veneered hardwood rather than particleboard, machined threaded inserts rather than cam locks, and hanger bolts running into end grain on a lot of the leg and rail joints. Built correctly it is furniture that outlasts the room it went into. Built carelessly, one over-torqued insert spins in its hole and the joint is permanently compromised — hardwood does not forgive that the way flat-pack does.',
      'The other characteristic is weight. A solid-wood media console or a dining table top is a genuine two-person lift, and pieces frequently arrive on a delivery tier that leaves them inside the door rather than in the room. Getting a tabletop through a turn in a hallway without marking either the finish or the wall is most of the job on those.',
      'The finishes are the other thing to respect. Oiled and matte lacquered surfaces mark from a metal buckle or a grain of grit under a panel, and unlike a painted surface there is no touching it up.',
    ],
    modelLines: [
      {
        name: 'Solid-wood bed frames',
        note: 'Rails bolt into inserts machined into the headboard posts. The hardware is good and the wood is hard, so bolts are run home by hand until the last part of a turn.',
      },
      {
        name: 'Media consoles and sideboards',
        note: 'Heavy carcasses with doors and drawers fitted after the box is standing and leveled. Doors adjusted to an even gap once the piece is in its final position, not before.',
      },
      {
        name: 'Dining tables and extension leaves',
        note: 'Legs into corner blocks or hanger bolts, then the top set and checked for rock on the actual floor. Extension mechanisms get run through their full travel before I leave.',
      },
      {
        name: 'Desks and bookcases',
        note: 'Tall units that want anchoring, and desks where the back panel is what squares the frame. Fitted while the carcass is still loose, then everything is drawn up together.',
      },
      {
        name: 'Upholstered seating',
        note: 'Legs, sectional joins and bed frames with fabric surrounds. Built on a covering, because a mark on a matte fabric or an oiled finish is not something that buffs out.',
      },
    ],
    assemblyNotes: [
      'Threaded inserts in hardwood have one failure mode and it is terminal. Over-torque and the insert spins in its seat, leaving a bolt that will never draw tight again. Every one is brought up by hand for the final part of the turn, with no driver anywhere near the last rotation.',
      'Hanger bolts into end grain hold far less than a machine screw into an insert, so leg joints get snugged rather than cranked and then checked again after the piece has taken its own weight for a few minutes.',
      'Nothing is dragged. Solid-wood pieces are lifted onto their feet in position, because dragging a loaded case across a floor levers the joints sideways and is how a brand-new sideboard ends up racked.',
      'Delivery is often to the door rather than the room. The route in — turns, banister height, door widths — decides whether a tabletop goes in whole or whether legs come off first, and that is worth settling before the delivery date rather than after.',
    ],
    timeRanges: [
      { item: 'Solid-wood bed frame', range: '1–2 hours' },
      { item: 'Media console or sideboard', range: '1–2 hours' },
      { item: 'Dining table with leaves', range: '1–2 hours' },
      { item: 'Bookcase or desk', range: '45 minutes – 1.5 hours' },
      { item: 'Carrying a heavy top up a flight', range: 'add 30 – 45 minutes' },
    ],
    whatToHaveReady: [
      'A clear route from the door to the room, with anything fragile moved off the path first.',
      'Floor protection down if the piece is landing on hardwood, or tell me and I will bring covering.',
      'The final position decided, since these are lifted into place rather than slid there.',
      'Any hardware bags kept together — they are frequently taped inside a separate carton.',
    ],
    faq: [
      {
        q: 'A bolt on my bed frame spins and will not tighten. Is it fixable?',
        a: 'Sometimes. If the threaded insert has spun in its seat, the repair is to bond the insert back into the timber and let it cure before loading — which works when the surrounding wood is sound. If the seat itself has broken up, the honest answer is that the part needs replacing, and I will tell you that rather than leaving you a joint that feels tight and is not.',
      },
      {
        q: 'My delivery is only to the front door. Can you take it from there?',
        a: 'Yes. Tell me the piece and send a photo of the hallway and staircase, and I will confirm before booking whether it goes in whole or needs the legs or top off first. That conversation costs nothing and saves the situation where a table is stuck on a landing.',
      },
      {
        q: 'Will you mark the finish?',
        a: 'Not if the piece is built on covering and lifted rather than dragged, which is how I work with these. Oiled and matte finishes mark from grit trapped under a panel and from metal hardware set down on them, so both stay off the surface for the whole build.',
      },
    ],
    cta: {
      heading: 'Heavy pieces, hard finishes',
      body: 'Send the item and a photo of the route in from your front door. That tells me whether it goes in whole, and it is the question that decides the whole job.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['wayfair-furniture-assembly', 'ashley-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have Pottery Barn or West Elm furniture arriving:',
  },

  {
    slug: 'costco-furniture-assembly',
    name: 'Costco',
    category: 'furniture',
    order: 6,
    published: true,
    trademarks: ['Costco'],
    seo: {
      title: 'Costco Furniture Assembly in MA, RI & CT | Aplus',
      description:
        'Sectionals, gazebos, garage shelving and desks from a supplier that changes yearly. Independent Costco assembly across MA, RI and CT.',
      primaryKeyword: 'costco furniture assembly',
    },
    h1: 'Costco Furniture and Equipment Assembly',
    intro: [
      'Costco buys, it does not manufacture, and that shapes every one of these jobs. The gazebo sold under a given name this season may come from an entirely different factory than last season, with different hardware, a different manual and a different tolerance on the pre-drilled holes. There is no house standard to learn. What transfers between items is the ability to read an unfamiliar design quickly, which is the actual skill on this kind of work.',
      'Warehouse-club packaging adds its own wrinkle. Items ship in the largest carton that will hold them, protection inside is minimal, and hardware often arrives loose in a bag rather than carded and numbered by step. Sorting and identifying fasteners before starting is not fussiness here — it is the difference between a clean build and a rebuild.',
      'The last thing to know is that a Costco order splits into two worlds. Small items travel by parcel carrier. Anything large moves by freight, which means a pallet at the curb and a driver who is not coming inside.',
    ],
    modelLines: [
      {
        name: 'Sectionals and sofas',
        note: 'Usually several cartons, joined by brackets or interlocking clips, and assembled in the destination room because a joined sectional will not pass back through a doorway.',
      },
      {
        name: 'Gazebos, pergolas and patio sets',
        note: 'The largest builds in the range and often the ones with the thinnest instructions. Frames go up loosely, get squared against the pad, then get torqued.',
      },
      {
        name: 'Garage and utility shelving',
        note: 'Steel racking that is quick to build and easy to build out of plumb. Uprights are set and the diagonal checked before the shelves are loaded, or the whole run leans over time.',
      },
      {
        name: 'Office chairs and desks',
        note: 'Fast individually and tedious in quantity. Gas lifts and casters are trivial; the time goes into desks with cable trays and frames that must square to the top.',
      },
      {
        name: 'Sheds and outdoor storage',
        note: 'Resin and steel structures where a flat, level base is a prerequisite rather than a preference. Doors that will not latch are almost always a base problem.',
      },
    ],
    assemblyNotes: [
      'The supplier behind a given item changes from year to year. I check the parts and hardware against the manual before anything is joined, because an assumption carried over from last season is worth nothing when the factory has changed underneath the same product name.',
      'Club packaging means hardware often arrives loose. Fasteners get laid out and identified first, since bolts of nearly identical length used in the wrong positions produce a build that feels finished and has one short bolt carrying a load it was not sized for.',
      'Freight items are dealt with at the curb. Uncrating outside and bringing components in separately is far easier than moving an assembled piece through a doorway, and it also puts the packaging in one place rather than through your hallway.',
      'Steel shelving and gazebo frames go up loose and get squared before final tightening. These are the two categories where tightening as you go locks a structure permanently out of true, and neither is easy to unpick once loaded.',
    ],
    timeRanges: [
      { item: 'Sectional sofa', range: '1–2 hours' },
      { item: 'Gazebo or pergola', range: '3–6 hours' },
      { item: 'Garage shelving run', range: '45 minutes – 2 hours' },
      { item: 'Office chair', range: '20–40 minutes' },
      { item: 'Outdoor storage shed', range: 'half a day – a full day' },
    ],
    whatToHaveReady: [
      'Confirmation of how many cartons arrived, since large items routinely ship split.',
      'For anything outdoor, a flat and level pad already prepared and ready to build on.',
      'The room decided for sectionals, because they are joined where they will stay.',
      'Any receipt or item page to hand, which helps identify a supplier that changed this year.',
    ],
    faq: [
      {
        q: 'Some Costco items arrive assembled. How do I know which?',
        a: 'You often cannot tell from the listing, which is the honest answer. It depends on the supplier that season and on how the item ships. Send me the item name and I will tell you what usually arrives built and what does not — and if it turns up assembled after all, I would rather you cancelled than paid me to look at it.',
      },
      {
        q: 'My gazebo is on a pallet in the driveway. Can you work from there?',
        a: 'Yes, and that is normally the right place to start. Freight delivery stops at the curb by design. I uncrate outside, sort the frame and the hardware, and build on the pad — which is much easier than trying to move a part-built structure across a yard afterwards.',
      },
      {
        q: 'The instructions do not match what is in my box. What now?',
        a: 'That is the retailer-versus-factory problem, and it happens. Where the manual has drifted from the product I work from the hardware and the joint design, which is usually enough to build it correctly. If a genuine part is missing rather than mislabeled, I identify exactly what to request and finish on a short return visit.',
      },
      {
        q: 'Can you do several items in one visit?',
        a: 'Yes, and it is much better value that way. A run of office chairs, a shelving bay and a desk together take far less time as one booking than as three, because the travel and the setup only happen once.',
      },
    ],
    cta: {
      heading: 'Pallet in the driveway?',
      body: 'Tell me the item and where it was left. Curbside freight is normal for the big things, and taking it from there is the usual way these jobs start.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['ikea-furniture-assembly', 'ashley-furniture-assembly', 'standing-desk-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Costco item that needs assembling:',
  },

  {
    slug: 'bobs-discount-furniture-assembly',
    name: "Bob's Discount Furniture",
    category: 'furniture',
    order: 7,
    published: true,
    trademarks: ["Bob's Discount Furniture"],
    seo: {
      title: "Bob's Discount Furniture Assembly | MA, RI & CT",
      description:
        "Sectionals split for tight stairways, beds rebuilt after a move, old sets broken down. Independent Bob's Discount assembly in MA, RI and CT.",
      primaryKeyword: 'bobs discount furniture assembly',
    },
    h1: "Bob's Discount Furniture: Assembly, Moves and Disassembly",
    intro: [
      "Let me be straight about this one. Bob's delivers and sets furniture up, and if you have paid for that on a new order, you do not need me for the assembly. Writing a page that pretends otherwise would waste your time and mine.",
      'What I actually get called for is everything that sits outside that delivery. A sectional that will not make the turn at the top of a triple-decker staircase and has to come apart and go back together upstairs. A bedroom set moving to a new apartment. A piece bought secondhand from someone two towns over, which arrives as a stack of panels and a carrier bag of bolts. The value tier of delivery that leaves everything in the entryway.',
      'That work is a different skill from opening a carton. Taking apart furniture that was built once and reassembling it so it is still tight afterwards depends on knowing which joints tolerate being undone and which are effectively single-use — and on getting the hardware back in the right holes, which is why everything comes off labeled.',
    ],
    modelLines: [
      {
        name: 'Sectionals and modular sofas',
        note: 'The most common reason I get called. Split at the factory joins rather than forced around a corner, carried in sections and rejoined in the room they are staying in.',
      },
      {
        name: 'Bedroom sets',
        note: 'Beds, dressers and mirrors dismantled for a move and rebuilt at the other end, with hardware bagged and labeled per piece so nothing is guessed at on reassembly.',
      },
      {
        name: 'Bob-O-Pedic and mattress bases',
        note: 'Adjustable and platform bases that need a frame squared and legs set level before any mattress goes on. Adjustable bases also need their cabling routed clear of the mechanism.',
      },
      {
        name: 'Dining sets and bar stools',
        note: 'Chair and stool joints resnugged after a move, which is the moment loosening usually shows. Done in sequence around the seat rather than a leg at a time.',
      },
      {
        name: 'Secondhand pieces',
        note: 'Bought through a marketplace and collected in parts. Rebuilt with the hardware you were given, and I will tell you honestly if a joint has been apart too many times to hold.',
      },
    ],
    assemblyNotes: [
      'Disassembly is planned before anything is undone. Photographs of each joint before it comes apart, hardware bagged and labeled to the piece it came from — that discipline is what makes reassembly an hour rather than an afternoon of trial fitting.',
      'Sectionals split at the joins they were designed to split at. Forcing a joined sectional around a stairwell turn stresses the frame at points never meant to take it, and the damage shows up later as a section that no longer sits flush against its neighbour.',
      'Joints that have been apart before get checked rather than assumed. Bolts into engineered board lose grip each time they are removed, so a piece on its third move sometimes needs a larger fixing or a different approach, and it is better to find that out at the start.',
      'Adjustable bases get their cabling and control box positioned before the mattress goes on. A cable routed across the hinge line will chafe through, and by then the base is loaded and against a wall.',
    ],
    timeRanges: [
      { item: 'Splitting and rejoining a sectional', range: '1–2 hours' },
      { item: 'Bedroom set taken apart for a move', range: '1.5–3 hours' },
      { item: 'Same set rebuilt at the new address', range: '2–4 hours' },
      { item: 'Secondhand piece rebuilt from parts', range: '1–2.5 hours' },
      { item: 'Adjustable base setup', range: '45 minutes – 1.5 hours' },
    ],
    whatToHaveReady: [
      'Photos of the staircase or hallway if anything has to come apart to get through it.',
      'All the hardware you were given, especially on a secondhand piece, even if it looks incomplete.',
      'Clear floor in both rooms when a piece is moving between them.',
      'A decision on whether the old furniture is going out, so it can be broken down on the same visit.',
    ],
    faq: [
      {
        q: "Bob's delivers and sets up. When would you need me?",
        a: 'For a new order with delivery included, generally you would not, and I will say so on the phone. Where I come in is moves, secondhand pieces, sectionals that need splitting to get up a staircase, deliveries left in the entryway on the cheaper tier, and taking the old set apart when the new one lands.',
      },
      {
        q: 'My sectional will not fit up the stairs. What are the options?',
        a: 'Usually it comes apart at the factory joins, goes up in sections and is rejoined at the top, which is far safer for the frame than forcing it around a turn. Send a photo of the staircase and of the sofa and I will tell you before booking whether it is workable.',
      },
      {
        q: 'I bought a piece secondhand and it came apart. Will it go back together?',
        a: 'Usually. The variable is how many times it has been dismantled — bolts into engineered board lose their bite with each cycle, and a piece on its third move may need a larger fixing in a couple of places. I will tell you what I find rather than handing back something that feels solid for two weeks.',
      },
      {
        q: 'Can you take the old furniture apart the same day?',
        a: 'Yes, and it is worth combining. I break the old pieces down so they will go through a door and into a truck or a dumpster. Removal itself is not something I do, but the dismantling is the part that stops most people.',
      },
    ],
    cta: {
      heading: 'Moving it, not unboxing it',
      body: 'Most of this work is stairs, splits and rebuilds. Send a photo of the piece and of the route it has to travel, and I will tell you what is realistic.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['jordans-furniture-assembly', 'raymour-flanigan-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: "Hi Julio, I have Bob's furniture that needs moving or rebuilding:",
  },

  {
    slug: 'jordans-furniture-assembly',
    name: "Jordan's Furniture",
    category: 'furniture',
    order: 8,
    published: true,
    trademarks: ["Jordan's Furniture"],
    seo: {
      title: "Jordan's Furniture Assembly in MA, RI & CT | Aplus",
      description:
        'Secondhand pieces rebuilt, bedroom sets moved between floors, sectionals taken apart for a narrow staircase. Independent service in MA, RI and CT.',
      primaryKeyword: 'jordans furniture assembly',
    },
    h1: "Jordan's Furniture: Moves, Rebuilds and Second-Hand Pieces",
    intro: [
      "Jordan's delivery crews are good and they set furniture up as part of the delivery. If your order is new and the delivery includes setup, you do not need a second person, and I would rather tell you that here than take a booking you did not need.",
      'The work that does come my way is shaped by the housing stock this chain sells into. Southeastern Massachusetts and Rhode Island are full of triple-deckers, converted mills and second-floor apartments with a turn halfway up the stairs and a banister that does not come off. A delivery crew works to a schedule and a policy; they will not dismantle a sofa to get it round a corner, and they will not touch the furniture you already own.',
      'So the jobs are these: pieces that have to come apart to get in, existing furniture moved out of the way or out of the room entirely, sets relocated between floors when a household reshuffles, and the large secondhand market — this is furniture people keep and resell locally, and it changes hands as a pile of parts.',
    ],
    modelLines: [
      {
        name: 'Sofas and sectionals into tight access',
        note: 'Legs, backs and sections removed to clear a turn, then rebuilt upstairs. The alternative is forcing it, which damages frames and doorframes in roughly equal measure.',
      },
      {
        name: 'Bedroom furniture between floors',
        note: 'Beds and dressers dismantled, carried and rebuilt when a household swaps rooms. Hardware bagged per piece so reassembly is not a matching exercise.',
      },
      {
        name: 'Secondhand pieces bought locally',
        note: 'Collected as parts from a marketplace seller, frequently without instructions. Rebuilt from the joint design, which is readable on this kind of construction.',
      },
      {
        name: 'Dining tables and leaves',
        note: 'Tops separated from bases for a move and rejoined level afterwards, with extension mechanisms run through their full travel to confirm nothing shifted in transit.',
      },
      {
        name: 'Existing furniture out of the way',
        note: 'The piece already in the room, broken down and moved so the new one can land. Delivery crews will not do this, and it is the thing people discover on the morning.',
      },
    ],
    assemblyNotes: [
      'Access is measured before anything is lifted. The narrowest point on the route decides the plan, and in a triple-decker that point is usually the turn on the second landing rather than the front door everyone worries about.',
      'What comes apart, comes apart deliberately. Photographs at each joint and labeled hardware bags per piece, because a bolt that looks like its neighbour and is a quarter-inch shorter will go in and hold nothing.',
      'Reassembly is checked under load rather than by eye. A bed rebuilt after a move gets sat on and a dresser gets its drawers cycled before I leave, since a joint that was fine empty can move once weight goes on it.',
      'Secondhand rebuilds start with an honest assessment. Some joints tolerate several cycles and some do not, and I would rather tell you at the start that a panel is past holding than hand back a piece that feels solid and is not.',
    ],
    timeRanges: [
      { item: 'Sofa dismantled to clear a staircase and rebuilt', range: '1.5–3 hours' },
      { item: 'Bedroom set moved between floors', range: '3–5 hours' },
      { item: 'Secondhand piece rebuilt from parts', range: '1–2.5 hours' },
      { item: 'Existing furniture broken down and cleared', range: '45 minutes – 2 hours' },
    ],
    whatToHaveReady: [
      'Photos of the staircase, the landing turn and the doorway, which is what the plan is built on.',
      'The delivery date if we are working around one, so the room is clear before the truck arrives.',
      'All hardware for a secondhand piece, however incomplete the bag looks.',
      'Somewhere for the old furniture to go once it is broken down.',
    ],
    faq: [
      {
        q: "Jordan's sets furniture up on delivery. Where do you come in?",
        a: 'On everything the delivery does not cover. Their crew brings it in and assembles it; they will not take a sofa apart to clear a stairwell, move the furniture you already own, or relocate a set between floors later on. Those are the calls I get, along with secondhand pieces bought locally.',
      },
      {
        q: 'My apartment is a second-floor walk-up with a turn in the stairs. Is that a problem?',
        a: 'It is the normal case around here rather than an unusual one. The turn is what matters, not the flight itself. Send me a photo taken from the bottom of the stairs looking up, plus the width of the narrowest doorway, and I can tell you what has to come apart before anything is booked.',
      },
      {
        q: 'I bought a piece secondhand and there are no instructions. Can you still build it?',
        a: 'Almost always. Furniture at this level is built with readable joinery — you can see what engages with what — so the manual is a convenience rather than a necessity. What I do need is the hardware. Bring me everything the seller handed over, even the bits that look like spares.',
      },
    ],
    cta: {
      heading: 'Stairs, turns and old buildings',
      body: 'A photo from the bottom of your staircase looking up tells me more than any measurement. Send that and the piece, and you will get a straight answer.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['bobs-discount-furniture-assembly', 'raymour-flanigan-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: "Hi Julio, I have Jordan's furniture to move or rebuild:",
  },

  {
    slug: 'raymour-flanigan-furniture-assembly',
    name: 'Raymour & Flanigan',
    category: 'furniture',
    order: 9,
    published: true,
    trademarks: ['Raymour & Flanigan'],
    seo: {
      title: 'Raymour & Flanigan Assembly | MA, RI & CT | Aplus',
      description:
        'Outlet and clearance pieces built, bedroom sets rebuilt after a move, old furniture broken down for removal. Independent service across MA, RI and CT.',
      primaryKeyword: 'raymour and flanigan furniture assembly',
    },
    h1: 'Raymour & Flanigan: Outlet Pieces, Moves and Rebuilds',
    intro: [
      'Standard delivery from this chain includes setup, so a new full-price order arriving with delivery does not need me. That is worth saying plainly at the top rather than burying it.',
      'The gap is the clearance and outlet channel. Pieces sold as-is, floor models, and end-of-line stock frequently leave the store flat, in a customer vehicle, with the hardware in a bag and no crew involved at any point. That is a real assembly job and it is where a good share of these calls come from.',
      'The rest is movement. Households here relocate between apartments constantly, and a bedroom set that went in easily as separate cartons has to come out as assembled furniture. There is also the old set: the new delivery arrives, the crew takes the packaging, and the previous bed is still standing in the middle of the room because dismantling it was nobody else\'s job.',
    ],
    modelLines: [
      {
        name: 'Outlet and clearance stock',
        note: 'Sold as-is and collected flat. Built from the hardware supplied, with a check first that what is in the bag actually matches what the piece needs.',
      },
      {
        name: 'Floor models',
        note: 'Bought assembled and dismantled for transport, then rebuilt at home. These have already been put together once, so joints are inspected rather than assumed sound.',
      },
      {
        name: 'Bedroom sets on the move',
        note: 'Taken down, transported and rebuilt. Rails and headboard hardware bagged and labeled to their piece, since sets often share a fastener size across pieces that are not interchangeable.',
      },
      {
        name: 'Power reclining seating',
        note: 'Sections joined and the transformer and cabling routed with slack at the hinge, checked at full extension before the piece is pushed back to the wall.',
      },
      {
        name: 'Old furniture removal prep',
        note: 'The previous bed or dresser broken down so it fits through a door and into a truck. Not a haul-away, but the part that actually stops people.',
      },
    ],
    assemblyNotes: [
      'Clearance stock gets its hardware verified before the build starts. As-is pieces are the most likely to be missing a fastener or to have picked up one from a different item, and finding that at the first joint rather than the last is worth ten minutes at the outset.',
      'Anything already assembled once is inspected as it comes apart. Floor models have been built, stood on a shop floor and taken down again, and any joint that shows movement gets flagged before it goes back together rather than after.',
      'Fastener sizes are labeled to the piece across a set, not pooled. Manufacturers reuse a bolt diameter between a bed and a dresser while changing the length, and a shorter bolt in a rail bracket engages just enough thread to feel right and not enough to hold.',
      'Recliner power runs are set with the mechanism at full extension, not closed. A cable dressed neatly with the chair upright goes taut when it opens, and the failure is either an unplugged transformer or a chafed lead six months on.',
    ],
    timeRanges: [
      { item: 'Outlet piece built from flat', range: '1–2.5 hours' },
      { item: 'Floor model rebuilt at home', range: '1–2 hours' },
      { item: 'Bedroom set dismantled for a move', range: '1.5–3 hours' },
      { item: 'Power reclining sectional', range: '1.5–2.5 hours' },
      { item: 'Old set broken down for removal', range: '45 minutes – 2 hours' },
    ],
    whatToHaveReady: [
      'The hardware bag from an outlet purchase, kept sealed and with nothing added to it.',
      'A cleared route if a piece is being taken out as well as one coming in.',
      'An outlet within reach of anything that reclines under power.',
      'Confirmation of what is leaving the room, so both jobs happen on one visit.',
    ],
    faq: [
      {
        q: 'Raymour & Flanigan assembles on delivery. Why book separately?',
        a: 'For a standard delivered order you would not, and I will tell you so. The calls I get are outlet and clearance pieces that leave the store flat, floor models collected by the customer, sets being moved between apartments later on, and the old furniture that needs dismantling once the new order lands.',
      },
      {
        q: 'I bought a clearance piece as-is and the hardware bag looks short. Can you work with that?',
        a: 'Often, yes. I carry a wide range of common bolts, barrel nuts and washers and can complete a good proportion of these from what is in the van. Where a fastener is proprietary I identify exactly what is needed so you can source it, build everything else, and close it out on a short second visit.',
      },
      {
        q: 'Can you dismantle the old bed when the new one arrives?',
        a: 'Yes, and it is worth booking for the delivery day. I break the old piece down so it goes through the door and into a truck or a dumpster. I do not take it away, but getting it to that state is the part most people would rather not spend a Saturday on.',
      },
      {
        q: 'We are moving apartments. Can you do both ends?',
        a: 'Yes. Dismantling at one address and rebuilding at the other on the same day is how these are usually best handled, because the hardware never leaves my hands and nothing gets lost between the two. Tell me both addresses and the access at each and I will quote it as one job.',
      },
    ],
    cta: {
      heading: 'Outlet buy or a move?',
      body: 'Both are normal work here. Tell me which it is, what the piece is, and whether anything is leaving the room as well as arriving.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['bobs-discount-furniture-assembly', 'jordans-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Raymour & Flanigan piece to build or move:',
  },

  {
    slug: 'nordictrack-assembly',
    name: 'NordicTrack',
    category: 'fitness',
    order: 10,
    published: true,
    trademarks: ['NordicTrack'],
    seo: {
      title: 'NordicTrack Assembly in MA, RI & CT | Aplus',
      description:
        'Folding treadmills, ellipticals and rowers built, with the deck strut set and the belt tracked. Independent NordicTrack assembly in MA, RI and CT.',
      primaryKeyword: 'nordictrack assembly service',
    },
    h1: 'NordicTrack Treadmill and Elliptical Assembly',
    intro: [
      'The defining feature of this range is that the deck folds. A gas strut carries the weight of the running surface as it lifts and lowers, and the strut has to be connected in the right sequence, at the right point in the build, with the deck supported while you do it. Get that wrong and the deck either will not stay up or comes down faster than anyone wants. It is the one step on these machines where doing it alone is genuinely a bad idea.',
      'The second characteristic is the console. These are large touchscreens on an upright mast, and the wiring loom runs up inside that mast from the motor housing. It is connected before the mast covers close, which means the order is fixed: loom first, covers second, console third. Reversing that costs a full disassembly, and a loom trapped between a cover and the frame will chafe through in months.',
      'Ellipticals in the range have the highest part count of anything I build. Rear-drive and front-drive units both route their console cabling through the mast, and the ramp motor on an incline model wants checking through its full travel before the shrouds go on.',
    ],
    modelLines: [
      {
        name: 'Commercial series treadmills',
        note: 'The heavier folding decks with incline and decline. Substantial machines that arrive in one carton and need the strut connected with the deck supported.',
      },
      {
        name: 'EXP series treadmills',
        note: 'Lighter folding decks aimed at home use. Same sequence and the same console loom routing, with less mass to manage during the lift.',
      },
      {
        name: 'Elliptical trainers',
        note: 'The highest part count in the range. Pedal arms, ramp and console mast all go together in a set order, and the ramp motor is tested before the covers close.',
      },
      {
        name: 'Rowers and cycles',
        note: 'Quicker builds, mostly rail alignment and monitor mounting. The rail joint on a two-piece rower needs seating fully or the stroke feels notchy at the catch.',
      },
      {
        name: 'Console and subscription setup',
        note: 'Screen mounted, firmware allowed to update and the unit taken through its first startup so you are not left at a login prompt after I have gone.',
      },
    ],
    assemblyNotes: [
      'The gas strut on a folding deck is connected with the deck held, not balanced. This is the point in the build where a second pair of hands matters most, and it is the step most likely to injure someone doing it alone on a kitchen floor.',
      'Console wiring is seated and dressed before the mast covers close. Working in that order is not a preference — a loom pinched behind a cover shows up months later as an intermittent display fault, and the diagnosis costs more than the original build.',
      'Belt tracking and tension get set after assembly, on the floor the machine will live on. A new belt that drifts to one side is not faulty; it is untracked, and it will wear unevenly until somebody adjusts it.',
      'On incline and decline models the ramp is run through its full travel before shrouds are fitted. A cable routed a fraction short binds at the extreme of the range, which is exactly where nobody tests it.',
    ],
    timeRanges: [
      { item: 'Folding treadmill', range: '1–2 hours' },
      { item: 'Elliptical trainer', range: '1.5–2.5 hours' },
      { item: 'Rower or exercise cycle', range: '45 minutes – 1.5 hours' },
      { item: 'Carrying a boxed treadmill up a flight', range: 'add 45 – 90 minutes' },
      { item: 'Firmware update and first-run setup', range: '15–30 minutes' },
    ],
    whatToHaveReady: [
      'The room decided, with enough clearance behind the deck for the safety run-off.',
      'An outlet on a circuit that is not already carrying much else.',
      'Your wifi details, so the console can update and finish setup rather than stopping at a prompt.',
      'A photo of the staircase before booking if the machine is not going on the ground floor.',
    ],
    faq: [
      {
        q: 'Can the deck really be folded up and down safely on my own afterwards?',
        a: 'Yes, once the strut is connected correctly — that is what it is for. The risk is during assembly, when the deck has to be held while the strut is fitted and there is nothing yet carrying the weight. After the build it lifts and lowers under control, and I will run it up and down with you before I leave.',
      },
      {
        q: 'My treadmill belt drifts to one side. Is it defective?',
        a: 'Almost never. New belts settle and need tracking, which is an adjustment at the rear roller bolts, done a fraction of a turn at a time with the belt running slowly. Left alone it will wear one edge. It is a ten-minute job for someone who has done it and a frustrating afternoon otherwise.',
      },
      {
        q: 'Will it fit up my stairs?',
        a: 'Boxed, usually yes, because the carton is the machine at its most compact. The limiting factors are the turn on the landing and the ceiling height above the stairs rather than the weight alone. Send a photo taken from the bottom looking up and I will tell you before you book.',
      },
      {
        q: 'Do you handle the console setup as well?',
        a: 'Yes. The screen goes on, the firmware is allowed to update, and I take the machine through its first start so it is ready to use rather than sitting on a setup screen. Have your wifi password to hand and that part takes a few minutes.',
      },
    ],
    cta: {
      heading: 'Folding decks and heavy cartons',
      body: 'Tell me the model and which floor it is going to. If there are stairs, a photo from the bottom looking up settles the whole question in one message.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['peloton-assembly', 'sole-treadmill-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I need a NordicTrack machine assembled. Model and floor:',
  },

  {
    slug: 'sole-treadmill-assembly',
    name: 'Sole',
    category: 'fitness',
    order: 11,
    published: true,
    trademarks: ['Sole'],
    seo: {
      title: 'Sole Treadmill Assembly in MA, RI & CT | Aplus',
      description:
        'F63, F80 and F85 decks leveled, belts tracked and tensioned, consoles wired without a pinch. Independent Sole assembly in MA, RI and CT.',
      primaryKeyword: 'sole treadmill assembly',
    },
    h1: 'Sole Treadmill Assembly and Setup',
    intro: [
      'These are built around a heavy welded steel frame, and that single design choice explains both why people buy them and why they are awkward to install. A welded chassis does not rely on bolted joints to stay in alignment, so the machine is rigid and quiet — but it also means the frame arrives as one solid mass in the carton and there is no partial disassembly available to get it through a doorway.',
      'The build itself is not complicated: uprights, console, motor cover, and the deck is already assembled to the frame. The work is in the finishing. The deck cushioning system sits on the frame at specific mount points, and a machine set on a floor that is out of level puts load through those mounts unevenly. Basement slabs and older wood floors are rarely flat, and leveling here is done against the floor, not by eyeballing the frame.',
      'Belt tracking and tension are the last step and the one that most decides how the machine feels for the next five years. A belt too loose slips underfoot at push-off, too tight and it drags the motor. There is a correct feel between those two, and it gets set with the belt running rather than static.',
    ],
    modelLines: [
      {
        name: 'F63',
        note: 'The lighter of the folding decks and the most common in an upstairs room. Still a substantial carton, but the most likely of the range to make it up a normal staircase.',
      },
      {
        name: 'F80',
        note: 'A heavier deck and a larger motor housing. The usual choice for a basement or garage, and the point where the carton stops being a two-person carry up stairs.',
      },
      {
        name: 'F85',
        note: 'The heaviest of the common home decks, with the longest running surface. Access is the whole conversation on these, and I will tell you honestly when a staircase rules one out.',
      },
      {
        name: 'Elliptical and cycle models',
        note: 'Built on the same welded-frame philosophy. More bolted assembly than the treadmills, with the console loom routed through the mast before covers close.',
      },
    ],
    assemblyNotes: [
      'The welded frame is the constraint, not the weight on the specification sheet. There is no taking a section off to clear a stairwell turn, so if the carton does not go, the machine does not go — which is why access gets settled with photographs before a date is agreed.',
      'Leveling is done against the floor with the machine in its final position. The deck cushioning mounts are designed to share load evenly, and a frame sitting on three of its four feet puts all of it through two, which is felt underfoot within weeks.',
      'Belt tension is set by feel with the belt moving, then re-checked after a few minutes of running. Setting it static gives a reading that changes as soon as the belt warms and stretches, which is why a machine can feel right at the end of assembly and wrong the next morning.',
      'The console loom is connected and dressed before the upright covers are fitted. Same discipline as any machine with a mast, and the same consequence for getting it wrong: an intermittent fault that presents as a console problem and is a cable problem.',
    ],
    timeRanges: [
      { item: 'Treadmill assembly and setup', range: '1–2 hours' },
      { item: 'Leveling and belt tracking', range: '20–40 minutes of that' },
      { item: 'Elliptical or cycle', range: '1.5–2.5 hours' },
      { item: 'Carrying a boxed deck down to a basement', range: 'add 45 – 90 minutes' },
    ],
    whatToHaveReady: [
      'A photo of the staircase and the narrowest doorway, taken before you order if possible.',
      'The final position chosen, with run-off clearance behind the deck.',
      'An outlet within reach that is not shared with much else on the same circuit.',
      'The carton left where the carrier put it rather than opened, so it can be moved as a unit.',
    ],
    faq: [
      {
        q: 'Can the frame be taken apart to get it up my stairs?',
        a: 'No, and that is the honest constraint with this design. The chassis is welded rather than bolted, which is why the machine is rigid and quiet, and it also means there is no partial disassembly. The carton either makes the turn or it does not. Send me photos and I will tell you which before you buy.',
      },
      {
        q: 'How do I know the belt is tensioned correctly?',
        a: 'Underfoot it should not slip when you push off, and the motor should not sound like it is working to turn it. That window is narrower than it sounds and it is set with the belt running, then checked again once it has warmed up. I do both before I leave and show you what to look for later.',
      },
      {
        q: 'My floor is not level. Does that matter?',
        a: 'It does, more than most people expect. The deck cushioning mounts are designed to share load across four feet, and a frame rocking on two of them concentrates everything through those. Leveling is done against the floor in the final position, which takes a few minutes and saves the mounts.',
      },
      {
        q: 'It was delivered on a pallet at the curb. Can you take it from there?',
        a: 'Yes, and that is normally the best way. Freight carriers deliver curbside only. I uncrate outside, move the machine in on a proper route rather than manhandling a crate through a doorway, and the packaging leaves with me instead of filling your garage.',
      },
    ],
    cta: {
      heading: 'Settle the access first',
      body: 'With a welded frame there is no plan B on a tight staircase. Photos of the stairs and the doorway, plus the model, and you get a straight yes or no.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['nordictrack-assembly', 'bowflex-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Sole treadmill to set up. Model and floor:',
  },

  {
    slug: 'bowflex-assembly',
    name: 'Bowflex',
    category: 'fitness',
    order: 12,
    published: true,
    trademarks: ['Bowflex'],
    seo: {
      title: 'Bowflex Assembly in MA, RI & CT | Aplus Assemblers',
      description:
        'Home gyms strung in the right pulley order, SelectTech dumbbells and Max Trainers set up. Independent Bowflex assembly in MA, RI and CT.',
      primaryKeyword: 'bowflex assembly service',
    },
    h1: 'Bowflex Home Gym and Equipment Assembly',
    intro: [
      'The multi-station home gyms in this range are the most sequence-dependent thing I build in any category. A single cable runs a long path through a series of pulleys in a fixed order, and there is no way to insert it into the middle of that path later. Thread one pulley out of order and the correction is not a small adjustment — it is unthreading the entire run back to the mistake and starting that section again.',
      'That is why these take longer than the box suggests and why a partly built home gym is such a common thing to find in a basement. Someone gets to the cable stage, the diagram stops matching what is in front of them, and the project stalls. Picking one of those up part-built is genuinely a large share of the Bowflex calls I get.',
      'The rest of the range is much quicker. Adjustable dumbbells are a dial mechanism that needs the plates seated in their cradle correctly rather than assembly as such, and the cardio machines are conventional builds with a console loom through the upright.',
    ],
    modelLines: [
      {
        name: 'Power Rod home gyms',
        note: 'Resistance comes from composite rods rather than a weight stack. Lighter to move than a stack machine, and the rod bases have to seat fully square or the pull feels uneven side to side.',
      },
      {
        name: 'Cable and pulley home gyms',
        note: 'The long-path cable runs through every pulley in a fixed sequence. This is the stage that decides whether the build takes two hours or five.',
      },
      {
        name: 'SelectTech adjustable dumbbells',
        note: 'Minimal assembly, but the plates have to sit correctly in the cradle for the dial to engage cleanly. A dumbbell returned to a misaligned cradle is how the selector mechanism gets damaged.',
      },
      {
        name: 'Max Trainer and cardio machines',
        note: 'Conventional builds with the console loom routed up the upright before covers close. Stabilizers leveled against the floor once the machine is in position.',
      },
      {
        name: 'Part-built machines',
        note: 'A stalled home gym picked up from wherever it stopped. Usually the cable run, and usually needing a section unthreaded before it can go forward.',
      },
    ],
    assemblyNotes: [
      'The cable is threaded in one pass, in the documented order, with the whole run laid out before any of it is tensioned. Skipping ahead to a pulley that looks obvious is the single most common way one of these ends up abandoned half-built.',
      'Cable tension is set at the end, evenly, with the machine at rest. Uneven tension makes one side of a movement feel heavier than the other, and people usually blame the resistance rather than the setup that caused it.',
      'Rod bases and frame joints seat square before final tightening. A frame drawn up tight on one corner first puts the rod mounts fractionally out of line, and that shows as a pull that tracks slightly off center through the whole range.',
      'Adjustable dumbbells get their cradles positioned and checked before use. The selector only engages properly with the plates sitting true, and a cradle knocked out of alignment on a garage floor is the usual cause of a dial that will not turn.',
    ],
    timeRanges: [
      { item: 'Cable-and-pulley home gym', range: '2.5–5 hours' },
      { item: 'Power Rod home gym', range: '2–3.5 hours' },
      { item: 'Rescuing a part-built machine', range: '1.5–4 hours depending on where it stalled' },
      { item: 'Adjustable dumbbells and stand', range: '30–45 minutes' },
      { item: 'Cardio machine', range: '1–2 hours' },
    ],
    whatToHaveReady: [
      'Clear floor around the whole footprint, not just where the frame lands, since the cable is laid out flat first.',
      'For a part-built machine, every bag and offcut still on site, however irrelevant it looks.',
      'The manual if you still have it, because the pulley order is the one thing worth checking against.',
      'A decision on the final position, as these are not machines to shuffle once strung.',
    ],
    faq: [
      {
        q: 'I gave up halfway through the cable. Can you finish it?',
        a: 'Yes, and it is one of the more common ways I meet these machines. Expect me to unthread back to wherever the sequence went wrong rather than picking up from where you stopped, because the cable cannot be inserted mid-path. Keep everything you have taken out of the boxes, including anything you were sure was spare.',
      },
      {
        q: 'Why does one side feel heavier than the other?',
        a: 'Usually uneven cable tension, sometimes a rod base or frame joint that was drawn up before the frame was square. Both are correctable without a full rebuild in most cases. It is worth fixing rather than training around, because a lopsided pull trains a lopsided movement.',
      },
      {
        q: 'How much space does a home gym actually need?',
        a: 'More than the footprint. You need the frame plus room to complete the movements plus room to walk round it, and during assembly you need the cable run laid out flat, which is longer than the machine. If the space is tight, send me the room dimensions and I will tell you whether it works before delivery.',
      },
      {
        q: 'My dumbbell dial will not turn. Is it broken?',
        a: 'Often not. The selector will not move unless the plates are sitting true in the cradle, so a dumbbell put back at a slight angle can jam. Realigning the cradle and seating the handle properly clears most of these. If the mechanism itself is damaged, I will tell you rather than forcing it.',
      },
    ],
    cta: {
      heading: 'Stalled at the cable stage?',
      body: 'It is the normal place to stop, and it is fixable. Send a photo of where you are and keep every bag, including whatever looked like leftovers.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['sole-treadmill-assembly', 'power-rack-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I need a Bowflex machine assembled or finished:',
  },

  {
    slug: 'power-rack-assembly',
    name: 'Power Racks and Squat Racks',
    category: 'fitness',
    order: 13,
    published: true,
    trademarks: ['Rogue', 'REP Fitness', 'Titan'],
    seo: {
      title: 'Power Rack & Squat Rack Assembly | MA, RI & CT',
      description:
        'Uprights stood, squared and torqued in sequence, then anchored. Home gym racks built properly across Massachusetts, Rhode Island and Connecticut.',
      primaryKeyword: 'power rack assembly',
    },
    h1: 'Power Rack and Squat Rack Assembly',
    intro: [
      'A rack is the one piece of home gym equipment where the assembly quality has a direct safety consequence. Everything else, built badly, wears out early. A rack built out of plumb binds when you re-pin the safeties, and a safety pin that does not seat cleanly under load is not a comfort issue.',
      'These arrive as bolted steel from the makers most people buy — Rogue, REP Fitness and Titan among them — and the bolted construction is what makes the build order matter. Every bolt goes in finger-tight, the whole frame is stood up and squared against the floor, and only then is anything torqued, in a cross sequence rather than corner by corner. Racks assembled tight-as-you-go end up permanently out of true, and no amount of later adjustment recovers it.',
      'The other half of the job is mass. Uprights on a serious rack are heavy enough that standing the frame is a two-person operation, and basement floors in this part of the world are rarely flat, so shimming to the floor comes before anchoring rather than after.',
    ],
    modelLines: [
      {
        name: 'Four-post power racks',
        note: 'The full cage. Squared on the diagonal before torquing, then checked that safeties and J-cups slide and seat freely at several heights before it is signed off.',
      },
      {
        name: 'Two-post squat stands',
        note: 'Lighter and quicker, and far more dependent on floor anchoring or a stabilizer base, since there is no cage geometry holding them in line.',
      },
      {
        name: 'Wall-mounted folding racks',
        note: 'A structural fixing rather than an assembly. Uprights land on framing, not on drywall alone, and the mounting points get located and confirmed before anything is drilled.',
      },
      {
        name: 'Attachments and accessories',
        note: 'Pull-up bars, dip handles, weight horns and landmines. Fitted after the frame is torqued so nothing is levering against a joint that is still loose.',
      },
      {
        name: 'Plate storage and bar holders',
        note: 'Added last and positioned so the loaded weight sits where it helps the rack stand rather than pulling it off its footing.',
      },
    ],
    assemblyNotes: [
      'Every bolt goes in finger-tight first and nothing is torqued until the frame is standing and square. This is the whole discipline on a rack. Tightening one corner fully before the rest locks the geometry, and a cage that is out of true will bind on the safeties at exactly the moment you need them.',
      'Squaring is checked on the diagonal, not by eye down a face. Two diagonals that measure equal means the frame is square; two faces that look parallel means very little on a structure this size.',
      'Uprights are shimmed to the floor before anchoring. Concrete slabs in basements around here are commonly out by enough to rock a rack, and anchoring a frame down onto an uneven floor pulls it out of the alignment you just set.',
      'Safeties and J-cups are cycled through several hole positions before the job is finished. A pin that drops in freely at chest height and sticks at hip height is a frame that is not true, and that has to be found on the day rather than under a loaded bar.',
    ],
    timeRanges: [
      { item: 'Four-post power rack', range: '2–4 hours' },
      { item: 'Two-post squat stand', range: '1–2 hours' },
      { item: 'Wall-mounted folding rack', range: '2–3 hours' },
      { item: 'Attachments and plate storage', range: '30 minutes – 1 hour' },
      { item: 'Floor anchoring', range: 'add 45 minutes – 1.5 hours' },
    ],
    whatToHaveReady: [
      'The footprint marked out and cleared, with ceiling height checked for pull-up clearance.',
      'A decision on whether it is being anchored to the floor, since that changes the approach.',
      'All cartons on site, as racks routinely ship across several heavy boxes.',
      'Rubber flooring or mats laid first if you are using them, because they go under the frame.',
    ],
    faq: [
      {
        q: 'Does a rack need to be bolted to the floor?',
        a: 'Not always. A heavy four-post cage with loaded plate storage is usually stable free-standing. A two-post stand, a light frame, or anything you intend to kip or do pull-ups on benefits considerably from being anchored. I will give you a straight recommendation based on the specific frame rather than a blanket answer.',
      },
      {
        q: 'My safety pins stick at some heights and not others. Why?',
        a: 'The frame is not square. Uprights that are fractionally splayed or twisted let a pin drop freely at one height and bind at another, and it is a build problem rather than a manufacturing one. It is correctable: loosen, square on the diagonal, retorque in sequence. Usually an hour or so.',
      },
      {
        q: 'What ceiling height do I need?',
        a: 'Enough for the rack plus your reach above the pull-up bar plus a hand width. A standard basement ceiling rules out full-height cages more often than people expect, and a shorter frame is a much better outcome than one that cannot be used as intended. Measure before ordering and send me the number.',
      },
    ],
    cta: {
      heading: 'Get it square before it is loaded',
      body: 'Send the frame you have bought, your ceiling height and a note of the floor. Those three decide the build, and a rack is not a thing to correct after the fact.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['bowflex-assembly', 'concept2-rower-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I need a power rack assembled. Model and ceiling height:',
  },

  {
    slug: 'concept2-rower-assembly',
    name: 'Concept2',
    category: 'fitness',
    order: 14,
    published: true,
    trademarks: ['Concept2'],
    seo: {
      title: 'Concept2 Rower Assembly in MA, RI & CT | Aplus',
      description:
        'RowErg, BikeErg and SkiErg built, split and rebuilt for storage or a move. Independent Concept2 assembly in Massachusetts, Rhode Island and CT.',
      primaryKeyword: 'concept2 rower assembly',
    },
    h1: 'Concept2 RowErg, BikeErg and SkiErg Assembly',
    intro: [
      'I will be honest about this one: it is the easiest build in the category. A rower here goes together with a handful of screws and separates into two pieces without tools, which is by design — the machine is meant to be split for storage and carried through a doorway in halves. If you are comfortable with a screwdriver and have somewhere flat to work, you can do it yourself, and I would rather say so than pretend otherwise.',
      'What people call me for is different. It is the SkiErg, which is a wall or frame installation rather than a floor machine and has to land on something structural. It is moves, where the monorail and front section travel separately and want putting back together properly. And it is the situation where a machine has been in a basement for years, the chain is dry and the joint has been apart a dozen times.',
      'The one part worth care on the rower is the joint between the front section and the monorail. It has to seat fully and the fixings brought up evenly, otherwise the stroke feels notchy at the catch — a small thing that is felt on every single pull.',
    ],
    modelLines: [
      {
        name: 'RowErg',
        note: 'Two pieces plus a monitor arm, separating without tools for storage. The monorail joint is the only part of the build where care actually changes how it feels.',
      },
      {
        name: 'BikeErg',
        note: 'Similar simplicity with a seat post, handlebars and monitor. Leveling the feet against the floor stops the rock that shows up during a hard standing effort.',
      },
      {
        name: 'SkiErg',
        note: 'A different job entirely. Wall-mounted or on a floor stand, and the wall version is a structural fixing that must land on framing rather than on drywall alone.',
      },
      {
        name: 'Monitor and firmware',
        note: 'Arm fitted, sensor cable seated and the monitor taken through its setup. A sensor lead that is not fully home reads intermittently, which looks like a monitor fault.',
      },
      {
        name: 'Chain and rail servicing',
        note: 'On an older machine bought secondhand, the chain gets checked and lubricated and the rail cleaned, which changes how the stroke feels more than anything else on the machine.',
      },
    ],
    assemblyNotes: [
      'The monorail joint is seated fully and its fixings brought up evenly rather than one at a time. A joint drawn up unevenly leaves the rail a fraction proud at one edge, and the seat carriage passes over that on every stroke.',
      'A wall-mounted SkiErg is treated as a structural installation, not a hanging. Framing is located and confirmed before drilling, and the fixing is chosen for the wall that is actually there — masonry and older plaster both need a different approach from modern drywall.',
      'On a secondhand machine the chain and rail get attention before anything else. Years in a damp basement leave a dry chain and a gritty rail, and cleaning and lubricating both transforms the stroke without a single part being replaced.',
      'The monitor sensor lead is seated fully and its routing checked. Intermittent readings on these machines are far more often a lead that is not quite home than a monitor that has failed.',
    ],
    timeRanges: [
      { item: 'RowErg from the box', range: '20–40 minutes' },
      { item: 'Splitting and rebuilding for a move', range: '30 minutes – 1 hour' },
      { item: 'Wall-mounted SkiErg installation', range: '1–2 hours' },
      { item: 'Chain and rail service on an older machine', range: '30–45 minutes' },
    ],
    whatToHaveReady: [
      'Flat floor space roughly the length of the machine plus a person, for the build.',
      'For a wall installation, the wall type if you know it and the height you want the handles at.',
      'Everything that came with a secondhand machine, including the monitor and its bracket.',
      'The storage plan, since knowing whether it will be split regularly changes how I set it up.',
    ],
    faq: [
      {
        q: 'Honestly, can I just build this myself?',
        a: 'For a rower or a bike, most people can. It is a short build with ordinary tools, and the machine is designed to come apart for storage. Where I am genuinely worth the money is a wall-mounted SkiErg, a move, or an older machine that needs the chain and rail sorted before it feels right again.',
      },
      {
        q: 'What does the wall need to be for a SkiErg?',
        a: 'Something structural. The fixing has to land on framing, not on drywall alone, because the load during a pull is substantial and repeated. Masonry and older plaster walls are both workable and both need a different fixing from modern drywall, so tell me your wall type when you get in touch.',
      },
      {
        q: 'The stroke feels notchy. What causes that?',
        a: 'Two usual suspects. Either the monorail joint is not fully seated, so the carriage crosses a slight step every stroke, or the chain is dry and the rail has picked up grit. Both are quick to put right and neither needs a part. It is worth fixing, because you feel it on every pull.',
      },
      {
        q: 'Can you take it apart for a move and rebuild it there?',
        a: 'Yes, and it is straightforward with these. It separates into two pieces without tools, which is exactly what makes it easy to move. I will split it, rebuild it at the other end, check the joint and the monitor lead, and it comes out feeling the same as it went in.',
      },
    ],
    cta: {
      heading: 'The one I might talk you out of',
      body: 'If it is a rower from the box, you may not need me. If it is a wall mount, a move or an old machine that feels wrong, that is worth a message.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['power-rack-assembly', 'tonal-installation'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Concept2 machine to set up or move:',
  },

  {
    slug: 'tonal-installation',
    name: 'Tonal',
    category: 'fitness',
    order: 15,
    published: true,
    trademarks: ['Tonal'],
    seo: {
      title: 'Tonal Installation in MA, RI & CT | Aplus Assemblers',
      description:
        'A wall-mounted trainer is a structural fixing, not a hanging. Studs located and confirmed, bracket lagged to spec. Independent install in MA, RI and CT.',
      primaryKeyword: 'tonal installation service',
    },
    h1: 'Tonal Wall Installation in MA, RI and CT',
    intro: [
      'This is not an assembly job. There is nothing to build. It is a structural wall installation, and it belongs closer to mounting a large television on brick than to putting together a treadmill — except that a television hangs still and this pulls hundreds of pounds off the wall, repeatedly, in the direction that most wants to bring the fixing out.',
      'That changes the whole approach. The framing behind the wall is located and confirmed rather than trusted to a first stud-finder reading, the manufacturer bracket is used exactly as supplied, and the lag bolts are driven to specification into solid timber. There is no version of this job where a drywall anchor is acceptable, however well rated it claims to be.',
      'The complication in this region is what the walls are actually made of. A great deal of housing here is lath and plaster rather than drywall, which throws off cheap stud finders and behaves differently under a lag bolt. Converted mill buildings bring masonry into it. Knowing which one you have, before drilling, is most of the job.',
    ],
    modelLines: [
      {
        name: 'The trainer itself',
        note: 'Wall-mounted, with the load path running from the arms through the bracket into the framing. Everything about the installation exists to serve that load path.',
      },
      {
        name: 'Placement and clearance',
        note: 'Arms need swing room and the workout needs floor space in front. Positioning is agreed and marked before any hole is made, because the decision is permanent once it is drilled.',
      },
      {
        name: 'Smart accessories',
        note: 'Bench, bar, rope and mat set up alongside so the space is usable as a whole rather than a mounted unit with the accessories still in cartons.',
      },
      {
        name: 'Older or unusual walls',
        note: 'Lath and plaster, masonry and converted mill construction, each needing a different fixing approach and each common in this part of New England.',
      },
    ],
    assemblyNotes: [
      'Framing is located and then confirmed by a second method before anything is drilled. A stud finder reading through thick plaster is a suggestion rather than a fact, and being one bolt out on a mount carrying this kind of repeated load is not a mistake with a small consequence.',
      'The manufacturer bracket is used as supplied, with lag bolts to the published specification. Substituting hardware on a load-bearing fixture is exactly the shortcut that does not show on the day and shows very clearly later.',
      'Height and position are marked and agreed with you standing in front of them. Arms need clearance through their full swing and you need floor space to work in, and once the lag bolts are in, the position is settled permanently.',
      'On masonry and lath-and-plaster walls the fixing approach changes entirely, and the wall type is established before booking rather than discovered on the day with the unit already in your hallway.',
    ],
    timeRanges: [
      { item: 'Installation on a standard framed wall', range: '1.5–3 hours' },
      { item: 'Installation on masonry', range: '2–4 hours' },
      { item: 'Locating and confirming framing on plaster', range: 'add 30–45 minutes' },
      { item: 'Accessories set up alongside', range: '20–40 minutes' },
    ],
    whatToHaveReady: [
      'Your wall type if you know it, and a photo of the wall including any trim or outlets nearby.',
      'The unit and its bracket on site, unopened, with all supplied hardware present.',
      'Clear floor in front of the wall, and anything hanging on it already taken down.',
      'An idea of your preferred height, though we will settle it together before drilling.',
    ],
    faq: [
      {
        q: 'Can it go on a drywall wall without hitting framing?',
        a: 'No. The bracket has to land on structural framing, and no drywall anchor is appropriate for this regardless of its rating, because the load is heavy, repeated and pulling directly outward. If the studs are not where you want the unit, we move the unit, not the standard.',
      },
      {
        q: 'My house has plaster walls, not drywall. Is that a problem?',
        a: 'It is normal here rather than a problem, but it changes the method. Plaster is brittle and it defeats cheap stud finders, so framing gets located and confirmed by more than one method, and pilot holes go in before any lag bolt does. Tell me the wall type when you get in touch.',
      },
      {
        q: 'Can it be mounted on an exposed brick wall?',
        a: 'Yes. Masonry needs a hammer drill and the right sleeve anchors set into the brick face rather than the mortar joints, which are much softer. It takes longer than a framed wall and it holds extremely well when it is done properly. Send a photo of the wall and I will confirm before booking.',
      },
      {
        q: 'How much space do I need in front of it?',
        a: 'Enough to complete a full movement with the arms extended, plus room to step back. That is more than the unit suggests when it is folded flat against the wall. We work the position out together before anything is drilled, taking the room and your height into account.',
      },
    ],
    cta: {
      heading: 'What is behind your wall?',
      body: 'Drywall, plaster or brick changes the whole method. Send a photo of the wall and I will tell you what the installation involves before you book.',
    },
    parentServiceSlug: 'fitness-equipment-assembly',
    relatedBrandSlugs: ['concept2-rower-assembly', 'peloton-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I need a Tonal installed. My wall is:',
  },

  {
    slug: 'backyard-discovery-playset-assembly',
    name: 'Backyard Discovery',
    category: 'outdoor',
    order: 16,
    published: true,
    trademarks: ['Backyard Discovery'],
    seo: {
      title: 'Backyard Discovery Playset Assembly | MA, RI & CT',
      description:
        'Several hundred parts, a full day, and a build order that does not forgive a skipped step. Leveled and anchored. Independent service in MA, RI and CT.',
      primaryKeyword: 'backyard discovery playset assembly',
    },
    h1: 'Backyard Discovery Playset Assembly',
    intro: [
      'A wooden playset is the largest thing most households will ever try to build themselves. Several hundred parts, a manual that runs to dozens of stages, and a full day of work for someone who knows what they are doing. The reason these defeat people is not any single difficult step. It is the volume, and the fact that the build order is not optional — a board fitted in the wrong stage is usually one that later boards have to pass behind.',
      'The part that decides the outcome happens before any timber is joined: the ground. These structures are built to be square and level, and a site that slopes even modestly means the tower leans, the slide sits wrong and the swing beam is not level. Correcting for a slope has to be planned at the start, because by the time the tower is standing it is far too heavy to lift and pack under.',
      'Then there is anchoring. A swing set with children on it generates a surprising amount of lifting force at the beam ends, and ground anchors are what stop the frame walking over a season. They go in as part of the build, not as an afterthought.',
    ],
    modelLines: [
      {
        name: 'Tower and slide sets',
        note: 'A raised clubhouse with a slide and a ladder or rock wall. The tower goes up first and squares the whole structure, so time spent on it pays back across the rest.',
      },
      {
        name: 'Sets with a swing beam',
        note: 'A beam extending from the tower with swings and often a glider. The beam has to sit level independently of the tower, and its far leg carries most of the anchoring load.',
      },
      {
        name: 'Larger clubhouse models',
        note: 'Upper decks, windows, and sometimes a second tower. These are full-day builds at minimum and the part count is where the time goes rather than any one stage.',
      },
      {
        name: 'Gazebos and pergolas',
        note: 'Same maker, same principle. A flat and level base first, frame squared before final tightening, and posts anchored appropriately to the surface underneath.',
      },
      {
        name: 'Accessories and hardware',
        note: 'Slides, rock walls, gliders and swing hangers, fitted at the stage the manual specifies so that nothing has to be removed to reach a fixing behind it.',
      },
    ],
    assemblyNotes: [
      'The site is leveled and checked before the first two boards go together. A slope that looks trivial by eye becomes obvious once a tower is standing on it, and at that point the structure is far too heavy to lift and shim underneath.',
      'The manual is followed in its stated order rather than by what looks efficient. Boards that seem independent are frequently trapped behind later assemblies, and going back for one of them means undoing a full stage.',
      'Fixings are left slightly loose through each stage and drawn up when the section is complete and square. Timber sections tightened as you go end up fighting each other, and the tower ends up out of true with no obvious single cause.',
      'Ground anchors go in during the build, not afterwards. A swing beam generates real lifting force at its far end with children using it, and a set that is not anchored will move across a season and take its squareness with it.',
    ],
    timeRanges: [
      { item: 'Tower and slide set', range: '5–8 hours' },
      { item: 'Set with a swing beam', range: '7–10 hours' },
      { item: 'Larger clubhouse model', range: 'a full day – two days' },
      { item: 'Gazebo or pergola', range: '4–7 hours' },
      { item: 'Site leveling if the ground needs work', range: 'add 1–3 hours' },
    ],
    whatToHaveReady: [
      'The location chosen and reasonably level, with any turf or obstruction cleared beforehand.',
      'All cartons on site and accounted for, since these ship across several heavy boxes.',
      'Access for carrying long timber from the delivery point to the build site.',
      'An idea of the finished footprint, including the swing arc, which is larger than people expect.',
    ],
    faq: [
      {
        q: 'How level does the ground need to be?',
        a: 'Closer than most people assume. A modest slope across the footprint shows clearly once the tower is up, and it affects how the slide sits and whether the swing beam is level. If your yard slopes, tell me before booking and we plan for it — it is straightforward at the start and effectively impossible once the structure is standing.',
      },
      {
        q: 'Is this really a whole day?',
        a: 'For most sets, yes, and for the larger ones it can run into a second. The part count is what drives it rather than any difficult stage. I would rather quote you an honest day than a half-day that turns into an evening with children waiting to use it.',
      },
      {
        q: 'Do the anchors matter if the set feels heavy enough already?',
        a: 'They do. The weight of the structure is not what resists a swing in use — the lifting force at the far end of the beam is considerable and it repeats thousands of times. Anchors keep the frame where it was built and keep it square. They go in as part of the build.',
      },
      {
        q: 'Can you build it if the boxes have been sitting outside for weeks?',
        a: 'Usually, but I will check the timber first. Cartons that have taken rain can leave boards cupped or swollen, which makes them fight the assembly and sometimes means a part needs replacing. Better to know that at the start of the day than at stage forty.',
      },
    ],
    cta: {
      heading: 'Block out the day',
      body: 'These are honest full-day builds. Send me the set and a photo of the yard where it is going, especially if the ground is not flat.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['lifetime-shed-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a playset to build. Here is the yard:',
  },

  {
    slug: 'lifetime-shed-assembly',
    name: 'Lifetime',
    category: 'outdoor',
    order: 17,
    published: true,
    trademarks: ['Lifetime'],
    seo: {
      title: 'Lifetime Shed Assembly in MA, RI & CT | Aplus',
      description:
        'The base decides everything. A shed built on an uneven pad never latches straight, and no adjustment later fixes it. Independent service in MA, RI and CT.',
      primaryKeyword: 'lifetime shed assembly',
    },
    h1: 'Lifetime Shed and Outdoor Storage Assembly',
    intro: [
      'Everything about these sheds comes back to the base. The panels are steel-reinforced resin and they are dimensionally accurate, which sounds like good news and is — right up until you set them on a pad that is out of level. The structure has no give in it. It will not settle into a twist and carry on working the way a timber shed does. What it does instead is refuse to let the doors meet, and there is no adjustment anywhere in the design that recovers that.',
      'So the sequence matters more than the assembly. Base checked and corrected first, floor panels locked together and confirmed square and flat, then walls, then roof. Anyone who starts putting walls up on a pad they have not checked is committing to taking them back down.',
      'The build itself is pleasant work. Panels slot and screw together, the part count is manageable, and there is no timber to cut. It is one of the few large outdoor structures where the assembly is genuinely simpler than the preparation.',
    ],
    modelLines: [
      {
        name: 'Compact sheds',
        note: 'The smaller footprints, typically around eight feet by ten. A half-day build on a good pad, and the size most likely to be going onto an existing patio slab.',
      },
      {
        name: 'Larger walk-in sheds',
        note: 'Wider footprints with more wall panels and a longer roof span. More panels means more opportunity for a base problem to accumulate across the run.',
      },
      {
        name: 'Vertical and utility storage',
        note: 'Narrow units against a wall or fence. Quick to build, and still entirely dependent on a level base for the doors to close as designed.',
      },
      {
        name: 'Sheds with a floor kit',
        note: 'The floor panels lock together and become the reference for everything above. Time spent confirming this layer is flat and square is time not spent dismantling walls.',
      },
      {
        name: 'Other outdoor items',
        note: 'Basketball systems, tables and outdoor furniture from the same maker. Different products, same principle: get what it stands on right first.',
      },
    ],
    assemblyNotes: [
      'The pad is checked across both diagonals and along each edge before a single panel comes out of its wrapping. Resin panels are dimensionally accurate and unforgiving, so any error in the base transfers straight into the structure with nothing to absorb it.',
      'Floor panels are locked together and confirmed flat and square as a complete layer. That layer is the reference for every wall above it, and a floor that is a fraction out at one corner grows into a door gap by the time the walls are up.',
      'Doors are the diagnostic. If they meet cleanly and latch without lifting, the base was right. If they do not, the answer is almost never the hinges — it is the pad, which is why nobody should be adjusting hardware to chase this.',
      'The roof goes on with the walls confirmed square rather than merely upright. A roof forced onto a structure that has drifted out of true holds the error in place permanently and puts standing load on panel joins that were not designed for it.',
    ],
    timeRanges: [
      { item: 'Compact shed on a prepared pad', range: '4–6 hours' },
      { item: 'Larger walk-in shed', range: '6–9 hours' },
      { item: 'Vertical or utility storage unit', range: '1.5–3 hours' },
      { item: 'Correcting a base that is out of level', range: 'add 1–3 hours' },
    ],
    whatToHaveReady: [
      'A flat, level and stable pad already in place — this is the one thing that cannot be improvised.',
      'All cartons on site, since larger sheds ship across several very heavy boxes.',
      'Clear access from where the boxes were dropped to where the shed is going.',
      'Enough clearance around the footprint to work on all four sides.',
    ],
    faq: [
      {
        q: 'What counts as a good enough base?',
        a: 'Flat, level and stable across the whole footprint — a concrete pad, pavers set properly, or a well-built gravel base with a frame. Bare soil or turf is not enough, and a pad that is level along one edge and dips at a corner will still cause the door problem. Send me a photo and I will tell you honestly.',
      },
      {
        q: 'My existing shed doors will not close. Can that be fixed?',
        a: 'Sometimes, and it depends what is under it. If the pad has settled at one corner, the structure has followed it and the fix is to correct the base, which usually means at least partial dismantling. Adjusting the doors themselves chases the symptom and rarely holds.',
      },
      {
        q: 'Can you prepare the base as well?',
        a: 'I can level and set a pad within reason, and I will tell you when a site genuinely needs groundwork beyond that. What I will not do is build on a base I do not think is adequate, because you would be paying me for a shed that never closes properly.',
      },
      {
        q: 'Is a shed a one-day job?',
        a: 'On a pad that is already right, generally yes for the common sizes. If the base needs correcting first, it is realistically two visits or a long day, and I would rather set that expectation up front than run out of daylight with your roof panels still in the box.',
      },
    ],
    cta: {
      heading: 'Send me a photo of the pad',
      body: 'Before anything else. The base decides whether this is a straightforward day or a rebuild, and it is the one thing worth checking before you order.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['backyard-discovery-playset-assembly', 'weber-grill-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Lifetime shed to build. Photo of the base:',
  },

  {
    slug: 'weber-grill-assembly',
    name: 'Weber',
    category: 'outdoor',
    order: 18,
    published: true,
    trademarks: ['Weber'],
    seo: {
      title: 'Weber Grill Assembly in MA, RI & CT | Aplus',
      description:
        'Spirit, Genesis and Kettle grills built with the cart squared, the lid aligned and the connection leak-checked. Independent service in MA, RI and CT.',
      primaryKeyword: 'weber grill assembly',
    },
    h1: 'Weber Grill Assembly and Setup',
    intro: [
      'A grill build is short and it has one stage that people rush. The cart is a bolted steel frame and, like any bolted frame, it wants every fastener started loose, the whole thing stood on its wheels, and then tightening once it is square. Racing through it corner by corner leaves a cart with a slight twist, which is why so many grills rock on a flat patio and why the lid on those never quite meets the body evenly.',
      'The lid alignment is the part worth caring about, because it is what you look at every time you use it. It is set after the cart is square and on the ground, never while the body is still on a workbench or a lawn.',
      'On the gas models the last step is the connection check. Regulator seated properly, connection made, and the joints brushed with soapy water to confirm there is no leak before the grill is lit for the first time. It is in the manual as an owner step, it takes two minutes, and it is the step most commonly skipped.',
    ],
    modelLines: [
      {
        name: 'Spirit series',
        note: 'The compact gas carts. A straightforward build where the cart frame and the lid alignment account for most of the quality difference between a good assembly and a rushed one.',
      },
      {
        name: 'Genesis series',
        note: 'Larger carts with more panels, side tables and storage. More fasteners means more opportunity for a frame to be drawn up out of square before it is stood on its wheels.',
      },
      {
        name: 'Kettle grills',
        note: 'Charcoal, and the quickest build in the range. Legs, ash catcher and handles — the main thing is the leg joints being fully seated so it does not sit unevenly.',
      },
      {
        name: 'Portable and small-space models',
        note: 'Quick builds for balconies and small yards. Minimal frame work, though the connection check still applies on anything running on gas.',
      },
      {
        name: 'Covers and accessories',
        note: 'Rotisseries, griddles, baskets and covers fitted or sized at the same visit, so nothing is left in a box in the garage.',
      },
    ],
    assemblyNotes: [
      'Cart fasteners all go in loose, the frame is stood on its wheels, and only then is anything tightened. A cart drawn up tight while it is lying on its side takes a twist that is invisible until it is standing on a flat surface and rocking.',
      'Lid alignment is set with the grill on the ground and the cart already square. Adjusted on a bench, it will be adjusted again later, because the body sits differently once the whole assembly is loaded onto its own wheels.',
      'Wheel and caster orientation is checked before final tightening. Getting one caster in backwards is easy to do, produces a grill that will not roll straight, and means undoing part of the frame to correct it.',
      'On gas models the regulator is seated properly and the joints are brushed with soapy water to confirm there is no leak before first lighting. It is an owner step in the manual, it takes two minutes, and it is the one people skip.',
    ],
    timeRanges: [
      { item: 'Kettle grill', range: '30–45 minutes' },
      { item: 'Spirit series cart', range: '1–1.5 hours' },
      { item: 'Genesis series cart', range: '1.5–2.5 hours' },
      { item: 'Connection and leak check', range: '10–15 minutes of that' },
      { item: 'Accessories fitted at the same visit', range: '15–30 minutes' },
    ],
    whatToHaveReady: [
      'The propane tank on site if you are running on gas, so the connection can be checked before I leave.',
      'The spot where it will live, since a built cart is easier to position than to move far.',
      'A reasonably flat surface to build on, ideally the patio rather than a sloping lawn.',
      'Any accessories you have bought, so everything is fitted in one visit.',
    ],
    faq: [
      {
        q: 'My grill rocks even on a flat patio. Why?',
        a: 'The cart was tightened before it was square, almost always while it was still on its side or on a lawn. It takes a slight twist and the wheels then sit on three points instead of four. Loosening the frame, standing it on a flat surface and retightening in sequence fixes it in well under an hour.',
      },
      {
        q: 'Do you check the connection before you leave?',
        a: 'Yes, on anything running on gas. The regulator gets seated properly and the joints brushed with soapy water so any leak shows as bubbles before the grill is ever lit. It is the manufacturer\'s own owner procedure and it takes a couple of minutes.',
      },
      {
        q: 'The lid does not sit evenly. Can that be adjusted?',
        a: 'Usually yes, and it is worth doing because it is the part you look at every time. The lid is aligned with the grill standing on the ground and the cart already square — done in that order it comes right. Done on a bench, it moves again as soon as the grill is on its wheels.',
      },
    ],
    cta: {
      heading: 'Built square, checked before you light it',
      body: 'Tell me the model and whether you are on gas or charcoal. Most grills are a same-week job and done inside a couple of hours.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['traeger-grill-assembly', 'lifetime-shed-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Weber grill to assemble. Model:',
  },

  {
    slug: 'traeger-grill-assembly',
    name: 'Traeger',
    category: 'outdoor',
    order: 19,
    published: true,
    trademarks: ['Traeger'],
    seo: {
      title: 'Traeger Grill Assembly in MA, RI & CT | Aplus',
      description:
        'Pro, Ironwood and Timberline pellet grills assembled, auger and probe wiring routed clear of heat, then burned in. Independent service in MA, RI and CT.',
      primaryKeyword: 'traeger grill assembly',
    },
    h1: 'Traeger Pellet Grill Assembly and Burn-In',
    intro: [
      'A pellet grill is a machine, not just a cooking box, and that is what separates this build from a conventional grill. There is a hopper feeding an auger, a motor turning it, an igniter, a fan, and a temperature probe reporting back to a controller. All of that is wired, and all of that wiring shares a chassis with something that gets extremely hot.',
      'So the part that actually matters is the routing. Every lead is dressed away from the barrel and clear of the auger housing, secured where the manual specifies, before any panel goes on to cover it. A lead resting against the cook chamber will not fail today. It will fail in the second season, in the middle of a long cook, and it will present as a controller fault.',
      'The other thing people miss is the burn-in. A new pellet grill needs its initial seasoning run before the first food goes on it, both to prime the auger and to burn off manufacturing residue. It takes the better part of an hour and it is not optional.',
    ],
    modelLines: [
      {
        name: 'Pro series',
        note: 'The most common home model. A cart frame, hopper and barrel, with the auger and controller wiring the part of the build that rewards care.',
      },
      {
        name: 'Ironwood series',
        note: 'More insulation and more control electronics, which means more wiring inside the same hot chassis. Routing and securing leads takes proportionally longer.',
      },
      {
        name: 'Timberline series',
        note: 'The largest of the range, with the heaviest barrel and the most involved cart. A genuine two-person lift at the point the barrel goes onto the frame.',
      },
      {
        name: 'Portable models',
        note: 'Compact pellet grills for small spaces and travel. Same auger and controller principle in a smaller package, and the same burn-in requirement.',
      },
      {
        name: 'Controller and connectivity setup',
        note: 'Controller powered up, firmware allowed to update where applicable, and connected to your network so it is ready rather than sitting at a setup screen.',
      },
    ],
    assemblyNotes: [
      'Every lead is routed clear of the barrel and the auger housing and secured at the points the manual specifies, before panels close over them. This is the difference between a grill that works for years and one that develops an intermittent fault in its second season.',
      'The auger is checked for free rotation before the hopper is loaded with pellets. A shipping-damaged or fouled auger is far easier to deal with empty, and a hopper full of pellets on top of a jammed auger is a genuinely tedious thing to empty.',
      'The temperature probe is positioned as designed rather than tucked out of the way. It is what the controller uses to hold temperature, so a probe sitting against metal reads the metal, and the grill chases a number that does not reflect the cooking space.',
      'The initial burn-in is run before any food goes near it. It primes the auger, establishes the fire and burns off manufacturing residue, and skipping it produces a first cook that tastes of the factory.',
    ],
    timeRanges: [
      { item: 'Pro series assembly', range: '1.5–2.5 hours' },
      { item: 'Ironwood series assembly', range: '2–3 hours' },
      { item: 'Timberline series assembly', range: '2.5–4 hours' },
      { item: 'Initial burn-in run', range: 'add 45 minutes – 1 hour' },
      { item: 'Controller and network setup', range: '15–30 minutes' },
    ],
    whatToHaveReady: [
      'An outlet within reach of where it will stand, since the controller and auger both need power.',
      'A bag of pellets on site so the burn-in can actually be run before I leave.',
      'The final position chosen, ideally under cover, and on a surface that is reasonably flat.',
      'Your network details if you want the connected features working on the day.',
    ],
    faq: [
      {
        q: 'Do I really need to run a burn-in before cooking?',
        a: 'Yes. It primes the auger, gets the fire established and burns off residue left from manufacturing. It takes the better part of an hour and it materially affects how the first cook tastes. I run it as part of the assembly if there are pellets on site, which is why I ask you to have a bag ready.',
      },
      {
        q: 'My grill will not hold temperature. Is that an assembly problem?',
        a: 'It can be. The two usual causes are a temperature probe that is not positioned as designed, so the controller is reading metal rather than the cook chamber, and a partial auger feed problem. Both are checkable without dismantling much, and both are worth ruling out before anyone replaces a controller.',
      },
      {
        q: 'Does it need to be plugged in?',
        a: 'Yes. Unlike a gas or charcoal grill, this is a powered appliance — the auger motor, igniter, fan and controller all draw current. That makes the position decision partly an outlet decision, and it is worth settling before assembly rather than moving a built grill afterwards.',
      },
      {
        q: 'Can it live outside uncovered through a New England winter?',
        a: 'It will survive, but pellets and damp are a poor combination and the electronics do better under cover. Empty the hopper if it is going to sit unused, and use a cover. If you have somewhere sheltered, that is the better spot, and it is worth deciding before it is assembled and heavy.',
      },
    ],
    cta: {
      heading: 'Assembled, wired properly, burned in',
      body: 'Have a bag of pellets and an outlet nearby and I will leave you a grill that is ready to cook on rather than one that still needs an evening of setup.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['weber-grill-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a Traeger to assemble. Model:',
  },

  {
    slug: 'standing-desk-assembly',
    name: 'Standing Desks',
    category: 'outdoor',
    order: 20,
    published: true,
    trademarks: ['Uplift', 'FlexiSpot', 'Autonomous'],
    seo: {
      title: 'Standing Desk Assembly in MA, RI & CT | Aplus',
      description:
        'Frame squared to the top before final torque, controller reset, cables routed so nothing pinches at the lowest travel. Independent service in MA, RI and CT.',
      primaryKeyword: 'standing desk assembly',
    },
    h1: 'Standing Desk Assembly and Setup',
    intro: [
      'A height-adjustable desk is two problems wearing one carton. The frame is a mechanical assembly that has to end up square to a top it was not made for, and the electronics are a system that needs initialising before it will travel its full range. Most of the desks I get called to fix were built correctly as furniture and never had the second half done.',
      'The frames I see most come from Uplift, FlexiSpot and Autonomous, and they share the same construction logic: two motorised legs joined by an adjustable crossbar, bolted up through a top that is usually drilled separately. Because the crossbar adjusts, it is entirely possible to build a frame that is rigid, tighten everything, and only then discover it is not square to the top. Which means the order is fixed — frame loose, top positioned, everything aligned, then torque.',
      'Then the controller. Nearly all of these need a reset routine on first power-up, where the desk is driven to its lowest point and held to establish that position in memory. Without it the desk either refuses to move, stops short, or reports an error people assume is a fault.',
    ],
    modelLines: [
      {
        name: 'Two-leg electric frames',
        note: 'The standard configuration. Legs and an adjustable crossbar, bolted through the top, with the crossbar set to the top width before anything is torqued.',
      },
      {
        name: 'Frames with a separate top',
        note: 'Frame and desktop bought apart, so the top is undrilled. Pilot holes are placed and depth-controlled, because a screw through the surface of a new top cannot be undone.',
      },
      {
        name: 'Corner and L-shaped desks',
        note: 'Three legs and two crossbars, which multiplies the squaring problem. Each section gets aligned to the top before any of it is tightened.',
      },
      {
        name: 'Controllers and memory presets',
        note: 'The reset routine run on first power-up, then the height presets set to you sitting and standing rather than to a default nobody uses.',
      },
      {
        name: 'Cable management and accessories',
        note: 'Trays, monitor arms and power strips fitted and the run tested at full height and full drop, which is where a short cable finds itself.',
      },
    ],
    assemblyNotes: [
      'The crossbar is set to the actual top and everything stays loose until the frame is aligned to it. A frame torqued up before the top goes on is rigid in whatever shape it happened to be, and forcing a top onto it puts a permanent racking load through both legs.',
      'On an undrilled top, pilot holes are placed and drilled to a controlled depth. A screw that breaks through the working surface of a new desktop is not a repair, and it is the single most expensive mistake available on this job.',
      'The controller reset is run on first power-up: the desk is driven down to its lowest position and held to register it. Skipping this is why a new desk will not move, stops short of its range, or throws an error that gets mistaken for a hardware fault.',
      'Cables are routed and tested at both extremes of travel, not at desk height. A monitor lead that reaches comfortably while standing goes taut on the way down and either unplugs itself or gets pinched between the frame and the top.',
    ],
    timeRanges: [
      { item: 'Two-leg desk with a pre-drilled top', range: '45 minutes – 1.5 hours' },
      { item: 'Frame with an undrilled top', range: '1.5–2.5 hours' },
      { item: 'Corner or L-shaped desk', range: '2–3 hours' },
      { item: 'Cable management and monitor arms', range: '30 minutes – 1 hour' },
      { item: 'Controller reset and presets', range: '10–20 minutes' },
    ],
    whatToHaveReady: [
      'The desk position chosen, with an outlet in reach — the frame needs power to move at all.',
      'Both cartons on site, since the frame and the top routinely ship separately.',
      'Monitor arms, trays and anything else being mounted, so it is all fitted in one visit.',
      'A rough idea of your sitting and standing heights, so the presets are set to you.',
    ],
    faq: [
      {
        q: 'My new desk will not move. Is it faulty?',
        a: 'Usually not. Nearly all of these need a reset on first power-up, where you drive the desk to its lowest point and hold the control until it registers. Until that is done the controller does not know its own range and will either refuse to move or stop short. It takes under a minute once you know it.',
      },
      {
        q: 'I bought the frame and the top separately. Can you drill it?',
        a: 'Yes, and it is worth having done. Pilot holes get positioned to the frame and drilled to a controlled depth so nothing comes through the working surface. That is the irreversible step on this job, which is exactly why it is the one people most often ask for help with.',
      },
      {
        q: 'One side of my desk is slightly higher than the other. What causes that?',
        a: 'Either the frame was torqued before it was squared to the top, or the legs have lost sync and need the reset routine run again. Both are fixable in an hour or so. Running it out of sync puts uneven load through both leg mechanisms, so it is worth sorting rather than living with.',
      },
      {
        q: 'Will my cables reach at full height?',
        a: 'That is exactly the thing to check, and it is why I test the run at both extremes rather than at desk height. Monitor leads and power cables that are comfortable standing can go taut on the way down and get pinched. A cable tray and a little slack solve it, and it is far easier to sort during the build.',
      },
    ],
    cta: {
      heading: 'The half of the job people skip',
      body: 'Frame square to the top, controller reset, cables tested at full drop. Tell me which desk you bought and whether the top came drilled.',
    },
    parentServiceSlug: 'furniture-assembly',
    relatedBrandSlugs: ['costco-furniture-assembly'],
    relatedProblemSlugs: [],
    whatsappMessage: 'Hi Julio, I have a standing desk to assemble:',
  },
];

export const brands: Brand[] = z
  .array(brandSchema)
  .parse(raw)
  .sort((a, b) => a.order - b.order);

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                    */
/* -------------------------------------------------------------------------- */

const bySlug = new Map(brands.map((b) => [b.slug, b]));

export function getBrand(slug: string): Brand | undefined {
  return bySlug.get(slug);
}

export const publishedBrands: Brand[] = import.meta.env.DEV
  ? brands
  : brands.filter((b) => b.published);

/**
 * Brands belonging to a service, derived rather than declared.
 *
 * The brand names its parent; the reverse list is computed. That way the two
 * directions cannot drift apart, and adding a brand automatically links it
 * from the service page without editing services.ts.
 */
export function brandsForService(serviceSlug: string): Brand[] {
  return publishedBrands.filter((b) => b.parentServiceSlug === serviceSlug);
}

export function brandsByCategory(category: BrandCategory): Brand[] {
  return publishedBrands.filter((b) => b.category === category);
}

/**
 * The independence statement. One definition, used by every brand page, and
 * matched verbatim by the audit — so it cannot be quietly dropped or reworded
 * into something weaker.
 */
export function independenceStatement(trademarks: string[], businessName: string): string {
  const marks =
    trademarks.length > 1
      ? `${trademarks.slice(0, -1).join(', ')} or ${trademarks[trademarks.length - 1]}`
      : (trademarks[0] ?? '');

  return `${businessName} is an independent assembly service and is not affiliated with, authorized by, or endorsed by ${marks}. All product and company names are trademarks of their respective owners.`;
}
