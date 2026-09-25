export type Project = {
  id: string; name: string; description: string; tags: string[]; url: string; private?: boolean;
};
export type Content = {
  site: { brand: string; title: string; kicker: string; heroTitle: string; heroText: string; dashboardLabel: string; footer: string };
  profile: { image: string; name: string; age: string; place: string; classGrade: string; role: string; goals: string[]; why: string[] };
  about: { title: string; subtitle: string; paragraphs: string[]; stats: {label:string; value:string}[] };
  hobbies: string[]; habits: string[];
  projects: Project[];
  plugins: Project[];
  cards: string[];
  connections: {name:string; handle:string; url:string}[];
  staffing: string[];
  cardsClosing: string;
  theme: { bg:string; panel:string; panel2:string; bar:string; ink:string; line:string; shadow:string; pink:string; cyan:string; purple:string };
  nav: { label:string; href:string }[];
};

export const defaultContent: Content = {
  site: {
    brand: 'LIVINGYUJI', title: 'LivingYuji — Developer', kicker: 'DEVELOPER • STUDENT • BUILDER',
    heroTitle: 'Hello, I am LivingYuji',
    heroText: 'I build digital experiences across Minecraft, Discord and the Web — from plugins and bots to websites, UI and branding.',
    dashboardLabel: 'OPEN DASHBOARD →', footer: 'Built by LivingYuji • Bots • Development • Branding • Web'
  },
  profile: {
    image: '', name:'LivingYuji', age:'17', place:'India', classGrade:'Class 12', role:'Student & Developer',
    goals:['Master something new','Ship more projects','Build things that matter','Keep learning'],
    why:['Take care of family','Build a future I am proud of','Create useful things','Never stop learning']
  },
  about: {
    title:'ABOUT ME', subtitle:'I build, learn and keep shipping.',
    paragraphs:["I’m LivingYuji — a student and developer focused on building polished digital experiences across the Web, Discord and Minecraft.","I work on websites, Discord bots, server systems, automation, UI, branding and Minecraft projects. Most of what I do starts as an idea and turns into something I can actually use.","I’m still learning, still experimenting and still improving — one project at a time."],
    stats:[{label:'age',value:'17'},{label:'role',value:'STUDENT + DEV'},{label:'focus',value:'WEB / DISCORD / MC'},{label:'things to learn',value:'∞'}]
  },
  hobbies:['Building websites','Developing Discord bots','Minecraft development','Designing interfaces','Working on personal projects','Learning new tech'],
  habits:['Clean UI','Late-night building','Pixel aesthetics','Automation','Trying new ideas','Shipping instead of overthinking'],
  projects:[
    {id:'craftra',name:'CRAFTRA MARKET',description:'Minecraft marketplace and creator community for texture packs, shaders, mods, maps and more.',tags:['Discord','Minecraft','Community'],url:'https://discord.gg/DqUErDbWyU'},
    {id:'riftn',name:'RIFT SMP',description:'Minecraft SMP project with custom gameplay systems, plugins and server-side development.',tags:['Minecraft','Java','SMP'],url:'#'},
    {id:'portfolio',name:'LIVINGYUJI PORTFOLIO',description:'This personal portfolio — a retro interface for my work, projects and digital identity.',tags:['Next.js','TypeScript','Web'],url:'#'}
  ],
  plugins:[
    {id:'discord-bots',name:'DISCORD BOTS',description:'Custom Discord bots, moderation systems, automation, tickets and community tools.',tags:['JavaScript','Discord'],url:'#'},
    {id:'minecraft-dev',name:'MINECRAFT DEVELOPMENT',description:'Minecraft plugins, server systems, gameplay mechanics and configuration.',tags:['Java','Minecraft'],url:'#'},
    {id:'plugin-development',name:'PLUGIN DEVELOPMENT',description:'Custom Minecraft plugins built for unique gameplay systems, commands, mechanics, automation and SMP experiences.',tags:['Java','Paper','Spigot'],url:'#'},
    {id:'web-dev',name:'WEB DEVELOPMENT',description:'Modern websites, portfolios and interactive interfaces with a focus on clean UX.',tags:['Next.js','Web'],url:'#'},
    {id:'branding',name:'BRANDING & UI',description:'Clean visual systems, logos, UI concepts and digital identity work.',tags:['Design','UI'],url:'#'}
  ],
  cards:[
    'Best moderation helper',
    'Active and reliable',
    'Always ready to help',
    'Ability to cooperate and assist with staff members',
    'Better eyes on staff (SMA / SM)',
    "I won't grow myself, I'll grow along with the community (SMA / SM)",
    "I'll provide active needs in influencers (MMA / MM)",
    'Every month, new events (MMA / MM)',
    'Choosing the best candidate for SOTM / SOTW (SMA / SM)',
    '...and many more'
  ],
  staffing:['Development','Discord Management','Minecraft Development','Plugin Development','Automation','Community Systems','Technical Support'],
  cardsClosing: "I'm not like the others who take a role like it's an award — if I'm picked for that role, I'll earn it myself.",
  connections:[
    {name:'GitHub',handle:'@livingyuji',url:'https://github.com/'},
    {name:'YouTube',handle:'@livingyuji',url:'https://youtube.com/'},
    {name:'Discord',handle:'LivingYuji',url:'https://discord.com/'},
    {name:'Instagram',handle:'@livingyuji',url:'https://instagram.com/'},
    {name:'X',handle:'@livingyuji',url:'https://x.com/livingyuji'}
  ],
  theme:{bg:'#c8c2d4',panel:'#dcd7e9',panel2:'#d2cbe2',bar:'#8d7ca9',ink:'#28243c',line:'#494064',shadow:'#4b4165',pink:'#bd4e75',cyan:'#55aeb1',purple:'#8e5fb5'},
  nav:[{label:'ABOUT',href:'#about'},{label:'HOBBIES',href:'#hobbies'},{label:'HABITS',href:'#habits'},{label:'PROJECTS',href:'#projects'},{label:'STAFFING',href:'#staffing'},{label:'CONNECTIONS',href:'#connections'}]
};
