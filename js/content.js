/*
 * Site content — edit this file to add, remove or reorder projects.
 *
 * type     'simulation' | 'game'      → which row it appears in on the home page
 * genres   any of 'XR', '3D', '2D'    → drives the filter chips above each row
 * tags     short labels shown on the card (platform, multiplayer, …)
 * youtube  YouTube video id, played in the project panel (poster is taken from it too)
 * preview  short muted clip played when hovering the card
 * poster   optional image, overrides the YouTube thumbnail
 * links    optional [{ label, url }]
 *
 * Routes:  /             → simulations row + games row (#xr, #3d, #2d, #xr&3d preselect genres)
 *          /xr           → every simulation + every XR game
 *          /simulations  → every simulation
 *          /games        → every game
 */
window.PORTFOLIO = {
    profile: {
        name: ['Abdelrahman', 'Soliman'],
        role: 'XR Developer',
        bio: [
            'I make training simulations people actually want to use and interactive work that sticks with you.',
            'I focus on <em>systems that scale</em> and <em>experiences that feel right</em>.'
        ],
        skills: ['C#', 'Unity', 'XR Interactions', 'System Design', 'Multiplayer', 'Optimization'],
        links: [
            { label: 'Email', url: 'mailto:abdelrahmann.soliman@gmail.com' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/abdrahmansoliman/' },
            { label: 'GitHub', url: 'https://github.com/AbdrahmanSoliman' }
        ]
    },

    projects: [
        /* ---------------- Simulations ---------------- */
        {
            title: 'Factory Maintenance',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Diagnose, repair, and fully reactivate industrial factory robots efficiently via interactive tablet workflow system.',
            features: ['Tablet-guided diagnostics and fault detection', 'Interactive part replacement system'],
            youtube: 'cacgNVqZdYQ',
            preview: '/media/xr-simulations/factory_maintenance_preview.mp4'
        },
        {
            title: 'Virtual Lab',
            type: 'simulation',
            genres: ['3D'],
            tags: ['WebGL'],
            summary: 'Comprehensive STEM education platform featuring multi-scenario experiments in different scientific fields.',
            features: ['Modular cross-platform simulation architecture', 'Optimized WebGL performance with significant build size reduction'],
            links: [{ label: 'Website', url: 'https://praxilabs.com/' }],
            youtube: 'WI0TnQPMxsQ',
            preview: '/media/xr-simulations/virtual_lab_preview.mp4'
        },
        {
            title: 'Handrail MR',
            type: 'simulation',
            genres: ['XR'],
            tags: ['MR'],
            summary: 'Mixed reality app for learning sign language through intuitive gesture recording and playback.',
            features: ['Real-time hand gesture capture pipeline with sign recording and replay'],
            links: [{ label: 'Deafness Forum Australia', url: 'https://deafnessforum.org.au/the-next-generation-may-communicate-differently/' }],
            youtube: 'enVtEG_rg8Q',
            preview: '/media/xr-simulations/handrail_mr_preview.mp4'
        },
        {
            title: 'Golden Chemistry',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Narrative-driven simulation blending environmental material extraction with precise, apparatus-based chemical synthesis.',
            features: ['Spatial manipulation system for precise apparatus assembly', 'Context-sensitive tutorial framework with audio-visual syncing'],
            youtube: 'zdwqDJ58f0w',
            preview: '/media/xr-simulations/golden_chemistry_preview.mp4'
        },
        {
            title: 'VR Classroom Simulation Template',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Published VR classroom simulation with a visual lesson sequencer and multi-language narration support.',
            features: ['Visual lesson sequencer with configurable step progression', 'Narration pipeline with subtitle sync and localization support'],
            links: [{ label: 'Unity Asset Store', url: 'https://assetstore.unity.com/packages/slug/386510' }],
            youtube: 'ICPwJNFfVY0',
            preview: '/media/xr-simulations/vr_classroom_simulation_template_preview.mp4'
        },
        {
            title: 'Food Processing Facility',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Industrial simulation focusing on workflow, safety, and spatial awareness.',
            features: ['Runtime environment editor via radial hand-menu interactions', 'Sequenced NPC guidance system with synchronized object highlighting'],
            youtube: 'bNAJMPt_C2I',
            preview: '/media/xr-simulations/food_processing_facility_preview.mp4'
        },
        {
            title: 'Engine Odyssey',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Educational adventure allowing users to disassemble complex engines and explore era-specific open worlds.',
            features: ['Recursive component disassembly system with nested inspection', 'Open-world scene optimization for seamless user experience'],
            youtube: 'irYmWT1nXds',
            preview: '/media/xr-simulations/engine_odyssey_preview.mp4'
        },
        {
            title: 'Pure Chemistry Lab',
            type: 'simulation',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Modern laboratory simulation featuring standard operating procedures and realistic chemical interactions.',
            features: ['Modular object interaction system with runtime constraint solving', 'Event-driven objective manager for non-linear procedural training'],
            youtube: 'lb9I-ww92iE',
            preview: '/media/xr-simulations/pure_chemistry_lab_preview.mp4'
        },

        /* ---------------- Games ---------------- */
        {
            title: 'Graveyard Shift',
            type: 'game',
            genres: ['3D'],
            tags: ['3D'],
            summary: 'Fast-paced combat adventure featuring deadly creatures, treacherous traps, and ancient artifacts.',
            features: ['Fast-paced 3D combat system', 'Complex environmental puzzles and trap mechanics'],
            links: [{ label: 'Download', url: 'https://drive.google.com/drive/folders/1Bvgy8dgTxYA8-d88y83-4Wuzp5ekoLtp?usp=sharing' }],
            youtube: '8Fvg4SALoC8',
            preview: '/media/games/graveyard_shift_preview.mp4'
        },
        {
            title: 'The Spoon',
            type: 'game',
            genres: ['XR'],
            tags: ['MR'],
            summary: 'The classic egg and spoon race reimagined in mixed reality: carry your egg through farm and kitchen levels while crows, toasters, kettles and fast trains do their best to knock it off.',
            features: [
                'Physics-driven spoon handling tuned for both hand tracking and controllers',
                'New twists across different levels, from egg-stealing crows and bunny hops to ship winds and swinging pendulums'
            ],
            youtube: 'ZRY8qizXcH8',
            preview: '/media/xr-simulations/the_spoon_preview.mp4'
        },
        {
            title: 'Project E',
            type: 'game',
            genres: ['3D'],
            tags: ['3D'],
            summary: 'Turn-based strategy experience with diverse units, intelligent AI encounters, and tactical combat.',
            features: ['Turn-based strategy system with unique unit abilities', 'Innovative action points management mechanics'],
            links: [{ label: 'Download', url: 'https://drive.google.com/drive/folders/1RViFxFpp_wd7hRDbrfjlD3YJ6yl5-VPQ?usp=sharing' }],
            youtube: '-fRQGhVgeEk',
            preview: '/media/games/project_e_preview.mp4'
        },
        {
            title: 'Megaplanet',
            type: 'game',
            genres: ['3D'],
            tags: ['3D', 'Multiplayer'],
            summary: 'Virtual world MMORPG allowing players to craft avatars, host events, and trade items in a social economy.',
            features: ['MMORPG avatar and room customization systems', 'Economy system for item trading and events'],
            youtube: 'XaPaKmrk-L8',
            preview: '/media/games/megaplanet_preview.mp4'
        },
        {
            title: 'Monster Catcher',
            type: 'game',
            genres: ['XR'],
            tags: ['VR'],
            summary: 'Behavior-shaping VR interactive experience designed to control customer flow through constrained daily reward cycles.',
            youtube: '4fAFDm3hT9k',
            preview: '/media/xr-simulations/monster_catcher_preview.mp4'
        },
        {
            title: 'World of Seeds',
            type: 'game',
            genres: ['3D'],
            tags: ['3D'],
            summary: "Cooperative cleaning and farming game where players must work together to regulate the planet's climate.",
            features: ['Cooperative gameplay mechanics enforcing teamwork', 'Environmental climate regulation system'],
            links: [{ label: 'Download', url: 'https://drive.google.com/drive/folders/1-6q9lx_WFGdsXsW461h3C42WL2Cp0Ngk?usp=sharing' }],
            youtube: 'T0xyS5s2bBQ',
            preview: '/media/games/world_of_seeds_preview.mp4'
        },
        {
            title: "Seafarer's Havoc",
            type: 'game',
            genres: ['2D'],
            tags: ['2D', 'Multiplayer'],
            summary: 'Explosive multiplayer naval adventure featuring cannon combat, resource scavenging, and bounty hunting.',
            features: ['Multiplayer deathmatch architecture (Solo & Team)', 'Economy-based ship repair and upgrade system'],
            links: [{ label: 'Download', url: 'https://drive.google.com/drive/folders/1U0IJX3xekCu535Vn1ns3DxFpbk-LnEsY' }],
            youtube: 'GNPwjSDJH6I',
            preview: '/media/games/seafarers_havoc_preview.mp4'
        },
        {
            title: 'Galactic Siege',
            type: 'game',
            genres: ['3D'],
            tags: ['3D', 'Multiplayer'],
            summary: 'Real-Time Strategy space battler focused on fleet command, technology research, and galactic conquest.',
            features: ['Real-time strategy unit management', 'Fleet building and technology research systems'],
            links: [{ label: 'Open Source', url: 'https://github.com/AbdrahmanSoliman/Galactic-Siege-Project' }],
            youtube: 'XyifUU0eAJY',
            preview: '/media/games/galactic_siege_preview.mp4'
        },
        {
            title: 'Bomberguy',
            type: 'game',
            genres: ['2D'],
            tags: ['2D', 'Multiplayer'],
            summary: 'Fast-paced maze battler where players strategically place bombs to outwit opponents and survive.',
            features: ['Multiplayer implementation (2-4 players)', 'Grid-based explosive logic and maze generation'],
            youtube: 'U4QFXJ-3DWc',
            preview: '/media/games/bomberguy_preview.mp4'
        },
        {
            title: 'Dark Hole',
            type: 'game',
            genres: ['3D'],
            tags: ['Mobile'],
            summary: 'City-swallowing arcade game where players grow their black hole by consuming everything in their path.',
            features: ['Physics-based destruction mechanics', 'Time-attack scoring system'],
            youtube: 'z2wefOEWvtM',
            preview: '/media/games/dark_hole_preview.mp4'
        },
        {
            title: 'Falling Letters',
            type: 'game',
            genres: ['2D'],
            tags: ['Mobile'],
            summary: 'Memory and reflex challenge requiring players to destroy falling letters in correct sequence.',
            features: ['Word memorization and pattern recognition logic', 'Reflex-based input mechanics'],
            youtube: 'sJxysh7zQp4',
            preview: '/media/games/falling_letters_preview.mp4'
        }
    ]
};
