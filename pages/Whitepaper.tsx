
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Globe, Cpu, Hexagon } from 'lucide-react';

const Whitepaper: React.FC = () => {
    const sections = [
        {
            title: "Abstract",
            content: "VELENCIA represents the convergence of high fashion and cryptographic sovereignty. We are not just a label; we are a protocol for value preservation. In an era of fast fashion and digital ephemerality, VELENCIA establishes a new standard where physical garments are inextricably linked to immutable digital artifacts on the Bitcoin blockchain."
        },
        {
            title: "The Philosophy",
            content: "True luxury is scarcity. In the digital realm, Bitcoin is the only absolute scarcity. By anchoring our physical creations to the Bitcoin network via Ordinals, we ensure that every VELENCIA garment possesses a soul—a verifiable, tradeable, and censorship-resistant digital twin that outlasts the fabric itself."
        },
        {
            title: "Technical Architecture",
            content: "Our infrastructure is built on the bedrock of Bitcoin. We utilize Layer 1 for final settlement and Ordinals for provenance. We do not rely on centralized servers for ownership verification. Your garment's authenticity is secured by the most powerful computing network in history."
        },
        {
            title: "The Sovereign Atelier",
            content: "We reject the rent-seeking models of traditional luxury conglomerates. VELENCIA operates as a sovereign atelier, interacting directly with its patrons through peer-to-peer value transfer. No banks, no intermediaries, just pure signal."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-20 px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center justify-center p-4 glass-ios rounded-full mb-8">
                        <Hexagon size={32} className="text-primary animate-pulse-glow" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tighter mb-6">
                        Whitepaper <span className="text-primary italic">v1.0</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The technical and philosophical manifesto of the VELENCIA protocol.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="glass-ios p-10 md:p-14 rounded-[40px] border border-white/5 hover:border-primary/20 transition-all duration-500 group"
                        >
                            <h2 className="text-3xl font-black mb-6 tracking-tight flex items-center">
                                <span className="text-primary/40 mr-4 font-mono text-xl">0{idx + 1}</span>
                                {section.title}
                            </h2>
                            <p className="text-gray-400 text-lg leading-loose font-light">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Tech Stack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="glass-ios p-8 rounded-[32px] text-center hover:bg-white/5 transition-colors">
                        <Shield size={32} className="mx-auto mb-4 text-primary" />
                        <h3 className="font-bold text-lg mb-2">Bitcoin L1</h3>
                        <p className="text-sm text-gray-500">Final Settlement Layer</p>
                    </div>
                    <div className="glass-ios p-8 rounded-[32px] text-center hover:bg-white/5 transition-colors">
                        <Cpu size={32} className="mx-auto mb-4 text-secondary" />
                        <h3 className="font-bold text-lg mb-2">Ordinals</h3>
                        <p className="text-sm text-gray-500">Immutable Provenance</p>
                    </div>
                    <div className="glass-ios p-8 rounded-[32px] text-center hover:bg-white/5 transition-colors">
                        <Globe size={32} className="mx-auto mb-4 text-white" />
                        <h3 className="font-bold text-lg mb-2">P2P Network</h3>
                        <p className="text-sm text-gray-500">Sovereign Commerce</p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-24 pt-12 border-t border-white/5">
                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">
                        Published by VELENCIA INTERIOR • Block 876241
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Whitepaper;
