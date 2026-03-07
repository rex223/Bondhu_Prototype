"use client";

import { useState, useMemo, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Shield, Zap, Clock, Users, MessageCircle } from "lucide-react";

// FAQ Categories (excluding "all" since we're using category groups)
type FAQCategory = "general" | "privacy" | "features" | "pricing" | "support";

interface FAQ {
    question: string;
    answer: string;
    category: FAQCategory;
}

const CATEGORY_CONFIG: Record<FAQCategory, { label: string; icon: typeof HelpCircle; color: string; bgColor: string }> = {
    general: { label: "General", icon: MessageCircle, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    privacy: { label: "Privacy & Security", icon: Shield, color: "text-green-500", bgColor: "bg-green-500/10" },
    features: { label: "Features", icon: Zap, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    pricing: { label: "Pricing", icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    support: { label: "Support", icon: Users, color: "text-pink-500", bgColor: "bg-pink-500/10" },
};

export function FAQSection() {
    const [openCategory, setOpenCategory] = useState<FAQCategory | null>(null);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true });

    const faqs: FAQ[] = [
        {
            question: "What is Bondhu?",
            answer: "Bondhu is an AI-powered mental health companion designed specifically for Gen Z in India. The name \"Bondhu\" means \"friend\" in Bengali, reflecting our mission to be your trusted digital companion for mental wellness. Unlike generic mental health apps, Bondhu understands your unique personality through your music preferences, gaming habits, and entertainment choices to provide truly personalized support.",
            category: "general",
        },
        {
            question: "Is Bondhu a replacement for therapy or medication?",
            answer: "No. Bondhu is a mental wellness companion, not a substitute for professional mental health treatment. While we can help with stress management, mood tracking, and daily emotional support, we strongly encourage seeking professional help for severe depression, anxiety disorders, suicidal thoughts, or any condition requiring medication. Think of Bondhu as your first step towards mental wellness or a supplement to professional therapy.",
            category: "general",
        },
        {
            question: "When is Bondhu launching?",
            answer: "Bondhu is launching on October 10, 2025 — World Mental Health Day.",
            category: "general",
        },
        {
            question: "How do I sign up?",
            answer: "1. Visit bondhu.tech, 2. Create account with email, 3. Complete brief personality assessment (5 minutes), 4. Start chatting!",
            category: "general",
        },
        {
            question: "Who built Bondhu?",
            answer: "Bondhu is built by Gen Z students specializing in AI/ML for Gen Z mental health struggles. We're passionate about making quality mental wellness support accessible to everyone in India.",
            category: "general",
        },
        {
            question: "Is Bondhu affiliated with any mental health organization?",
            answer: "We collaborate with mental health professionals and organizations to ensure our AI provides safe, evidence-based support. We're not affiliated with any specific therapy practice or pharmaceutical company.",
            category: "general",
        },
        {
            question: "How does Bondhu understand my personality?",
            answer: "Bondhu uses advanced multi-agent AI architecture powered by four specialized intelligence agents: Music Intelligence Agent (analyzes your Spotify listening habits), Video Intelligence Agent (understands your entertainment preferences), Gaming Intelligence Agent (examines your Steam gaming patterns), and Personality Analysis Agent (synthesizes all data using the Big Five personality model). This comprehensive approach helps Bondhu understand not just what you say, but who you are.",
            category: "features",
        },
        {
            question: "What makes Bondhu different from other mental health apps?",
            answer: "Most mental health apps use generic, one-size-fits-all approaches. Bondhu is different because: Culturally aware (understands Indian family dynamics, social pressures, and cultural context), Personality-driven (adapts conversations based on your unique personality traits), Multi-modal analysis (uses your entertainment preferences to build a complete picture), Proactive support (reaches out when patterns suggest you might need help), and Always learning (continuously updates its understanding as you grow and change).",
            category: "features",
        },
        {
            question: "Do I need to connect my Spotify, Steam, or other accounts?",
            answer: "Connections are optional but highly recommended. The more data Bondhu has about your preferences, the better it can understand and support you. All integrations are: Secure (OAuth-based authentication, industry-standard encryption), Private (your data never leaves our secure servers), and Controllable (disconnect anytime without losing your chat history).",
            category: "features",
        },
        {
            question: "What can I talk to Bondhu about?",
            answer: "Bondhu is here for a wide range of mental health topics: Academic stress and exam anxiety, Family and relationship issues, Career confusion and pressure, Social anxiety and loneliness, Self-esteem and body image, Daily mood tracking, Coping strategies for stress, and Goal setting and motivation. Bondhu cannot help with: Medical emergencies, suicidal crises (please call 9152987821 - AASRA helpline), substance abuse requiring detox, or severe psychiatric conditions requiring medication.",
            category: "features",
        },
        {
            question: "Does Bondhu work in Hindi or other Indian languages?",
            answer: "Yes! Bondhu Supports all Major Indian (22 scheduled languages) and Major International Languages.",
            category: "features",
        },
        {
            question: "Can Bondhu recognize when I'm in crisis?",
            answer: "Yes. Bondhu's AI is trained to identify concerning patterns like: Expressions of self-harm or suicidal ideation, Severe anxiety or panic attacks, Symptoms of clinical depression, and Substance abuse indicators. When detected, Bondhu will: Provide immediate crisis resources (helpline numbers), Encourage seeking professional help, and Offer grounding exercises while you wait for support.",
            category: "features",
        },
        {
            question: "How does Bondhu remember our conversations?",
            answer: "Bondhu uses advanced context management to remember: Previous conversations and topics discussed, Your emotional patterns and triggers, Goals you've set and progress tracking, and Preferences about how you like to be supported. This memory resets if you delete conversations or choose a \"fresh start\" from settings.",
            category: "features",
        },
        {
            question: "Do I need to take a personality test?",
            answer: "A brief initial assessment (10-15 questions, 5 minutes) helps Bondhu understand you better. It's highly recommended for personality discovery as it is based on OCEAN Big Five Inventory–2 (BFI-2) XS test.",
            category: "features",
        },
        {
            question: "What features are coming soon?",
            answer: "Q4 2025: Mobile apps (iOS/Android), Group support features, Therapist referral network. 2026: Voice conversations, Family sharing, Integration with wearables (mood tracking via Apple Watch/Fitbit), and Journaling with AI insights.",
            category: "features",
        },
        {
            question: "Is my data safe with Bondhu?",
            answer: "Absolutely. Privacy is our top priority: End-to-end encryption for all conversations, GDPR-compliant data handling practices, Zero third-party data selling - your information is never shared or sold, Secure storage on enterprise-grade Supabase infrastructure, and You own your data - export or delete anytime.",
            category: "privacy",
        },
        {
            question: "Who can see my conversations with Bondhu?",
            answer: "Only you. Bondhu conversations are completely private and encrypted. We don't share your data with: Parents or family members, Schools or employers, Third-party advertisers, or Insurance companies.",
            category: "privacy",
        },
        {
            question: "What data does Bondhu collect?",
            answer: "Bondhu collects: Conversations (your chat messages with the AI), Personality data (Big Five personality test results), Entertainment preferences (if connected - Spotify music, Steam games, video preferences), and Usage patterns (app interaction data to improve the experience). We never collect: Location data, Contact lists, Photos or files (unless you choose to share), or Financial information.",
            category: "privacy",
        },
        {
            question: "Can I delete my data?",
            answer: "Yes, completely. From your account settings: Delete specific conversations (remove individual chats), Disconnect integrations (revoke Spotify/Steam access), and Delete account (permanently erase all data within 30 days).",
            category: "privacy",
        },
        {
            question: "What if I'm not comfortable sharing everything right away?",
            answer: "That's completely normal! Start with whatever you're comfortable sharing. Bondhu will: Never pressure you to share more than you want, Build understanding gradually through conversations, Respect your boundaries, and Let you control what data to connect (Spotify, etc.).",
            category: "privacy",
        },
        {
            question: "Is Bondhu safe for minors?",
            answer: "Bondhu is designed for ages 16+ (typical Gen Z college/high school students). For users under 18, we recommend: Parental awareness (not supervision - privacy is important), Understanding that Bondhu is supplementary support, and Professional help for serious issues. We do not allow users under 13 per COPPA regulations.",
            category: "privacy",
        },
        {
            question: "Is Bondhu free?",
            answer: "Yes! Bondhu is 100% free for all users at launch. We're committed to making mental health support accessible, especially recognizing that many students and young adults can't afford expensive therapy.",
            category: "pricing",
        },
        {
            question: "Will Bondhu always be free?",
            answer: "Our free tier will always remain available with core features. In the future, we may introduce a premium tier (₹299/month) with: Priority response times, Advanced personality insights dashboard, Integration with professional therapists, Extended conversation history, and Family sharing features. But the core Bondhu experience - personalized AI conversations - will always be free.",
            category: "pricing",
        },
        {
            question: "Do I need to give credit card information?",
            answer: "No. No credit card, no payment method required. Just sign up with your email and start chatting.",
            category: "pricing",
        },
        {
            question: "What devices does Bondhu work on?",
            answer: "Bondhu is available as: Web app (Access from any browser at bondhu.tech - Best experience from a Desktop) and Mobile app (Coming soon for iOS and Android - Q1 2026). The web app is fully responsive and works perfectly on mobile browsers.",
            category: "support",
        },
        {
            question: "Do I need internet to use Bondhu?",
            answer: "Yes, Bondhu requires an internet connection to process conversations through our AI. Offline mode is on our roadmap for basic features like mood tracking and journal entries.",
            category: "support",
        },
        {
            question: "How can schools or colleges use Bondhu?",
            answer: "We're developing institutional partnerships for: Campus mental wellness programs, Student support services integration, Anonymous usage analytics for administrators, and Workshop and awareness campaigns. Contact team@bondhu.tech for institutional partnerships.",
            category: "support",
        },
        {
            question: "What if I'm in immediate danger or crisis?",
            answer: "Please seek immediate help: India Crisis Helplines: AASRA: 9152987821 (24/7), iCall: 9152987821, Vandrevala Foundation: 1860-2662-345, Emergency: 112 (Police). International: US: 988 (Suicide & Crisis Lifeline), UK: 116 123 (Samaritans). Bondhu will also provide these resources if it detects crisis language.",
            category: "support",
        },
        {
            question: "Why is Bondhu not responding?",
            answer: "Try these steps: 1. Check your internet connection, 2. Refresh the page/app, 3. Clear browser cache and cookies, 4. Try a different browser, 5. Contact bondhuaitech@gmail.com if issue persists.",
            category: "support",
        },
        {
            question: "How do I report a problem or bug?",
            answer: "Email bondhuaitech@gmail.com with: Description of the issue, Screenshots if possible, Device/browser information, and Your account email. We typically respond within 24 hours.",
            category: "support",
        },
        {
            question: "Can I provide feedback or suggest features?",
            answer: "Absolutely! We're building Bondhu for you. Share feedback: In-app feedback button, Email: feedback@bondhu.tech, Twitter/Instagram: @bondhu.tech, or Join our community Discord (link on website footer).",
            category: "support",
        },
    ];

    // Group FAQs by category
    const faqsByCategory = useMemo(() => {
        const grouped: Record<FAQCategory, FAQ[]> = {
            general: [],
            privacy: [],
            features: [],
            pricing: [],
            support: [],
        };
        
        faqs.forEach((faq) => {
            // Filter by search query if present
            const matchesSearch = searchQuery === "" || 
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (matchesSearch) {
                grouped[faq.category].push(faq);
            }
        });
        
        return grouped;
    }, [searchQuery]);

    // Count FAQs per category
    const categoryCounts = useMemo(() => {
        const counts: Record<FAQCategory, number> = {
            general: 0,
            privacy: 0,
            features: 0,
            pricing: 0,
            support: 0,
        };
        Object.entries(faqsByCategory).forEach(([category, faqs]) => {
            counts[category as FAQCategory] = faqs.length;
        });
        return counts;
    }, [faqsByCategory]);

    // Auto-expand category if search query matches
    const getCategoryKey = (category: FAQCategory, index: number) => `${category}-${index}`;
    
    return (
        <section 
            ref={sectionRef}
            id="faq" 
            className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-secondary/10 via-secondary/20 to-secondary/10"
            data-ai-summary="true"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-10 sm:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.span 
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        FAQ
                    </motion.span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about Bondhu
                    </p>
                </motion.div>
                
                {/* Search Bar */}
                <motion.div 
                    className="max-w-4xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // Auto-expand categories with matching results
                                if (e.target.value) {
                                    const categoriesWithResults = (Object.keys(faqsByCategory) as FAQCategory[]).filter(
                                        cat => faqsByCategory[cat].length > 0
                                    );
                                    if (categoriesWithResults.length > 0 && !openCategory) {
                                        setOpenCategory(categoriesWithResults[0]);
                                    }
                                }
                            }}
                            className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-border bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm sm:text-base touch-target"
                        />
                    </div>
                </motion.div>
                
                {/* Category Accordion Groups */}
                <div className="max-w-4xl mx-auto space-y-3">
                    {(Object.keys(CATEGORY_CONFIG) as FAQCategory[]).map((category, categoryIndex) => {
                        const config = CATEGORY_CONFIG[category];
                        const Icon = config.icon;
                        const categoryFaqs = faqsByCategory[category];
                        const isCategoryOpen = openCategory === category;
                        const count = categoryCounts[category];
                        
                        // Skip empty categories
                        if (count === 0 && searchQuery) return null;
                        
                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                                className="border border-border rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                            >
                                {/* Category Header */}
                                <button
                                    onClick={() => setOpenCategory(isCategoryOpen ? null : category)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/30 transition-colors touch-target-lg"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                                {config.label}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                {count} {count === 1 ? 'question' : 'questions'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown 
                                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                                            isCategoryOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                
                                {/* Category FAQs */}
                                <AnimatePresence>
                                    {isCategoryOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-border divide-y divide-border">
                                                {categoryFaqs.map((faq, faqIndex) => {
                                                    const faqKey = getCategoryKey(category, faqIndex);
                                                    const isFaqOpen = openFaqIndex === faqIndex && openCategory === category;
                                                    
                                                    return (
                                                        <motion.div
                                                            key={faqKey}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: faqIndex * 0.05 }}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenFaqIndex(isFaqOpen ? null : faqIndex);
                                                                }}
                                                                className="w-full text-left p-4 sm:p-5 hover:bg-accent/20 transition-colors touch-target-lg"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <h4 className="text-sm sm:text-base font-medium text-foreground pr-4 flex-1">
                                                                        {faq.question}
                                                                    </h4>
                                                                    <ChevronDown 
                                                                        className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                                                                            isFaqOpen ? "rotate-180" : ""
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <AnimatePresence>
                                                                    {isFaqOpen && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.3 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 leading-relaxed">
                                                                                {faq.answer}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
                
                {/* No Results Message */}
                {searchQuery && Object.values(categoryCounts).every(count => count === 0) && (
                    <motion.div 
                        className="text-center py-12 max-w-4xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-muted-foreground mb-4">No questions found matching your search.</p>
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="text-primary hover:underline font-medium"
                        >
                            Clear search
                        </button>
                    </motion.div>
                )}
                
                {/* Contact CTA */}
                <motion.div 
                    className="text-center mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Still have questions?</p>
                    <p className="text-sm sm:text-base text-foreground">
                        Contact us at{" "}
                        <a 
                            href="mailto:bondhuaitech@gmail.com" 
                            className="text-primary hover:underline font-medium"
                        >
                            bondhuaitech@gmail.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
