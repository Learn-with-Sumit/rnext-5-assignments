const bcrypt = require("bcryptjs");
const { db, initDb } = require("./db");

const seed = async () => {
    console.log(
        "Seeding SQLite3 database with 20 events, 5 organizations, 8 attendees & realistic Stripe bookings...",
    );
    await initDb();

    // Clear existing data cleanly in reverse order of foreign keys
    await db.runAsync("DELETE FROM comments");
    await db.runAsync("DELETE FROM bookmarks");
    await db.runAsync("DELETE FROM registrations");
    await db.runAsync("DELETE FROM speakers");
    await db.runAsync("DELETE FROM events");
    await db.runAsync("DELETE FROM users");
    try {
        await db.runAsync(
            "DELETE FROM sqlite_sequence WHERE name IN ('users', 'events', 'registrations', 'bookmarks', 'comments', 'speakers')",
        );
    } catch (seqErr) {
        // sqlite_sequence might not exist on fresh databases
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    // =========================================================================
    // 1. ORGANIZATIONS (5 distinct individual tech organizations)
    // =========================================================================
    const org1 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES (
            'Reactive Accelerator Community',
            'organizer@eventlws.com',
            ?,
            'organizer',
            'assets/images/sumit-saha.jpg',
            'Leading tech learning and engineering accelerator in Bangladesh.',
            'https://learnwithsumit.com'
        )
    `,
        [passwordHash],
    );

    const org2 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES (
            'Dhaka AI Collective',
            'ai_collective@eventlws.com',
            ?,
            'organizer',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            'Advancing generative AI, LLM fine-tuning, and machine intelligence research.',
            'https://dhaka.ai'
        )
    `,
        [passwordHash],
    );

    const org3 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES (
            'DevOps Bangladesh',
            'devops@eventlws.com',
            ?,
            'organizer',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
            'National community of Site Reliability Engineers, Cloud Architects, and Platform Developers.',
            'https://devopsbd.org'
        )
    `,
        [passwordHash],
    );

    const org4 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES (
            'CyberDefenders BD',
            'security@eventlws.com',
            ?,
            'organizer',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
            'Premier cybersecurity research group, blue team defenders, and ethical hacking collective.',
            'https://cyberdefenders.bd'
        )
    `,
        [passwordHash],
    );

    const org5 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES (
            'NextGen Cloud & Mobile Institute',
            'nextgen@eventlws.com',
            ?,
            'organizer',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
            'Fostering cross-platform mobile development, cloud-native systems, and distributed architectures.',
            'https://nextgencloud.org'
        )
    `,
        [passwordHash],
    );

    // =========================================================================
    // 2. ATTENDEES (8 distinct user accounts)
    // =========================================================================
    const att1 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('John Doe', 'attendee@eventlws.com', ?, 'attendee', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', 'Frontend developer enthusiastic about modern React ecosystem.', 'https://github.com/johndoe')
    `,
        [passwordHash],
    );

    const att2 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Ayesha Siddiqua', 'ayesha.s@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'Full Stack JavaScript Engineer exploring distributed web apps.', 'https://ayesha.dev')
    `,
        [passwordHash],
    );

    const att3 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Tanvir Hasan', 'tanvir.hasan@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80', 'DevOps & SRE practitioner obsessed with zero-downtime deployments.', 'https://linkedin.com/in/tanvirhasan')
    `,
        [passwordHash],
    );

    const att4 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Nafis Rahman', 'nafis.dev@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'Machine learning researcher building agentic LLM solutions.', 'https://github.com/nafisrahman')
    `,
        [passwordHash],
    );

    const att5 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Priya Sharma', 'priya.sharma@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'UI/UX enthusiast and design system architect.', 'https://dribbble.com/priyasharma')
    `,
        [passwordHash],
    );

    const att6 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Mahmudul Haque', 'mahmud.h@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'Backend Go & Node developer specializing in high concurrency.', 'https://github.com/mahmudulhaque')
    `,
        [passwordHash],
    );

    const att7 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Farhana Yasmin', 'farhana.y@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'Cybersecurity student and cloud penetration testing enthusiast.', 'https://twitter.com/farhanayasmin')
    `,
        [passwordHash],
    );

    const att8 = await db.runAsync(
        `
        INSERT INTO users (name, email, password_hash, role, avatar, bio, website)
        VALUES ('Sadman Sakib', 'sadman.s@example.com', ?, 'attendee', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80', 'Mobile engineer building offline-first apps in Flutter & React Native.', 'https://github.com/sadmansakib')
    `,
        [passwordHash],
    );

    // =========================================================================
    // 3. 20 TECH EVENTS (Across 5 distinct organizations)
    // =========================================================================
    const eventDefinitions = [
        // Org 1: Reactive Accelerator Community
        {
            orgId: org1.lastID,
            title: "Advanced React 19 Patterns & Next-Gen Architecture",
            category: "Web Development",
            dateTime: "2026-11-15T10:00:00",
            venue: "Dhanmondi Tech Center, Dhaka",
            totalSeats: 50,
            price: 49.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
            description:
                "Welcome to the ultimate deep dive into React 19! In this high-impact intensive workshop, we will dissect the latest React Compiler mechanics, Server Components integration, concurrent asset loading, and production-grade state patterns. Designed specifically for ambitious developers who want to build ultra-scalable, fluid user experiences with zero layout shifts.\n\nThroughout the day, you will build and deploy real-world enterprise applications, benchmark bundle sizes, configure Suspense boundaries, and implement custom hooks tailored for modern production requirements. Bring your laptop and curiosity!",
        },
        {
            orgId: org1.lastID,
            title: "Full-Stack Next.js 15 App Router & Server Actions",
            category: "Web Development",
            dateTime: "2026-11-22T09:30:00",
            venue: "ICT Tower, Agargaon, Dhaka",
            totalSeats: 60,
            price: 59.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
            description:
                "Master full-stack engineering with Next.js 15 App Router. We will explore Server Actions with optimistic UI updates, Partial Prerendering (PPR), dynamic routing caches, and robust authentication with NextAuth and Prisma.\n\nParticipants will gain comprehensive insight into database connection pooling, edge caching, ISR strategies, and how to build production e-commerce platforms that load in milliseconds.",
        },
        {
            orgId: org1.lastID,
            title: "Tailwind CSS v4 & Modern Design System Architecture",
            category: "Web Development",
            dateTime: "2026-12-01T15:00:00",
            venue: "Pan Pacific Sonargaon, Dhaka",
            totalSeats: 45,
            price: 29.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
            description:
                "Dive into the next generation of CSS styling with Tailwind CSS v4! Learn CSS cascade layers, container queries, custom theme tokens, dark mode orchestration, and accessible component building blocks.\n\nWe will build a comprehensive, multi-brand design system with Figma-to-code synchronizations and micro-animations.",
        },
        {
            orgId: org1.lastID,
            title: "Mastering TypeScript: Type-Level Wizardry for Frontend Leads",
            category: "Web Development",
            dateTime: "2026-12-10T14:00:00",
            venue: "Dhanmondi Tech Center, Dhaka",
            totalSeats: 40,
            price: 39.0,
            status: "draft",
            bannerUrl:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
            description:
                "Go beyond basic TypeScript interfaces. This masterclass covers conditional types, template literal types, mapped types, branded primitives, and AST transformers to eliminate runtime bugs permanently.\n\nRecommended for Senior Engineers and Tech Leads looking to bulletproof their core libraries.",
        },

        // Org 2: Dhaka AI Collective
        {
            orgId: org2.lastID,
            title: "Building Agentic Workflows with Gemini & LangGraph",
            category: "AI & Machine Learning",
            dateTime: "2026-11-20T15:00:00",
            venue: "Gulshan Convention Center, Dhaka",
            totalSeats: 100,
            price: 79.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&auto=format&fit=crop&q=80",
            description:
                "A hands-on workshop focused on constructing autonomous, multi-step LLM agents. We will cover tool orchestration, stateful routing, guardrails, human-in-the-loop workflows, and testing automated web agents in real production environments.\n\nLearn how to evaluate hallucination rates, stream tokens via WebSockets, and deploy resilient multi-agent swarms.",
        },
        {
            orgId: org2.lastID,
            title: "Practical Fine-Tuning of Open Source LLMs with LoRA & Unsloth",
            category: "AI & Machine Learning",
            dateTime: "2026-11-27T10:00:00",
            venue: "Banani Club Auditorium, Dhaka",
            totalSeats: 70,
            price: 89.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
            description:
                "Demystify custom model fine-tuning! We will take foundational open-source models like Llama 3 and Mistral, prepare synthetic domain datasets, apply QLoRA quantization, and evaluate performance benchmarks on local GPU clusters.\n\nIdeal for engineers transitioning into applied AI engineering.",
        },
        {
            orgId: org2.lastID,
            title: "Production RAG Architectures: Hybrid Search & Vector Databases",
            category: "AI & Machine Learning",
            dateTime: "2026-12-08T16:00:00",
            venue: "Gulshan Convention Center, Dhaka",
            totalSeats: 80,
            price: 69.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
            description:
                "Naive RAG is dead. In this conference session, we explore advanced retrieval-augmented generation techniques: parent document retrieval, contextual compression, multi-vector embeddings, and reranking models.\n\nCase studies will showcase processing millions of corporate documents with sub-second latency and zero data leakage.",
        },
        {
            orgId: org2.lastID,
            title: "Computer Vision in the Wild: YOLOv10 & Edge Inference",
            category: "AI & Machine Learning",
            dateTime: "2026-12-20T11:00:00",
            venue: "Online / Virtual Webinar",
            totalSeats: 150,
            price: 35.0,
            status: "draft",
            bannerUrl:
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
            description:
                "Deploy real-time object detection models directly on low-power edge devices and mobile phones with ONNX Runtime, TensorRT, and WebAssembly.\n\nParticipants receive complete starter repos and pre-trained weights for traffic and retail analysis.",
        },

        // Org 3: DevOps Bangladesh
        {
            orgId: org3.lastID,
            title: "Zero to Production with Kubernetes & GitOps",
            category: "DevOps & Cloud",
            dateTime: "2026-11-28T17:00:00",
            venue: "Banani IT Park, Dhaka",
            totalSeats: 40,
            price: 55.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
            description:
                "Learn how to set up resilient CI/CD pipelines with ArgoCD, automate rolling deployments on Kubernetes clusters, and monitor container metrics with Prometheus and Grafana.\n\nWe will practice cluster chaos engineering, pod autoscaling, ingress configuration, and disaster recovery drill procedures.",
        },
        {
            orgId: org3.lastID,
            title: "Infrastructure as Code Masterclass: Terraform & AWS CDK",
            category: "DevOps & Cloud",
            dateTime: "2026-12-05T09:00:00",
            venue: "ICT Tower, Agargaon, Dhaka",
            totalSeats: 55,
            price: 49.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
            description:
                "Stop clicking in cloud consoles! Master declarative infrastructure management with Terraform modules, state locking via DynamoDB, drift detection, and automated policy enforcement with OPA (Open Policy Agent).",
        },
        {
            orgId: org3.lastID,
            title: "Site Reliability Engineering (SRE): Incident Management & SLOs",
            category: "DevOps & Cloud",
            dateTime: "2026-12-14T14:30:00",
            venue: "Banani IT Park, Dhaka",
            totalSeats: 45,
            price: 49.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
            description:
                "How do top tech companies maintain 99.99% uptime? Understand Error Budgets, Service Level Objectives (SLOs), automated runbooks, and blameless post-mortem culture with senior SRE leaders.",
        },
        {
            orgId: org3.lastID,
            title: "Serverless at Scale: AWS Lambda, DynamoDB & EventBridge",
            category: "DevOps & Cloud",
            dateTime: "2026-12-22T10:00:00",
            venue: "Online / Virtual Platform",
            totalSeats: 80,
            price: 39.0,
            status: "draft",
            bannerUrl:
                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
            description:
                "Build event-driven architectures that scale from zero to 100,000 requests per second without managing a single virtual machine. Cold start mitigation, distributed tracing with OpenTelemetry, and cost optimization techniques.",
        },

        // Org 4: CyberDefenders BD
        {
            orgId: org4.lastID,
            title: "Cloud Security & Penetration Testing Boot Camp",
            category: "Cyber Security",
            dateTime: "2026-12-05T09:30:00",
            venue: "Uttara Convention Hall, Dhaka",
            totalSeats: 50,
            price: 99.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
            description:
                "Hands-on offensive security laboratory! Participants will exploit real-world cloud misconfigurations, IAM privilege escalations, SSRF vulnerabilities, and container breakouts in a safe sandboxed environment.\n\nAll attendees receive practical attack/defense scripts and certification of completion.",
        },
        {
            orgId: org4.lastID,
            title: "Defensive Security: SOC Analytics, Threat Hunting & SIEM",
            category: "Cyber Security",
            dateTime: "2026-12-16T11:00:00",
            venue: "Pan Pacific Sonargaon, Dhaka",
            totalSeats: 60,
            price: 59.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
            description:
                "Learn modern blue team security operations. Ingest multi-source audit logs into Elasticsearch, configure Sigma detection rules, and identify zero-day exploitation signatures before breaches happen.",
        },
        {
            orgId: org4.lastID,
            title: "DevSecOps: Automated Security in CI/CD Pipelines",
            category: "Cyber Security",
            dateTime: "2027-01-08T15:00:00",
            venue: "Uttara Convention Hall, Dhaka",
            totalSeats: 40,
            price: 49.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&auto=format&fit=crop&q=80",
            description:
                "Integrate SAST, DAST, dependency vulnerability scanning, and secret leak detection directly into GitHub Actions. Stop insecure code from ever reaching production environments.",
        },

        // Org 5: NextGen Cloud & Mobile Institute
        {
            orgId: org5.lastID,
            title: "Cross-Platform Mastery: Flutter 3.24 & Riverpod State Flow",
            category: "Mobile Development",
            dateTime: "2026-12-12T10:00:00",
            venue: "Mohakhali DOHS Community Center, Dhaka",
            totalSeats: 50,
            price: 45.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=80",
            description:
                "Create lightning-fast 120fps cross-platform mobile apps for iOS and Android using Flutter and Riverpod state architecture. Learn offline caching, SQLite local synchronization, and custom metal shaders.",
        },
        {
            orgId: org5.lastID,
            title: "React Native & Expo: Building Production Mobile Apps",
            category: "Mobile Development",
            dateTime: "2026-12-19T14:00:00",
            venue: "ICT Tower, Agargaon, Dhaka",
            totalSeats: 45,
            price: 49.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&auto=format&fit=crop&q=80",
            description:
                "Harness the new React Native Architecture (TurboModules, Fabric renderer, and Hermes engine). Build native push notification workflows, in-app purchases, and biometrics authentication.",
        },
        {
            orgId: org5.lastID,
            title: "Modern Data Stack: dbt, Snowflake & Apache Kafka Streaming",
            category: "Data Engineering",
            dateTime: "2026-12-12T16:00:00",
            venue: "Mohakhali DOHS, Dhaka",
            totalSeats: 60,
            price: 59.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
            description:
                "Transform raw data into actionable analytics. In this intensive workshop, we explore ELT pipelines with dbt, dimensional modeling on Snowflake, and real-time event streaming with Apache Kafka.",
        },
        {
            orgId: org5.lastID,
            title: "High-Throughput Data Pipelines with Apache Spark & Iceberg",
            category: "Data Engineering",
            dateTime: "2027-01-12T09:30:00",
            venue: "Dhanmondi Tech Center, Dhaka",
            totalSeats: 50,
            price: 69.0,
            status: "published",
            bannerUrl:
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
            description:
                "Build enterprise Lakehouse architectures using Apache Iceberg table formats and PySpark. Optimize partition strategies, handle schema evolution, and run multi-terabyte analytical queries.",
        },
        {
            orgId: org5.lastID,
            title: "Decentralized Finance & Smart Contract Security on EVM",
            category: "Blockchain",
            dateTime: "2027-01-20T14:00:00",
            venue: "Online / Virtual Platform",
            totalSeats: 75,
            price: 75.0,
            status: "draft",
            bannerUrl:
                "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80",
            description:
                "Dissect famous DeFi exploits, reentrancy vulnerabilities, oracle manipulation, and gas optimization patterns with Solidity and Foundry.",
        },
    ];

    const createdEvents = [];
    for (const ev of eventDefinitions) {
        const res = await db.runAsync(
            `
            INSERT INTO events (title, description, category, date_time, venue, total_seats, price, banner_url, status, organizer_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                ev.title,
                ev.description,
                ev.category,
                ev.dateTime,
                ev.venue,
                ev.totalSeats,
                ev.price !== undefined ? ev.price : 49.0,
                ev.bannerUrl,
                ev.status,
                ev.orgId,
            ],
        );
        createdEvents.push({ id: res.lastID, ...ev });
    }

    console.log(
        `Successfully created ${createdEvents.length} events across 5 organizations.`,
    );

    // Seed keynote speakers for events
    try {
        await db.runAsync(`
            INSERT INTO speakers (name, title, company, bio, photo_url, event_id) VALUES
            ('Sumit Saha', 'Founder of Learn with Sumit', 'Learn with Sumit', 'Tech educator and veteran entrepreneur.', 'assets/images/sumit-saha.jpg', 1),
            ('Tapash Adhikary', 'Founder of tapaScript', 'tapaScript', 'Software engineer, creator of ReactPlay & tapaScript.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 1),
            ('Saad Hasan', 'Full Stack Developer', 'Independent', 'Specialist in high-scale web platforms and distributed systems.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 1),
            ('Guillermo Rauch', 'CEO & Founder', 'Vercel', 'Creator of Next.js and frontend infrastructure pioneer.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 2),
            ('Lee Robinson', 'VP of Developer Experience', 'Vercel', 'Next.js evangelist and web development architect.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 2),
            ('Adam Wathan', 'Creator of Tailwind CSS', 'Tailwind Labs', 'Design system architect and author of Refactoring UI.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 3)
        `);
        console.log("Keynote speakers seeded successfully.");
    } catch (spkSeedErr) {
        console.warn("Speakers seed warning:", spkSeedErr.message);
    }

    // =========================================================================
    // 4. REGISTRATIONS / SEAT BOOKINGS (Realistic Stripe Metadata)
    // =========================================================================
    const registrationList = [
        // Event 1 (React 19)
        {
            evIdx: 0,
            user: att1,
            note: "Looking forward to React 19 Actions and Compiler deep dive!",
            cardName: "John Doe",
            last4: "4242",
            brand: "visa",
            zip: "1209",
        },
        {
            evIdx: 0,
            user: att2,
            note: "Excited for the compiler deep dive.",
            cardName: "Ayesha Siddiqua",
            last4: "5555",
            brand: "mastercard",
            zip: "1212",
        },
        {
            evIdx: 0,
            user: att3,
            note: "Attending from Chittagong!",
            cardName: "Tanvir Hasan",
            last4: "1111",
            brand: "visa",
            zip: "1205",
        },
        {
            evIdx: 0,
            user: att4,
            note: "Need certificate for corporate training reimbursement.",
            cardName: "Nafis Rahman",
            last4: "0005",
            brand: "amex",
            zip: "1216",
        },
        {
            evIdx: 0,
            user: att5,
            note: "UI performance is my top priority.",
            cardName: "Priya Sharma",
            last4: "4242",
            brand: "visa",
            zip: "1230",
        },
        {
            evIdx: 0,
            user: att6,
            note: "Building high concurrency frontend.",
            cardName: "Mahmudul Haque",
            last4: "8888",
            brand: "mastercard",
            zip: "1208",
        },

        // Event 2 (Next.js 15)
        {
            evIdx: 1,
            user: att1,
            note: "Need to master Server Actions for our company portal.",
            cardName: "John Doe",
            last4: "4242",
            brand: "visa",
            zip: "1209",
        },
        {
            evIdx: 1,
            user: att3,
            note: "Interested in PPR and Edge caching.",
            cardName: "Tanvir Hasan",
            last4: "1111",
            brand: "visa",
            zip: "1205",
        },
        {
            evIdx: 1,
            user: att6,
            note: "Looking to optimize DB pooling.",
            cardName: "Mahmudul Haque",
            last4: "8888",
            brand: "mastercard",
            zip: "1208",
        },

        // Event 3 (Tailwind v4)
        {
            evIdx: 2,
            user: att5,
            note: "Building a multi-tenant design system.",
            cardName: "Priya Sharma",
            last4: "4242",
            brand: "visa",
            zip: "1230",
        },
        {
            evIdx: 2,
            user: att2,
            note: "Excited for CSS container queries in Tailwind.",
            cardName: "Ayesha Siddiqua",
            last4: "5555",
            brand: "mastercard",
            zip: "1212",
        },

        // Event 5 (Gemini & LangGraph)
        {
            evIdx: 4,
            user: att1,
            note: "Building autonomous AI assistants for our support team.",
            cardName: "John Doe",
            last4: "4242",
            brand: "visa",
            zip: "1209",
        },
        {
            evIdx: 4,
            user: att4,
            note: "Specializing in agentic swarm architectures.",
            cardName: "Nafis Rahman",
            last4: "0005",
            brand: "amex",
            zip: "1216",
        },
        {
            evIdx: 4,
            user: att6,
            note: "Looking into WebSocket streaming tokens.",
            cardName: "Mahmudul Haque",
            last4: "8888",
            brand: "mastercard",
            zip: "1208",
        },
        {
            evIdx: 4,
            user: att7,
            note: "Evaluating prompt injection guardrails.",
            cardName: "Farhana Yasmin",
            last4: "3333",
            brand: "visa",
            zip: "1229",
        },

        // Event 6 (Fine-Tuning LLMs)
        {
            evIdx: 5,
            user: att4,
            note: "Running local QLoRA fine tuning benchmarks.",
            cardName: "Nafis Rahman",
            last4: "0005",
            brand: "amex",
            zip: "1216",
        },
        {
            evIdx: 5,
            user: att2,
            note: "Looking to fine-tune Bengali language models.",
            cardName: "Ayesha Siddiqua",
            last4: "5555",
            brand: "mastercard",
            zip: "1212",
        },

        // Event 7 (Production RAG)
        {
            evIdx: 6,
            user: att4,
            note: "Need to solve hybrid search precision.",
            cardName: "Nafis Rahman",
            last4: "0005",
            brand: "amex",
            zip: "1216",
        },
        {
            evIdx: 6,
            user: att1,
            note: "Integrating corporate knowledge base.",
            cardName: "John Doe",
            last4: "4242",
            brand: "visa",
            zip: "1209",
        },

        // Event 9 (Kubernetes & GitOps)
        {
            evIdx: 8,
            user: att3,
            note: "ArgoCD production rollout planned next month.",
            cardName: "Tanvir Hasan",
            last4: "1111",
            brand: "visa",
            zip: "1205",
        },
        {
            evIdx: 8,
            user: att6,
            note: "Migrating Docker swarm to EKS.",
            cardName: "Mahmudul Haque",
            last4: "8888",
            brand: "mastercard",
            zip: "1208",
        },
        {
            evIdx: 8,
            user: att7,
            note: "Checking pod security standards & Kyverno.",
            cardName: "Farhana Yasmin",
            last4: "3333",
            brand: "visa",
            zip: "1229",
        },

        // Event 10 (Terraform Masterclass)
        {
            evIdx: 9,
            user: att3,
            note: "Managing multi-region AWS accounts.",
            cardName: "Tanvir Hasan",
            last4: "1111",
            brand: "visa",
            zip: "1205",
        },

        // Event 13 (Cloud Penetration Testing)
        {
            evIdx: 12,
            user: att7,
            note: "Preparing for OSCP and AWS Certified Security Specialty.",
            cardName: "Farhana Yasmin",
            last4: "3333",
            brand: "visa",
            zip: "1229",
        },
        {
            evIdx: 12,
            user: att3,
            note: "Securing Kubernetes ingress against SSRF.",
            cardName: "Tanvir Hasan",
            last4: "1111",
            brand: "visa",
            zip: "1205",
        },

        // Event 16 (Flutter 3.24)
        {
            evIdx: 15,
            user: att8,
            note: "Migrating legacy Provider apps to Riverpod 2.x.",
            cardName: "Sadman Sakib",
            last4: "7777",
            brand: "visa",
            zip: "1207",
        },

        // Event 17 (React Native Expo)
        {
            evIdx: 16,
            user: att8,
            note: "Testing Hermes bytecode engine.",
            cardName: "Sadman Sakib",
            last4: "7777",
            brand: "visa",
            zip: "1207",
        },
        {
            evIdx: 16,
            user: att1,
            note: "Transitioning from web React to mobile apps.",
            cardName: "John Doe",
            last4: "4242",
            brand: "visa",
            zip: "1209",
        },

        // Event 18 (Modern Data Stack)
        {
            evIdx: 17,
            user: att6,
            note: "Setting up dbt Cloud transformations.",
            cardName: "Mahmudul Haque",
            last4: "8888",
            brand: "mastercard",
            zip: "1208",
        },
    ];

    for (const reg of registrationList) {
        const ev = createdEvents[reg.evIdx];
        const eventFee = ev && ev.price !== undefined ? ev.price : 49.0;
        await db.runAsync(
            `
            INSERT INTO registrations (
                event_id, user_id, notes,
                card_holder_name, card_last4, card_brand, billing_postal_code,
                payment_status, amount_paid, payment_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, 'card')
        `,
            [
                ev.id,
                reg.user.lastID,
                reg.note,
                reg.cardName,
                reg.last4,
                reg.brand,
                reg.zip,
                eventFee,
            ],
        );
    }
    console.log(
        `Created ${registrationList.length} seat registrations with Stripe payment info.`,
    );

    // =========================================================================
    // 5. BOOKMARKS / SAVED EVENTS
    // =========================================================================
    const bookmarkList = [
        { evIdx: 0, user: att1 },
        { evIdx: 1, user: att1 },
        { evIdx: 4, user: att1 },
        { evIdx: 8, user: att1 },
        { evIdx: 12, user: att1 },

        { evIdx: 0, user: att2 },
        { evIdx: 2, user: att2 },
        { evIdx: 5, user: att2 },

        { evIdx: 8, user: att3 },
        { evIdx: 9, user: att3 },
        { evIdx: 10, user: att3 },

        { evIdx: 4, user: att4 },
        { evIdx: 5, user: att4 },
        { evIdx: 6, user: att4 },

        { evIdx: 2, user: att5 },
        { evIdx: 0, user: att5 },

        { evIdx: 15, user: att8 },
        { evIdx: 16, user: att8 },
    ];

    for (const bm of bookmarkList) {
        const ev = createdEvents[bm.evIdx];
        await db.runAsync(
            "INSERT OR IGNORE INTO bookmarks (event_id, user_id) VALUES (?, ?)",
            [ev.id, bm.user.lastID],
        );
    }
    console.log(
        `Created ${bookmarkList.length} bookmarks across attendee accounts.`,
    );

    // =========================================================================
    // 6. COMMENTS / DISCUSSIONS & REVIEWS
    // =========================================================================
    const commentList = [
        {
            evIdx: 0,
            user: att1,
            content:
                "Will this workshop cover migrating legacy React 17 apps to React 19? Really looking forward to attending!",
        },
        {
            evIdx: 0,
            user: att2,
            content:
                "Super excited! Will video recordings and GitHub starter repos be provided after the session?",
        },
        {
            evIdx: 0,
            user: att3,
            content:
                "The venue at Dhanmondi Tech Center is excellent. Easy parking and great Wi-Fi.",
        },

        {
            evIdx: 1,
            user: att6,
            content:
                "Does this cover Server Actions security and CSRF protection in production?",
        },
        {
            evIdx: 1,
            user: att1,
            content:
                "Already booked my ticket. Looking forward to Partial Prerendering examples!",
        },

        {
            evIdx: 4,
            user: att4,
            content:
                "LangGraph vs AutoGen comparison would be super valuable during the afternoon breakout sessions.",
        },
        {
            evIdx: 4,
            user: att7,
            content:
                "Glad to see security guardrails included in the curriculum.",
        },

        {
            evIdx: 8,
            user: att3,
            content:
                "Finally a hands-on Kubernetes workshop in Dhaka that dives into ArgoCD GitOps!",
        },
        {
            evIdx: 8,
            user: att6,
            content:
                "Will we get temporary cloud sandbox accounts during the lab?",
        },

        {
            evIdx: 12,
            user: att7,
            content:
                "Is previous penetration testing experience strictly required, or will basics be reviewed?",
        },
        {
            evIdx: 15,
            user: att8,
            content:
                "Riverpod 2.0 with generator annotations is a game changer. Can not wait for this masterclass.",
        },
    ];

    for (const cm of commentList) {
        const ev = createdEvents[cm.evIdx];
        await db.runAsync(
            "INSERT INTO comments (event_id, user_id, content) VALUES (?, ?, ?)",
            [ev.id, cm.user.lastID, cm.content],
        );
    }
    console.log(
        `Created ${commentList.length} discussion reviews across events.`,
    );

    console.log(
        "Seeding completed successfully! Database is rich, diverse, and 100% compliant with requirements.",
    );
    process.exit(0);
};

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
