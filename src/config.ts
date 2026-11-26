// njeik.dev is being purchased; tebi@njeik.dev will forward to the real inbox via email forwarding.
export const SITE_URL = "https://njeik.dev";

export const config = {
    developer: {
        name: "Tebi",
        fullName: "Tebi Njeik",
        title: "Full-Stack Developer",
        description: "Full-stack developer from Douala who builds web apps, business software and the occasional animation that makes people say 'ooh'."
    },
    social: {
        github: "wrench20",
        email: "tebi@njeik.dev",
        location: "Douala, Cameroon"
    },
    about: {
        title: "About Me",
        description: "I'm Tebi. Four years of building web and mobile apps with React, Next.js, Node, Angular, React Native and Odoo. Based in Douala, working at Stoneshed Asset Management. Off the clock: music, gaming and cycling, not always in that order.",
        facts: [
            { label: "Location", value: "Douala, Cameroon" },
            { label: "Experience", value: "4 yrs" },
            { label: "Languages", value: "EN / FR" },
            { label: "Currently", value: "At Stoneshed · open to work" }
        ]
    },
    experiences: [
        {
            position: "Software Engineer",
            company: "Stoneshed Asset Management",
            period: "2026 - Present",
            location: "Douala, Cameroon",
            description: "Odoo ERP rollout, end to end: onboarding, payroll, accounting and the integrations that make a lot of important numbers end up in the right place.",
            responsibilities: [],
            technologies: ["React", "Next.js", "Node.js", "Odoo"]
        },
        {
            position: "Lead Frontend Developer",
            company: "Fluide Technologies",
            period: "2025 - 2026",
            location: "Douala, Cameroon",
            description: "Led the frontend for eight months: turning designs into code, polishing the interface, and fixing whatever broke at the worst possible moment.",
            responsibilities: [],
            technologies: ["React", "Next.js", "Tailwind"]
        },
        {
            position: "Frontend Developer",
            company: "Instanvi",
            period: "2025 - 2025",
            location: "Douala, Cameroon",
            description: "Three months of turning designs into screens and keeping them running, one pixel and one bug at a time.",
            responsibilities: [],
            technologies: ["React", "JavaScript", "Tailwind"]
        },
        {
            position: "Software Intern",
            company: "Kings Software",
            period: "2024 - 2025",
            location: "Douala, Cameroon",
            description: "Six months of internship: first real codebase, first real deadlines, and a landing page I got to ship.",
            responsibilities: [],
            technologies: ["Next.js", "JavaScript"]
        },
        {
            position: "Freelance Developer",
            company: "Self-employed",
            period: "2023 - 2024",
            location: "Douala, Cameroon",
            description: "Where it started: freelance projects, learning on the job, and discovering that \"it works on my machine\" is not a deployment strategy.",
            responsibilities: [],
            technologies: ["JavaScript", "React", "WordPress"]
        }
    ],
    projects: [
        {
            id: 1,
            title: "LinAudit",
            category: "Audit / Platform",
            technologies: "Next.js · NestJS · PostgreSQL · Microsoft Graph · English & French",
            image: "/images/work/linaudit.webp",
            description: "Audit teams drown in paperwork. LinAudit gives enterprise clients one place to run their audits, in English or French, without waiting for pages to load.",
            link: "https://www.linaudit.com/"
        },
        // The two ERP cards name the sector, not the client: both clients asked to clear
        // their names first. Swap the titles in once they say yes. No link — the only
        // public URL for either is an Odoo login page.
        {
            id: 7,
            title: "Investment Firm ERP",
            category: "ERP / Odoo",
            technologies: "Odoo 19 Enterprise · Odoo.sh · Python · custom modules · payroll · portfolio sync",
            image: "/images/work/odoo-investment-erp.webp",
            description: "A regulated investment firm was running on paper registers and copy-paste. I rolled out Odoo solo, end to end: client onboarding that checks the KYC paperwork, automatic sync to the portfolio system, payroll that follows Cameroonian law and posts its own accounting, and website orders flowing straight in.",
            link: ""
        },
        {
            id: 8,
            title: "Petroleum & Retail ERP",
            category: "ERP / Odoo · in progress",
            technologies: "Odoo 19 Enterprise · multi-company · Python · custom modules · Docker",
            image: "/images/work/odoo-petroleum-erp.webp",
            description: "A fuel and convenience-store group had a freshly migrated Odoo that needed steadying, and stations run from a spreadsheet. I took over the hosting, built a station operations module (shifts, cash gaps, fuel deliveries), set up HR and payroll for two companies, and added session security.",
            link: ""
        },
        {
            id: 2,
            title: "Stoneshed Asset Management",
            category: "Finance / Web",
            technologies: "Next.js · Express · Odoo API · English & French · fund ticker · simulator",
            image: "/images/work/stoneshed-am.webp",
            description: "Investors want numbers fast, and a licensed fund manager has to look the part. This site shows fund values, news, publications and a simulator, in two languages.",
            link: "https://www.stoneshed-am.com/"
        },
        {
            id: 3,
            title: "Alcom Petroleum",
            category: "Energy / Web",
            technologies: "Next.js · English & French · price lists · news",
            image: "/images/work/alcom-petroleum.webp",
            description: "A petroleum distributor needed a website as dependable as its fuel. Customers can now browse services, lubricants, current prices and news without calling anyone.",
            link: "https://www.alcompetroleum.com/"
        },
        {
            id: 4,
            title: "Power Engineering SARL",
            category: "Engineering / Web",
            technologies: "Next.js · French · services · project showcase",
            image: "/images/work/power-engineering.webp",
            description: "An electrical, telecom and solar company needed to prove it's the real deal. Its three areas of expertise and past projects are now easy to find, in French.",
            link: "https://www.powerengineering-sarl.com/"
        },
        {
            id: 5,
            title: "J3 Logistics Group",
            category: "Logistics / Web",
            technologies: "Next.js · Express · MongoDB · careers · partner contact",
            image: "/images/work/j3-logistics.webp",
            description: "A last-mile delivery company needed one front door for partners and new hires. Safety, operations, careers and partner enquiries all live here.",
            link: "https://www.j3logisticsgroup.com/"
        },
        {
            id: 6,
            title: "SwiftPair Logistics",
            category: "Logistics / Concept",
            technologies: "Next.js · Express · MongoDB · shipment tracking · parcel quotes",
            image: "/images/work/swiftpair-logistics.webp",
            description: "A concept for a global freight company: get a quote, track a shipment and see 220+ destinations at a glance. No real client, just me having fun.",
            link: "https://www.swiftpairlogistics.com/"
        }
    ],
    // Shown in the "now playing" pill. Static: there is no Spotify API connection.
    nowPlaying: {
        title: "a lot",
        artists: "21 Savage, J. Cole",
        cover: "/images/now-playing.webp",
        url: "https://open.spotify.com/track/2t8yVaLvJ0RenpXUIAC52d"
    },
    contact: {
        email: "tebi@njeik.dev",
        github: "https://github.com/wrench20",
        whatsapp: "https://wa.me/237675510703",
        instagram: "https://instagram.com/njeik_20"
    },
    skills: {
        develop: {
            title: "FULL-STACK DEVELOPER",
            description: "Building web & mobile apps that actually feel good to use",
            details: "4 years shipping production web and mobile apps — React, Next.js, and React Native on the frontend, with an obsession for how the thing feels when you touch it. Equally comfortable in MERN and MEAN, and I sneak GSAP/Framer motion into almost everything I ship.",
            tools: ["React", "Next.js", "TypeScript", "Tailwind", "React Native", "Angular", "GSAP", "Framer Motion"]
        },
        design: {
            title: "ERP DEVELOPER",
            description: "Odoo customization that won't make you want to cry",
            details: "I build and customize Odoo modules for logistics and SME clients — fleet, dispatch, invoicing, the works — backed by Node.js/Express APIs and a MongoDB or MySQL database when the project needs one. Clean architecture, minus the boredom.",
            tools: ["Odoo", "Python", "PostgreSQL", "MySQL", "Node.js", "Express", "MongoDB", "Git"]
        },
        // Shown in What I Do's numbers strip, beside Experience and Languages (which are
        // read from about.facts so they only live in one place).
        proof: { value: "∞", label: "playlists" }
    }
};
