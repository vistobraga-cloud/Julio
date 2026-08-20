import { z } from 'zod';

/**
 * The six service categories.
 *
 * Every entry carries its own copy. Nothing here is a template with a noun
 * swapped in: the opening, the "how it works" steps and the FAQ are written
 * for that service specifically. The test is the one from the brief — swap two
 * entries' names and the text must stop making sense.
 *
 * `published` gates whether the page is emitted at all. Unpublished entries
 * never reach dist/, which means they cannot reach the sitemap either.
 */

/* -------------------------------------------------------------------------- */
/*  Shared schemas                                                             */
/* -------------------------------------------------------------------------- */

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

export const faqSchema = z.object({
  q: z.string().min(10),
  /**
   * Answers render as visible HTML inside a <details> element, which keeps
   * them in the DOM whether the accordion is open or shut. FAQPage JSON-LD
   * mirrors this text; it never carries an answer the page does not show.
   */
  a: z.string().min(40),
});

export const seoSchema = z.object({
  /** Hard cap 60. Anything longer is cut in the SERP mid-thought. */
  title: z.string().min(10).max(60),
  /** Google's usable band. Under 120 wastes space, over 158 gets truncated. */
  description: z.string().min(120).max(158),
  /**
   * The one query this page is allowed to target. Enforced unique across the
   * whole site by validateDataIntegrity() — this is the mechanical form of
   * the anti-cannibalisation rule, replacing "remember not to overlap".
   */
  primaryKeyword: z.string().min(3),
});

export type Faq = z.infer<typeof faqSchema>;
export type Seo = z.infer<typeof seoSchema>;

/* -------------------------------------------------------------------------- */
/*  Service schema                                                             */
/* -------------------------------------------------------------------------- */

const subcategorySchema = z.object({
  name: z.string().min(3),
  blurb: z.string().min(60),
});

const stepSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(60),
});

const serviceSchema = z.object({
  slug: slugSchema,
  /** Full name, title case. Used in nav, breadcrumbs and schema.org. */
  name: z.string().min(3),
  /** Compact label for the sticky bar and tight card layouts. */
  shortName: z.string().min(2),
  order: z.number().int().nonnegative(),
  published: z.boolean(),

  seo: seoSchema,
  h1: z.string().min(10),
  /** Opening paragraphs: what it is and why hiring it out is worth the money. */
  intro: z.array(z.string().min(80)).min(2),

  subcategories: z.array(subcategorySchema).min(4),
  howItWorks: z.array(stepSchema).min(3).max(4),
  faq: z.array(faqSchema).min(4).max(6),

  /**
   * Prefilled WhatsApp text for this page. Contextual per the brief — a
   * visitor arriving on TV mounting must not open a chat that says "furniture".
   */
  whatsappMessage: z.string().min(20),

  /**
   * Sibling services worth crossing to. validateDataIntegrity() checks that
   * every slug resolves AND that the link is reciprocal — if painting points
   * at cabinetry, cabinetry must point back. A one-way link is almost always
   * an editing mistake, and it leaks the equity it was meant to pass.
   */
  relatedServiceSlugs: z.array(slugSchema),

  /**
   * Brands are NOT listed here. Each brand declares its parent service, and
   * the reverse list is derived by brandsForService() in brands.ts. One
   * direction of truth means the two lists cannot drift apart, and adding a
   * brand links it from its service page with no edit to this file.
   *
   * Problems are populated in Phase 3; validateDataIntegrity() checks every
   * referenced slug resolves, so a typo fails the build instead of shipping
   * a 404.
   */
  relatedProblemSlugs: z.array(slugSchema),
});

export type Service = z.infer<typeof serviceSchema>;

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const raw: unknown[] = [
  {
    slug: 'furniture-assembly',
    name: 'Furniture Assembly',
    shortName: 'Furniture',
    order: 1,
    published: true,
    seo: {
      title: 'Furniture Assembly in MA, RI & CT | Aplus Assemblers',
      description:
        'IKEA, Wayfair, Ashley and more, assembled right the first time. Beds, wardrobes, desks, shelving and patio sets across MA, RI and CT.',
      primaryKeyword: 'furniture assembly service',
    },
    h1: 'Furniture Assembly Across Massachusetts, Rhode Island and Connecticut',
    intro: [
      'Flat-pack furniture is designed to survive shipping, not to be easy to build. The instructions are drawings with no words, the cam locks only tighten in one direction, and half the panels are handed — meaning they look identical but only fit one way. A wardrobe that the box says takes ninety minutes routinely takes a first-timer four hours, and the mistakes that cost the most time are the ones you find at step 40.',
      'I have been assembling furniture for ten years and I have built most of these pieces more than once. That is the whole difference. I know which IKEA panels are commonly mislabeled, which Wayfair beds ship with undersized bolts, and which shelving units need to be squared and anchored before you load them or they will lean within a month. You get the piece built, level, tight and anchored, and the packaging taken out of your house.',
      'Most jobs are done same week, often next day. I handle single items and whole rooms, and I bring my own tools — including the ones the box does not include and quietly assumes you own.',
    ],
    subcategories: [
      {
        name: 'Bed frames and headboards',
        blurb:
          'Platform beds, storage beds with drawers, bunk beds and upholstered headboards. Slats spaced and secured properly so the mattress does not sag, and the frame squared so the joints stop creaking after a week.',
      },
      {
        name: 'Wardrobes and closet systems',
        blurb:
          'IKEA PAX, Elfa and similar systems. These have to be built plumb and wall-anchored — a loaded wardrobe that is out of square will not close flush, and an unanchored one is a genuine tip-over hazard with children in the house.',
      },
      {
        name: 'Desks and home office',
        blurb:
          'Standing desks, L-shaped desks, filing units and monitor arms. Motorised desks get their controller calibrated and the cable tray installed so the wiring does not get pinched at the bottom of travel.',
      },
      {
        name: 'Bookshelves and shelving',
        blurb:
          'Tall units, cube storage and modular wall shelving. Every unit over roughly four feet gets anchored to a stud or a proper drywall anchor, because loaded shelving is far heavier and far more top-weighted than it looks.',
      },
      {
        name: 'Dining sets',
        blurb:
          'Tables, extension leaves, benches and chairs. Chair joints get checked and snugged in sequence rather than one leg at a time, which is what stops the wobble that shows up a month after assembly.',
      },
      {
        name: 'Sofas and sectionals',
        blurb:
          'Sectional connections, leg installation and reclining mechanisms. If it arrived in pieces because it would not fit through the door assembled, I can put it together in the room where it lives.',
      },
      {
        name: 'Patio and outdoor furniture',
        blurb:
          'Dining sets, loungers, gazebos, pergolas and umbrella bases. Outdoor hardware is usually stainless or coated and strips easily, so it gets torqued by hand rather than driven home with an impact driver.',
      },
      {
        name: 'Cribs and nursery',
        blurb:
          'Cribs, changing tables and convertible bed conversions, built to the manufacturer instructions with no substituted hardware, plus anti-tip anchoring on every dresser in the room.',
      },
      {
        name: 'Storage sheds',
        blurb:
          'Resin and metal sheds from Lifetime, Suncast and Keter. The base has to be flat before anything goes up — a shed built on an uneven pad will not have doors that latch, and no amount of adjustment later fixes it.',
      },
      {
        name: 'Playsets and swing sets',
        blurb:
          'Wooden and metal playsets, swing beams, slides and climbing walls. These are the biggest boxes in this category, commonly 300+ pieces and a full day of work, and they are anchored and leveled for safety.',
      },
    ],
    howItWorks: [
      {
        title: 'Tell me what you bought',
        body: 'Send the product name or a photo of the box label over WhatsApp. That tells me the real build time and whether it is a one-person job, which is most of what a quote depends on.',
      },
      {
        title: 'I confirm a window',
        body: 'You get a specific arrival window, not a full day of waiting. Monday to Saturday, 8am to 8pm, and I confirm requested times personally rather than through a call center.',
      },
      {
        title: 'I build it in place',
        body: 'I assemble in the room where the piece will live so nothing has to be carried through a doorway afterwards. Floors get protected, and the piece is leveled and anchored where anchoring applies.',
      },
      {
        title: 'Boxes leave with me',
        body: 'Cardboard and foam are flattened and taken out. You are left with furniture that is finished and a room you can use, not a pile of packaging in the hallway.',
      },
    ],
    faq: [
      {
        q: 'How long does furniture assembly usually take?',
        a: 'A nightstand or small bookshelf runs about 30 to 45 minutes. A standard bed frame or a six-drawer dresser is one to two hours. A full IKEA PAX wall or a large sectional is a half-day. Playsets and sheds are usually a full day. Once I know the exact model I can give you a real number rather than a range.',
      },
      {
        q: 'Do I need to unbox everything before you arrive?',
        a: 'No, and I would rather you did not. Boxes are packed in build order and opening them early tends to separate the hardware bags from the panels they belong to. Just have the boxes in or near the room where the furniture is going, and leave them sealed.',
      },
      {
        q: 'What if a part is missing or damaged in the box?',
        a: 'It happens more often than people expect. I check the parts list before starting where the manual provides one. If something is missing I will tell you the exact part number to request from the retailer, build everything that can be built, and come back to finish once the part arrives.',
      },
      {
        q: 'Do you anchor furniture to the wall?',
        a: 'Yes, and on anything tall or top-heavy I recommend it strongly, particularly dressers and wardrobes in rooms with young children. I carry stud-appropriate and drywall-appropriate anchors and will pick the right one for your wall rather than using whatever came in the box.',
      },
      {
        q: 'Can you take the old furniture apart too?',
        a: 'Yes. Disassembly is a common request during moves and before deliveries, and it is often booked together with assembly of the replacement piece on the same visit. I do not haul away the old furniture, but I will break it down so it fits in a truck or a dumpster.',
      },
      {
        q: 'Which areas do you cover?',
        a: 'Massachusetts, Rhode Island and Connecticut. I am based in Fall River, so southeastern Massachusetts and the Providence area are the fastest to schedule. Anywhere further out is still available, just tell me the town and I will confirm timing honestly.',
      },
    ],
    whatsappMessage:
      "Hi Julio, I need furniture assembled. Here's what I've got:",
    relatedServiceSlugs: [],
    relatedProblemSlugs: [],
  },

  {
    slug: 'fitness-equipment-assembly',
    name: 'Fitness Equipment Assembly',
    shortName: 'Fitness',
    order: 2,
    published: true,
    seo: {
      title: 'Fitness Equipment Assembly in MA, RI, CT | Aplus Assemblers',
      description:
        'Treadmills, Peloton bikes, ellipticals, rowers and power racks assembled and leveled in your home. Covering MA, RI and CT.',
      primaryKeyword: 'fitness equipment assembly',
    },
    h1: 'Fitness Equipment Assembly and In-Home Installation',
    intro: [
      'Home gym equipment is the hardest category of flat-pack there is, and it is the one where a bad build has consequences. A treadmill deck that is not level will wear the belt on one side. A power rack that is not plumb will bind when you re-pin the safeties. A cable machine strung with the pulleys out of sequence will feel gritty forever and the manufacturer will not warranty it. These are machines you load with your bodyweight and then some.',
      'The other problem is simply mass. A commercial-grade treadmill is 250 to 350 pounds in one crate, and it arrives on a pallet at the curb because that is what freight delivery means. Getting it up a flight of stairs is a separate job from building it, and it is the part people underestimate. I do both, and I will tell you honestly before I come out whether your staircase can take a given machine at all.',
      'I assemble to the manufacturer torque specs, level the finished machine against the floor rather than the frame, run the calibration or firmware setup where the unit has one, and test it under load before I leave.',
    ],
    subcategories: [
      {
        name: 'Treadmills',
        blurb:
          'NordicTrack, Sole, ProForm, Horizon and similar. Deck leveled, belt tracked and tensioned, console firmware updated where applicable. Belt tracking is the single most common reason a new treadmill sounds wrong.',
      },
      {
        name: 'Exercise bikes',
        blurb:
          'Peloton, Echelon, Schwinn and spin bikes generally. Pedals threaded correctly is not a small detail here — the left pedal is reverse-threaded and cross-threading it ruins the crank arm, not just the pedal.',
      },
      {
        name: 'Ellipticals',
        blurb:
          'Front and rear-drive ellipticals. These have the highest part count in the category and the console wiring runs through the mast, so it has to be routed before the covers close or the whole assembly comes back apart.',
      },
      {
        name: 'Rowing machines',
        blurb:
          'Concept2, WaterRower and magnetic rowers. Straightforward builds, but rail alignment and monitor arm mounting decide whether the stroke feels smooth, and the two-piece models need their joint seated fully.',
      },
      {
        name: 'Power racks and squat racks',
        blurb:
          'REP, Rogue, Titan and similar. Bolts stay finger-tight until the whole frame is standing and squared, then get torqued in sequence. Racks that go up fully tightened one bolt at a time end up out of plumb.',
      },
      {
        name: 'Multi-station home gyms',
        blurb:
          'Bowflex, Marcy, Body-Solid and cable stacks. The cable routing is the whole job — a single pulley taken out of order means unthreading the entire run, which is why these take longer than the box claims.',
      },
      {
        name: 'Smart mirrors and wall-mounted units',
        blurb:
          'Tonal, Mirror and wall-anchored trainers. These are load-bearing wall installations, not hangings. Tonal in particular pulls hundreds of pounds off the wall and must land on studs with the manufacturer bracket.',
      },
      {
        name: 'Adjustable dumbbells and storage',
        blurb:
          'Bowflex SelectTech, PowerBlock, weight trees and plate storage. Quick to assemble, but worth having the racks positioned and secured properly before you start loading plates onto them.',
      },
    ],
    howItWorks: [
      {
        title: 'Send me the model and the location',
        body: 'The exact model tells me the weight and part count. Whether it is going in a basement, a second-floor room or a garage tells me the access problem. Those two things decide the quote.',
      },
      {
        title: 'We sort out the stairs first',
        body: 'If the machine has to go up or down a flight, we settle that before scheduling. Some units come apart for the stairs and reassemble at the top; some do not, and I will say so rather than find out on the day.',
      },
      {
        title: 'Build to spec, then level',
        body: 'Assembled in the room it lives in, torqued to the manufacturer figures, then leveled against the floor. Basement slabs are rarely flat, and leveling to the frame instead of the floor is a common shortcut that causes belt wear.',
      },
      {
        title: 'Tested before I leave',
        body: 'The machine gets powered up, calibrated where it has a calibration routine, and run under load. You watch it work before I pack up, and the crate and packaging go out with me.',
      },
    ],
    faq: [
      {
        q: 'Can you get a treadmill up to a second floor or down to a basement?',
        a: 'Usually yes, but it depends on the machine and the staircase. Narrow turns, low ceilings and open stringers are the limiting factors, not the weight alone. Send me a photo of the stairs and the model number and I will tell you before booking whether it fits, including if the answer is no.',
      },
      {
        q: 'Do you assemble Peloton bikes?',
        a: 'Yes. Both the Bike and the Bike+, and the Tread. The build itself is quick — the parts that matter are threading the pedals correctly, seating the monitor cable before the shroud closes, and leveling the stabilisers so the bike does not rock under a hard standing effort.',
      },
      {
        q: 'Will assembly by a third party void my warranty?',
        a: 'For the manufacturers I see most often it does not, as long as the unit is built to the published instructions with the supplied hardware, which is how I build. Warranty terms do vary by brand, so if yours is a concern check your specific documentation and I am happy to work to whatever it requires.',
      },
      {
        q: 'My equipment came on a pallet at the curb. Can you move it inside?',
        a: 'Yes. Freight carriers deliver to the curb and nothing more, which surprises a lot of people. Tell me when the delivery is landing and I can uncrate at the curb, bring the components in separately, and build inside — which is far easier than moving an assembled machine.',
      },
      {
        q: 'Can you mount a Tonal or a wall-mounted trainer?',
        a: 'Yes. That is a structural wall installation and it is treated as one: studs located and confirmed, the manufacturer mounting bracket used as supplied, and lag bolts driven to spec. On plaster or masonry walls the approach changes, so tell me your wall type upfront.',
      },
    ],
    whatsappMessage:
      'Hi Julio, I need fitness equipment assembled. Model and where it is going:',
    relatedServiceSlugs: [],
    relatedProblemSlugs: [],
  },

  {
    slug: 'tv-mounting',
    name: 'TV Mounting',
    shortName: 'TV Mounting',
    order: 3,
    published: true,
    seo: {
      title: 'TV Mounting in MA, RI & CT | Aplus Assemblers',
      description:
        'Fixed, tilting and full-motion mounts on drywall, brick, concrete and stone. Cables hidden in the wall. Serving MA, RI and CT.',
      primaryKeyword: 'tv mounting service',
    },
    h1: 'TV Mounting on Drywall, Brick, Concrete and Stone',
    intro: [
      'A mounted TV is one of the few home jobs where the failure mode is a large glass panel hitting the floor. The bracket is almost never the weak point — the wall is, and so is the fastener chosen for it. Drywall anchors rated for a picture frame get used on 65-inch televisions constantly, and they hold, right up until the day someone tilts the screen.',
      'What I do differently is start with the wall. I find and confirm the studs rather than trusting a stud finder reading through a thick plaster wall. On brick, block and stone I drill into the masonry itself, not the mortar joint, and use sleeve anchors sized to the load. Older homes across southeastern Massachusetts and Rhode Island are full of lath-and-plaster walls where the stud spacing is not the 16 inches everyone assumes, and finding that out with a bracket already half-hung is a bad time.',
      'I also care where the screen ends up. Most TVs get mounted too high because the mount goes where the wall is convenient rather than where your eyes are when you are sitting down. I will tell you what the viewing height should actually be, and if you want it above a fireplace anyway, I will fit a tilting or pull-down mount so the geometry still works.',
    ],
    subcategories: [
      {
        name: 'Fixed, tilting and full-motion mounts',
        blurb:
          'Choosing the right one matters more than the brand. Fixed sits closest to the wall, tilting solves glare and height, full-motion lets you angle into an adjacent room but needs a genuinely solid anchor because of the leverage.',
      },
      {
        name: 'Drywall with stud mounting',
        blurb:
          'The standard case, done properly: studs located and confirmed, lag bolts into solid wood, bracket leveled after loading rather than before. Screens rarely sit level if they are leveled empty.',
      },
      {
        name: 'Brick, concrete and stone',
        blurb:
          'Masonry walls need a hammer drill, the correct sleeve or wedge anchors, and holes in the brick face rather than the mortar. Fireplace surrounds and exposed brick in converted mill buildings are routine work around here.',
      },
      {
        name: 'Over-fireplace installations',
        blurb:
          'Doable, and often the only place a room allows. It needs a tilting or pull-down mount so the screen is not looking at the ceiling, plus heat clearance checked against the firebox and mantel depth.',
      },
      {
        name: 'In-wall cable concealment',
        blurb:
          'Power and HDMI routed inside the wall using recessed brackets so there is no cable visible and no surface raceway. Done to code with in-wall rated cable, not an extension lead buried in the drywall.',
      },
      {
        name: 'Soundbar mounting',
        blurb:
          'Soundbars mounted directly under the screen, aligned to the TV rather than to the wall so the whole assembly reads as one unit, with the cable run concealed alongside the TV feed.',
      },
      {
        name: 'Multi-monitor and display walls',
        blurb:
          'Office and gaming setups with two or more panels on arms or a shared rail. The rail has to be dead level across its whole length or the misalignment between panels is visible from across the room.',
      },
    ],
    howItWorks: [
      {
        title: 'Send a photo of the wall',
        body: 'A photo of the wall and the TV size tells me most of what I need. What I am looking for is wall construction, whether there is a fireplace involved, and where the nearest outlet sits.',
      },
      {
        title: 'We agree the height before I drill',
        body: 'I mark the position and you sit down and look at it. Once the holes are in the wall the decision is made, so it gets made while it is still reversible.',
      },
      {
        title: 'Mounted, leveled and cables run',
        body: 'Anchored into stud or masonry as the wall requires, screen leveled with the TV hanging on it, and cables either concealed in the wall or dressed neatly if in-wall is not an option.',
      },
      {
        title: 'Tested with your devices connected',
        body: 'Sources plugged in and picture confirmed before I leave, tilt and swing tested through their full range so nothing binds against the wall or the cables.',
      },
    ],
    faq: [
      {
        q: 'Can you mount a TV on a brick or concrete wall?',
        a: 'Yes, and it is one of the more common requests I get, particularly in converted mills and older homes with exposed chimney breasts. It needs a hammer drill and sleeve anchors set into the brick face rather than the mortar joints — mortar is much softer and will not hold under the leverage a mount applies.',
      },
      {
        q: 'How high should a TV be mounted?',
        a: 'Center of the screen roughly at eye level when you are seated, which for most living rooms puts the middle of the TV around 42 to 48 inches off the floor. That is lower than most people expect and lower than most TVs end up. If the mount has to go higher, a tilting bracket brings the picture back down to you.',
      },
      {
        q: 'Can you hide the cables inside the wall?',
        a: 'On a standard interior drywall wall, yes, using recessed power and low-voltage brackets so nothing is visible. On masonry or an exterior wall with insulation it is often not practical, and in those cases a paintable raceway is the honest answer. I will tell you which one you have before booking.',
      },
      {
        q: 'Do you provide the mount or should I buy one?',
        a: 'Either works. If you already have one, send me a photo of the box and I will confirm it is rated for your screen size and weight before the visit. If you would rather I sourced it, tell me the TV model and how you want it to move and I will bring one that fits.',
      },
      {
        q: 'Is mounting a TV over a fireplace a bad idea?',
        a: 'It is a compromise rather than a mistake. The two real issues are neck strain from viewing angle and heat rising from the firebox. A tilting or pull-down mount handles the angle, and I check clearance above the mantel against the manufacturer figures. With a working wood-burning fireplace I will give you a straight opinion about the heat.',
      },
    ],
    whatsappMessage:
      'Hi Julio, I need a TV mounted. Screen size and wall type:',
    relatedServiceSlugs: [],
    relatedProblemSlugs: [],
  },

  {
    slug: 'handyman-services',
    name: 'Handyman Services',
    shortName: 'Handyman',
    order: 4,
    published: true,
    seo: {
      title: 'Handyman Services in MA, RI & CT | Aplus Assemblers',
      description:
        'Picture hanging, curtain rods, blinds, floating shelves, door adjustments, furniture anchoring and small repairs. Booked by the hour in MA, RI and CT.',
      primaryKeyword: 'handyman services',
    },
    h1: 'Handyman Services for the Jobs That Keep Getting Postponed',
    intro: [
      'Most households have a list. A curtain rod still in its packaging, a door that catches on the frame, three pictures leaning against a wall waiting to be hung, a floating shelf nobody trusts to hold anything. Individually none of these is worth a Saturday. Collectively they sit there for a year.',
      'This is the service for that list. You book a block of time, we work down the list in order of what matters most to you, and the things that have been annoying you get finished in one visit. It is more efficient for both of us than treating each one as a separate call-out, and it means the small stuff actually gets done instead of being permanently outranked by bigger jobs.',
      'I bring a stud finder, a laser level, anchors for every common wall type, and the drill bits that the job actually needs. That is usually the reason a small job stalls at home — not the difficulty, just not owning the one tool that makes it a ten-minute task instead of an afternoon.',
    ],
    subcategories: [
      {
        name: 'Picture and mirror hanging',
        blurb:
          'Single pieces, gallery walls and heavy framed mirrors. Gallery walls get laid out and leveled as a group before anything goes in the wall, so the spacing is consistent rather than corrected hole by hole.',
      },
      {
        name: 'Curtain rods and blinds',
        blurb:
          'Rods, tracks, roman shades and blinds cut to fit. Brackets land in stud or proper anchor — curtain hardware carries more weight than people think once you hang lined drapes on it and then pull them daily.',
      },
      {
        name: 'Door adjustment and repair',
        blurb:
          'Doors that stick, drag on carpet, swing open on their own or will not latch. Usually hinge or strike plate adjustment rather than a new door, and in older homes it is often the frame that has moved, not the door.',
      },
      {
        name: 'Floating shelf installation',
        blurb:
          'The shelf everyone is afraid to put anything on. Floating shelves live or die on the concealed bracket hitting solid framing, and the rated load drops enormously when it does not.',
      },
      {
        name: 'Baby-proofing and furniture anchoring',
        blurb:
          'Anti-tip straps on dressers and bookcases, cabinet latches, and gates fitted to the actual opening. Furniture tip-overs are a real hazard, and the strap in the box is usually the weakest part of it.',
      },
      {
        name: 'Small repairs',
        blurb:
          'Loose handrails, cabinet hardware, towel bars pulling out of the wall, drawer slides, wobbling table legs. The repeat offender is anything that was originally fixed into drywall with no anchor at all.',
      },
    ],
    howItWorks: [
      {
        title: 'Send me the list',
        body: 'Write out everything, even the items you think are too small to mention. Small items are the cheapest ones to add once I am already there with the tools out.',
      },
      {
        title: 'I estimate the block',
        body: 'From the list I tell you roughly how much time it takes and what it costs. If something on the list is bigger than it sounds, I flag it upfront rather than discovering it on the clock.',
      },
      {
        title: 'We work top down',
        body: 'Highest priority first, so if the list turns out optimistic the things you care about are already done. Anything left over gets an honest estimate for a return visit.',
      },
    ],
    faq: [
      {
        q: 'Is there a minimum booking?',
        a: 'Yes, small jobs are booked in a minimum block because the travel is the same whether the job takes ten minutes or ninety. That is exactly why it makes sense to save items up and do several at once rather than calling me out for a single curtain rod.',
      },
      {
        q: 'What kinds of small jobs do people book most often?',
        a: 'Gallery walls and heavy mirrors, curtain rods and blinds, doors that stick or will not latch, floating shelves, anti-tip anchoring on dressers and bookcases, and the loose handrail or towel bar that has been pulling out of the wall for a year. Most people book three or four of these together.',
      },
      {
        q: 'Do you supply materials and hardware?',
        a: 'I carry anchors, screws, brackets and standard fixings, and those come with me. Anything specific to your job — a particular curtain rod, a shelf, a replacement handle — is better bought by you so you get the finish you want, or tell me the exact item and I can pick it up.',
      },
      {
        q: 'Can you hang things on plaster walls?',
        a: 'Yes, and a lot of housing stock around here is lath and plaster rather than drywall. Plaster is brittle and cracks if you drive into it carelessly, so it needs pilot holes and the right anchor. It also throws off cheap stud finders, which is why I confirm framing rather than trusting a first reading.',
      },
      {
        q: 'How far in advance do I need to book?',
        a: 'Usually a few days, sometimes same week. Monday to Saturday, 8am to 8pm. Message me with what you need and I will give you a real window rather than a vague promise — I schedule my own work, so what I tell you is what I have.',
      },
    ],
    whatsappMessage: 'Hi Julio, I have a few small jobs around the house:',
    relatedServiceSlugs: [],
    relatedProblemSlugs: [],
  },

  {
    slug: 'finish-carpentry',
    name: 'Finish Carpentry',
    shortName: 'Carpentry',
    order: 5,
    published: true,
    seo: {
      title: 'Finish Carpentry in MA, RI & CT | Aplus Assemblers',
      description:
        'Baseboards, crown molding, door and window casing, wainscoting and trim repair. Clean joints, tight miters, painted-ready finish. MA, RI and CT.',
      primaryKeyword: 'finish carpentry',
    },
    h1: 'Finish Carpentry: Trim, Molding and Casing Done Cleanly',
    intro: [
      'Finish carpentry is the work you see every day without looking at it. When it is done well nobody notices; when it is done badly it is the first thing a visitor registers, even if they could not name what is wrong. It is almost always the joints — a miter that opened up, a baseboard that follows a bowed wall instead of correcting for it, casing that is a hair out of square against the door.',
      'The reason this work is difficult is that no house is square. Walls bow, floors slope, and door frames settle out of plumb, particularly in New England housing stock that has been standing for a hundred years. Cutting trim to the number on the tape measure gives you gaps. The skill is reading how far out the room actually is and cutting to compensate, which is a matter of experience rather than tools.',
      'I do interior trim work: baseboards, crown, casing, wainscoting and panel detail, plus repairs to existing trim that has been damaged or badly patched. I leave it filled, sanded and ready for paint, or I can work to an existing painted finish and match the profile so the new run reads as original.',
    ],
    subcategories: [
      {
        name: 'Interior doors',
        blurb:
          'Hanging pre-hung and slab doors, shimming the jamb plumb, and setting reveals even on all three sides. In an older house the opening is rarely square, and the shimming is where the whole job is won or lost.',
      },
      {
        name: 'Window and door casing',
        blurb:
          'Casing installed with tight miters and consistent reveals. Where the frame has settled out of square, the miters get cut to the actual angle rather than to 45 degrees, which is what keeps the corner closed.',
      },
      {
        name: 'Baseboards and crown molding',
        blurb:
          'Long runs scarfed on studs so joints do not open with seasonal movement, inside corners coped rather than mitered so they stay closed, and outside corners cut to the real wall angle.',
      },
      {
        name: 'Wainscoting and wall panels',
        blurb:
          'Board and batten, raised panel and shaker-style paneling. Layout comes first: batten spacing set out across the whole wall so the two ends match, rather than starting at one corner and letting the last panel land wherever.',
      },
      {
        name: 'Trim repair and matching',
        blurb:
          'Damaged, water-stained or previously butchered trim replaced in sections. Older profiles are rarely available off the shelf, so matching means finding the nearest stock profile and adapting it to read the same.',
      },
    ],
    howItWorks: [
      {
        title: 'Walk the room with me',
        body: 'Photos work for a quote, but for trim I want to know the room: ceiling height, existing profiles, and how far out of square things are. That is what determines the material list and the time.',
      },
      {
        title: 'Material and profile decided first',
        body: 'We settle the profile, the material and whether we are matching existing trim or setting a new standard for the room before anything is ordered, because a profile change halfway through means starting over.',
      },
      {
        title: 'Cut and fit on site',
        body: 'Everything is cut in place against the actual walls. Coped inside corners, scarfed long runs, nails set below the surface.',
      },
      {
        title: 'Filled, sanded, ready for paint',
        body: 'Nail holes filled, joints caulked where caulk belongs, surfaces sanded. You get it painted-ready, and offcuts and dust go with me.',
      },
    ],
    faq: [
      {
        q: 'Do you paint the trim as well?',
        a: 'I leave it filled, caulked and sanded so it is ready for paint, which is the natural handoff point. If you want it finished I can prime and paint straightforward runs, but for a whole-house repaint you are better served by a painter — that is their trade and they will be faster and cheaper at it than I will.',
      },
      {
        q: 'Can you match the existing trim in an older house?',
        a: 'Usually yes, and it is a common request in this area given the age of the housing. Exact original profiles from the early 1900s are generally not manufactured anymore, so matching means finding the closest available profile and adjusting it. Send me a photo of a cut end and I can tell you how close we will get.',
      },
      {
        q: 'Why do my baseboard corners keep opening up?',
        a: 'Almost always because the inside corners were mitered rather than coped. A mitered inside corner opens as soon as the wood moves with the seasons, which in New England it will. A coped joint has one piece cut to the profile of the other, so it stays visually closed even when the material shifts.',
      },
      {
        q: 'How much trim work can you do in a day?',
        a: 'A single room of baseboard is typically most of a day including cutting, fitting and filling. Crown molding is slower because every corner is a compound angle. Casing a door is about an hour and a half once the door itself is hung correctly. Give me the room count and I will give you a real schedule.',
      },
    ],
    whatsappMessage: 'Hi Julio, I need some trim and carpentry work done:',
    // Trim, doors and baseboards are the same job one stage later.
    relatedServiceSlugs: ['painting'],
    relatedProblemSlugs: [],
  },

  {
    slug: 'custom-cabinetry',
    name: 'Custom Cabinetry',
    shortName: 'Cabinetry',
    order: 6,
    published: true,
    seo: {
      title: 'Custom Cabinetry in MA, RI & CT | Aplus Assemblers',
      description:
        'Kitchen cabinet installation, built-in shelving, closet build-outs, garage storage and cabinet door alignment across MA, RI and CT.',
      primaryKeyword: 'custom cabinetry installation',
    },
    h1: 'Custom Cabinetry and Built-In Storage',
    intro: [
      'Cabinets are the one part of a room where a sixteenth of an inch is visible from across the space. A run of uppers that is not dead level shows immediately in the gap along the ceiling line. Doors that are not adjusted show as inconsistent gaps between them, and that is the detail people notice in a kitchen without knowing why it looks unfinished.',
      'The work is mostly in the setup. Cabinets get hung off a level ledger line struck across the whole run, not measured down from a ceiling that is not level either. Boxes get shimmed to the high point of the floor and scribed to the wall. Face frames get clamped and joined so the fronts sit in one plane. All of that happens before a single door goes on, and it is what determines whether the finished job looks built-in or bolted-on.',
      'I install stock and semi-custom cabinetry, build closet and garage storage to fit the actual space, and I do the unglamorous job nobody else wants: going through an existing kitchen and getting every door and drawer front aligned again. That last one takes a couple of hours and changes how the whole room reads.',
    ],
    subcategories: [
      {
        name: 'Kitchen cabinet installation',
        blurb:
          'Stock and semi-custom boxes hung to a struck level line, shimmed to the floor high point, scribed to the wall and joined face frame to face frame. Fillers and toe kicks cut on site to the real dimensions.',
      },
      {
        name: 'Built-in shelving',
        blurb:
          'Alcove built-ins, window seats and library walls built to the opening rather than dropped into it. Depth and shelf spacing set to what you are actually storing instead of a default that fits nothing well.',
      },
      {
        name: 'Closet build-outs',
        blurb:
          'Hanging, shelving and drawer banks planned around your clothes rather than a catalogue layout. Double-hang and long-hang zones sized properly, everything anchored to framing because loaded closets are heavy.',
      },
      {
        name: 'Garage and mudroom storage',
        blurb:
          'Wall cabinets, bench and locker units, overhead storage. Garage walls are often unfinished block or single-layer drywall on the wrong side of a firewall, so anchoring is chosen for what is actually there.',
      },
      {
        name: 'Cabinet door alignment and hardware',
        blurb:
          'Existing kitchens brought back into line: European hinges adjusted on all three axes, soft-close mechanisms serviced, drawer fronts trued, knobs and pulls installed to a consistent template.',
      },
    ],
    howItWorks: [
      {
        title: 'Measure the space properly',
        body: 'I measure the room, check the walls for plumb and the floor for level, and note where the studs sit and where any pipes or cables run behind them. Those numbers drive the layout and are worth getting right before ordering.',
      },
      {
        title: 'Plan the layout together',
        body: 'We settle what goes where, how deep, and where the fillers fall. If you are ordering the cabinets, I will confirm the sizes against the real measurements before you place the order.',
      },
      {
        title: 'Install off a level line',
        body: 'A level line struck across the full run, uppers hung to it, bases shimmed and scribed. Nothing gets referenced from the ceiling or the floor, because neither one is straight.',
      },
      {
        title: 'Align every door and drawer',
        body: 'Hinges adjusted so gaps are consistent across the run, drawers set to close square, hardware fitted to a template. This is the step that gets skipped and the one that shows.',
      },
    ],
    faq: [
      {
        q: 'Do you build the cabinets or install ones I buy?',
        a: 'Mainly installation, plus site-built work like alcove built-ins, closet systems and garage storage that I make to fit the opening. For a kitchen you are almost always better off buying stock or semi-custom boxes and having them installed properly — the money is better spent on installation quality than on site-building boxes.',
      },
      {
        q: 'Can you just fix the doors on my existing kitchen?',
        a: 'Yes, and it is one of the most worthwhile small jobs there is. Modern European hinges adjust in three directions, so doors that have drifted out of line can nearly always be brought back rather than replaced. A full kitchen typically takes two to three hours and looks dramatically better afterwards.',
      },
      {
        q: 'How long does a kitchen cabinet install take?',
        a: 'A typical kitchen of ten to fifteen boxes is two to three days: a day for uppers, a day for bases and fillers, and a final pass for doors, drawers and hardware. Removing an old kitchen first adds time, and so does a wall that turns out to be significantly out of plumb.',
      },
      {
        q: 'Do you do countertops?',
        a: 'No. Stone and solid-surface countertops are templated and fabricated by specialist shops with the right equipment, and that is who should cut them. I install the cabinets level and square so the template comes out right, and I coordinate around the fabricator so the schedule works.',
      },
    ],
    whatsappMessage: 'Hi Julio, I need cabinetry work. Here is the space:',
    // Whoever does not want to replace the cabinets wants them repainted.
    relatedServiceSlugs: ['painting'],
    relatedProblemSlugs: [],
  },

  {
    slug: 'painting',
    name: 'Painting',
    shortName: 'Painting',
    order: 7,
    published: true,
    seo: {
      title: 'Interior Painting in MA, RI & CT | Aplus Assemblers',
      description:
        'Interior rooms, ceilings, trim and doors, accent walls and cabinet refinishing. Proper prep, clean lines, no drips on your floors. MA, RI and CT.',
      primaryKeyword: 'interior painting service',
    },
    h1: 'Painting, With the Prep Work Actually Done',
    intro: [
      'Painting is mostly preparation, and the paint is the short part at the end. The gap between a room that still looks sharp in eight years and one that shows every flaw by the second week is entirely in the stage nobody photographs: filling and sanding, caulking the seam where trim meets wall, spot-priming bare patches and scuffing glossy surfaces so the topcoat has something to grip. Rolling straight over all of that is quicker on the day and visibly wrong by the following month.',
      'Inside, I do rooms and whole homes, ceilings, trim, doors and baseboards, and accent walls. I also refinish cabinets, which is the highest-value painting job in most houses — a kitchen with sound boxes and dated doors can be transformed for a fraction of what replacing it costs, provided the doors are degreased, sanded and sprayed or brushed with a finish made for cabinetry rather than wall paint. Outside, I take on trim, decks and fences.',
      'Furniture gets moved and covered, floors get protected, and edges get cut in by hand where a steady line beats masking tape. I clean up at the end of each day, so you are not living around a half-finished room for a week.',
    ],
    subcategories: [
      {
        name: 'Interior painting',
        blurb:
          'Single rooms through to a whole home. Walls cut in by hand at the ceiling and trim lines, two coats as standard, and the sheen chosen for the room — flat hides wall imperfections, eggshell survives being wiped down in a hallway.',
      },
      {
        name: 'Accent walls',
        blurb:
          'One wall in a deeper color, which is the cheapest way to change how a room reads. Dark colors over light need an extra coat and a tinted primer, otherwise the old color ghosts through at the edges for the life of the paint.',
      },
      {
        name: 'Trim, doors and baseboards',
        blurb:
          'The slowest part of any interior job and the part people judge it by. Trim gets sanded, filled and caulked before anything is applied, and doors come off their hinges where the finish justifies it so the edges are done properly.',
      },
      {
        name: 'Ceilings',
        blurb:
          'Flat white ceilings, and cutting the line where ceiling meets wall so it is straight rather than approximately straight. Water-stained patches get sealed with a stain-blocking primer first — plain paint over a stain lets it bleed back through.',
      },
      {
        name: 'Cabinet painting and refinishing',
        blurb:
          'Doors and drawer fronts removed, labeled, degreased, sanded and finished off the frame, boxes done in place. This is the job that makes a dated kitchen look new for a fraction of a replacement, and the prep is what makes it last.',
      },
      {
        name: 'Wall prep, patching and priming',
        blurb:
          'Nail holes, dents, cracked corner bead and the patch left behind by a removed shelf. Filled, sanded flush and spot-primed so the repair does not flash through the topcoat as a dull patch in raking light.',
      },
      {
        name: 'Exterior trim, decks and fences',
        blurb:
          'Trim, railings, deck boards and fencing — scraped, sanded and coated with an exterior product. Timed for a dry stretch with overnight temperatures the paint can actually cure in, which in New England narrows the calendar considerably.',
      },
    ],
    howItWorks: [
      {
        title: 'Walk the space with me',
        body: 'Paint quotes given from a photo are guesses. I need to see the wall condition, the trim profile and how many cut lines there are, because those decide the hours far more than the square footage does.',
      },
      {
        title: 'The prep sets the price',
        body: 'I tell you what the surfaces need before we talk color. If a room needs three hours of filling and sanding, you hear that upfront rather than watching the estimate move once the work has started.',
      },
      {
        title: 'Prime, cut, roll',
        body: 'Repairs and bare areas primed, edges cut in by hand, then rolled. Two coats as standard, three when a dark color is going over a light one, which is a genuine cost difference rather than an upsell.',
      },
      {
        title: 'Cleaned up daily',
        body: 'Covers lifted, floors cleared and the room left usable at the end of each day. On the last day we walk it together in daylight and I fix whatever you point at before I pack up.',
      },
    ],
    faq: [
      {
        q: 'Can you paint my kitchen cabinets instead of replacing them?',
        a: 'Yes, and if the boxes are solid it is the best money you can spend on a kitchen. Doors and drawer fronts come off and get degreased, sanded and finished properly, which is the whole job — kitchen cabinets carry grease that ordinary cleaning does not remove, and anything applied over it will chip at the handles within months.',
      },
      {
        q: 'How many coats do you apply?',
        a: 'Two as standard, over a spot-primed surface. Going dark over light, or covering a strong color like a deep red, realistically needs a tinted primer plus two coats, and sometimes three. I will tell you which one your job is when I see it rather than discovering it halfway through.',
      },
      {
        q: 'Do I need to move my furniture out?',
        a: 'No. Move anything small and breakable, and I will shift the larger pieces to the middle of the room and cover them. For a whole-home job it is easier if rooms are cleared, but for a single room it is normal to work around what is there.',
      },
      {
        q: 'How soon can I use the room again?',
        a: 'Modern water-based paints are touch dry in a couple of hours and you can put a room back into use the same evening. Full cure — the point where the finish is properly hard — takes two to three weeks, so go easy on scrubbing walls or stacking things against fresh trim until then.',
      },
      {
        q: 'Do you supply the paint?',
        a: 'Either way works. Most people pick their colors and I collect the paint, or you buy it yourself if you already have a brand you trust. I will tell you the quantity and the sheen you need for each surface so you are not left with four unopened gallons.',
      },
    ],
    whatsappMessage: 'Hi Julio, I need painting done. Here is the space:',
    // Trim and cabinet doors are the two natural bridges into this service.
    relatedServiceSlugs: ['finish-carpentry', 'custom-cabinetry'],
    relatedProblemSlugs: [],
  },
];

export const services: Service[] = z
  .array(serviceSchema)
  .parse(raw)
  .sort((a, b) => a.order - b.order);

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                    */
/* -------------------------------------------------------------------------- */

const byslug = new Map(services.map((s) => [s.slug, s]));

export function getService(slug: string): Service | undefined {
  return byslug.get(slug);
}

/**
 * The build-visible set. In `astro dev` everything renders so drafts can be
 * previewed; in `astro build` only published entries are emitted, which is what
 * keeps unpublished pages out of dist/ and therefore out of the sitemap.
 */
export const publishedServices: Service[] = import.meta.env.DEV
  ? services
  : services.filter((s) => s.published);
