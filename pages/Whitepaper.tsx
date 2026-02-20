
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Globe, Cpu, Hexagon } from 'lucide-react';

const Whitepaper: React.FC = () => {
    const sections: { title: string; content: React.ReactNode }[] = [
        {
            title: "Executive Summary",
            content: (
                <>
                    Valencia is a Bitcoin-native eCommerce infrastructure protocol designed to enable seamless, secure, and borderless online commerce using Bitcoin as the primary settlement layer.
                    <br /><br />
                    While Bitcoin has established itself as a store of value, its integration into everyday online transactions remains fragmented and technically complex. Valencia bridges this gap by providing merchants with a simple, secure framework to accept Bitcoin payments directly from customer wallets.
                    <br /><br />
                    Valencia transforms Bitcoin from a speculative asset into a functional payment network for global commerce.
                </>
            )
        },
        {
            title: "Problem Statement",
            content: (
                <>
                    <strong className="text-white">2.1 Centralized Payment Infrastructure</strong>
                    <br />
                    Modern eCommerce depends heavily on centralized payment processors such as Stripe, PayPal, and Visa. These systems introduce high processing fees (2–5%), chargeback fraud risk, geographic payment restrictions, account freezes, and settlement delays. Merchants do not truly own their payment rails.
                    <br /><br />
                    <strong className="text-white">2.2 Underutilized Bitcoin Network</strong>
                    <br />
                    Bitcoin has proven itself as a secure, decentralized financial network. However, spending Bitcoin online is not frictionless. Few platforms offer native wallet-based checkout, and merchant tools are limited. Valencia solves both sides of this inefficiency.
                </>
            )
        },
        {
            title: "The Valencia Solution",
            content: (
                <>
                    Valencia is a decentralized commerce layer that integrates Bitcoin wallet payments directly into online storefronts.
                    <br /><br />
                    <strong className="text-white">3.1 Core Functionality</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Customer selects product.</li>
                        <li>Customer connects a supported Bitcoin wallet (e.g., Xverse Wallet).</li>
                        <li>Payment request is generated.</li>
                        <li>Transaction is broadcast and verified on-chain.</li>
                        <li>Order confirmation triggers automatically after verification.</li>
                    </ul>
                    <br />
                    No intermediaries. No custodial risk. No chargebacks.
                </>
            )
        },
        {
            title: "System Architecture",
            content: (
                <>
                    <strong className="text-white">4.1 Architecture Overview</strong>
                    <br />
                    Valencia consists of: Frontend dApp (merchant storefront), Bitcoin wallet integration layer, On-chain transaction verification engine, Merchant dashboard backend, and API integration framework.
                    <br /><br />
                    <strong className="text-white">4.2 Transaction Flow</strong>
                    <br />
                    Order created → Bitcoin payment request generated → Wallet signature + broadcast → On-chain confirmation detection → Order marked as paid.
                    <br /><br />
                    Transactions settle directly on the Bitcoin network.
                </>
            )
        },
        {
            title: "Key Features",
            content: (
                <ul className="space-y-4">
                    <li><strong className="text-white">5.1 Non-Custodial Payments:</strong> Valencia never holds user funds. Payments move wallet-to-merchant directly.</li>
                    <li><strong className="text-white">5.2 Borderless Commerce:</strong> Bitcoin enables international transactions without banking restrictions.</li>
                    <li><strong className="text-white">5.3 Fraud Resistance:</strong> Bitcoin’s irreversible transactions eliminate chargeback abuse.</li>
                    <li><strong className="text-white">5.4 Low Fees:</strong> Merchant costs are significantly reduced compared to traditional processors.</li>
                    <li><strong className="text-white">5.5 Transparent Settlement:</strong> All payments are verifiable on-chain.</li>
                </ul>
            )
        },
        {
            title: "Target Market",
            content: (
                <>
                    Valencia serves independent online merchants, digital product creators, global sellers facing banking restrictions, Bitcoin-native communities, and Web3 marketplaces. The initial focus is on small-to-medium online stores seeking alternative payment rails.
                </>
            )
        },
        {
            title: "Competitive Advantage",
            content: (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-primary border-b border-white/10">
                            <tr>
                                <th className="pb-2">Feature</th>
                                <th className="pb-2">Traditional Processors</th>
                                <th className="pb-2">Valencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="border-b border-white/5"><td className="py-2">Custody</td><td>Centralized</td><td><strong className="text-white">Non-custodial</strong></td></tr>
                            <tr className="border-b border-white/5"><td className="py-2">Chargebacks</td><td>Yes</td><td><strong className="text-white">No</strong></td></tr>
                            <tr className="border-b border-white/5"><td className="py-2">Global Access</td><td>Restricted</td><td><strong className="text-white">Borderless</strong></td></tr>
                            <tr className="border-b border-white/5"><td className="py-2">Settlement</td><td>1–5 days</td><td><strong className="text-white">On-chain confirmation</strong></td></tr>
                            <tr><td className="py-2">Ownership</td><td>Platform-controlled</td><td><strong className="text-white">Merchant-controlled</strong></td></tr>
                        </tbody>
                    </table>
                    <p className="mt-4 text-sm font-light opacity-80">Valencia operates on decentralized financial infrastructure rather than bank-dependent systems.</p>
                </div>
            )
        },
        {
            title: "Security Model",
            content: (
                <>
                    Security is anchored in the Bitcoin network: Wallet-based authentication, No private key storage, On-chain validation, and Transparent transaction verification.
                    <br /><br />
                    By leveraging Bitcoin’s proof-of-work security model, Valencia inherits the robustness of the network.
                </>
            )
        },
        {
            title: "Roadmap",
            content: (
                <ul className="space-y-4">
                    <li>
                        <strong className="text-white">Phase 1 – MVP:</strong> Wallet integration, On-chain payment validation, Basic merchant dashboard.
                    </li>
                    <li>
                        <strong className="text-white">Phase 2 – Infrastructure Expansion:</strong> API for Shopify/WooCommerce integration, Recurring payments support, Lightning Network compatibility.
                    </li>
                    <li>
                        <strong className="text-white">Phase 3 – Ecosystem Growth:</strong> Developer SDK, Merchant analytics tools, Bitcoin-native loyalty rewards, Multi-store merchant support.
                    </li>
                </ul>
            )
        },
        {
            title: "Token Model (Optional)",
            content: (
                <>
                    Valencia does not require a native token for operation.
                    <br /><br />
                    However, future ecosystem incentives may include: Merchant staking for reduced fees, Governance participation, and Ecosystem rewards. Any token introduction would prioritize utility over speculation.
                </>
            )
        },
        {
            title: "Long-Term Vision",
            content: (
                <>
                    Valencia aims to become the default Bitcoin commerce infrastructure layer.
                    <br /><br />
                    <span className="italic">"If traditional commerce runs on Visa, Bitcoin commerce should run on Valencia."</span>
                    <br /><br />
                    Our mission is to make Bitcoin usable for everyday transactions at scale — without sacrificing decentralization.
                </>
            )
        },
        {
            title: "Conclusion",
            content: (
                <>
                    Bitcoin has achieved monetary sovereignty. Valencia enables commercial sovereignty.
                    <br /><br />
                    By bridging decentralized payments with real-world eCommerce infrastructure, Valencia unlocks Bitcoin’s true transactional potential.
                </>
            )
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
                    <h1 className="text-5xl md:text-7xl font-black font-serif tracking-tighter mb-6">
                        Valencia Protocol <span className="text-primary italic">v1.0</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Bitcoin-Native Commerce Infrastructure
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
                                <span className="text-primary/40 mr-4 font-mono text-xl">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                {section.title}
                            </h2>
                            <div className="text-gray-400 text-lg leading-loose font-light">
                                {section.content}
                            </div>
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
                        <h3 className="font-bold text-lg mb-2">Non-Custodial</h3>
                        <p className="text-sm text-gray-500">True Ownership</p>
                    </div>
                    <div className="glass-ios p-8 rounded-[32px] text-center hover:bg-white/5 transition-colors">
                        <Globe size={32} className="mx-auto mb-4 text-white" />
                        <h3 className="font-bold text-lg mb-2">Borderless</h3>
                        <p className="text-sm text-gray-500">Global Commerce</p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-24 pt-12 border-t border-white/5">
                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">
                        Published by Valencia Labs • Version 1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Whitepaper;
