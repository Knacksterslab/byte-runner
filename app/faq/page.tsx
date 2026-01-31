export default function FAQPage() {
  const faqs = [
    {
      question: "What is Byte Runner?",
      answer: "Byte Runner is an educational endless runner game that teaches cybersecurity concepts through interactive gameplay. You dodge cyber threats, collect protection kits, and learn about real security tools and practices while playing."
    },
    {
      question: "Is it really educational or just a game?",
      answer: "Both! Every threat in the game is based on real cyber attacks (phishing, ransomware, credential stuffing, etc.). When you die, you learn about the actual protection tools professionals use (password managers, VPNs, MFA authenticators, etc.) with step-by-step setup guides. The game includes real-world breach examples like the Colonial Pipeline ransomware attack and LinkedIn data breach."
    },
    {
      question: "What platforms does it work on?",
      answer: "Byte Runner works on all modern web browsers (Chrome, Firefox, Safari, Edge) on both desktop and mobile devices. Mobile users can play using touch controls (drag to move), while desktop users can use WASD or arrow keys. The game is fully responsive and optimized for both platforms."
    },
    {
      question: "Is it free? Will there be premium features?",
      answer: "The game is currently 100% free to play with no ads and no data collection. In the future, we may add premium features like advanced threat types, daily challenges, and leaderboards. The core educational content will always remain free. We're also exploring options for enterprise licensing for company security training."
    },
    {
      question: "How do I report bugs or give feedback?",
      answer: "We'd love to hear from you! You can email us at connect@knacksters.co. Please include details about what happened, what browser/device you're using, and any error messages you saw. Your feedback helps us improve the game for everyone!"
    },
    {
      question: "Can I use this for my company's security training?",
      answer: "Yes! Byte Runner covers 8 core cybersecurity topics (passwords, phishing, updates, privacy, WiFi security, MFA, backups, and social engineering) with 15 different threat types. While it's not a replacement for comprehensive security training, it's a great supplement for security awareness programs. We're currently developing enterprise features like admin dashboards, progress tracking, and compliance reporting. Contact us at connect@knacksters.co for more information."
    },
    {
      question: "What cybersecurity topics does it cover?",
      answer: "Byte Runner covers 8 main security categories: (1) Password Security - weak passwords, credential stuffing; (2) Phishing - email scams, spear phishing; (3) Software Updates - zero-day exploits, patches; (4) Privacy - doxing, data harvesting; (5) WiFi Security - evil twin attacks; (6) Multi-Factor Authentication - session hijacking; (7) Data Loss Prevention - ransomware, backups; (8) Social Engineering - pretexting, baiting. Each category includes real-world examples and practical defenses."
    },
    {
      question: "How do protection kits work? Why did I die?",
      answer: "Each of the 8 protection kits defends against specific threats. For example, the Password Manager kit protects against weak password attacks, while the Link Analyzer kit protects against phishing emails. When you're hit by a threat, the game automatically uses the matching kit from your inventory to save you. If you don't have the right kit (or any backup kit as an extra life), it's game over. This teaches you that in real cybersecurity, you need the right tool for each threat."
    },
    {
      question: "Will my progress be saved?",
      answer: "Currently, only your high score is saved locally in your browser. Your level progress and kit inventory are reset when you restart. In future updates, we may add cloud saves and user accounts. If you pass the quiz after dying, you can continue from your current level with your kits intact!"
    },
    {
      question: "Is there a leaderboard or multiplayer?",
      answer: "Not yet! Leaderboards and social features are on our roadmap. Currently, you compete against \"ghost players\" (AI opponents who send threats at you), but there's no real-time multiplayer. We're considering adding global leaderboards, friend challenges, and daily competitions in future updates. Let us know if these features interest you!"
    },
    {
      question: "What's the difference between zones?",
      answer: "The game has 4 zones that you progress through: Home Network (levels 1-3), Office Environment (4-6), Mobile Zone (7-9), and Cloud Zone (10+). Each zone has different visual themes, environmental hazards, and threat focuses. For example, the Office Environment emphasizes phishing and social engineering, while the Cloud Zone features advanced persistent threats."
    },
    {
      question: "How does the quiz system work?",
      answer: "When you die, you can choose to take a quiz about the protection kit that could have saved you. Pass the quiz (answer questions correctly within 30 seconds) and you continue from your current level with all your kits. Fail the quiz and you restart from level 1, but keep 50% of your collected kits. The quiz tests your understanding of the security concepts you just learned."
    },
    {
      question: "Can I play offline?",
      answer: "Not currently, but Byte Runner is designed as a Progressive Web App (PWA) and we're working on offline support. Once implemented, you'll be able to install it on your device and play without an internet connection after the initial load."
    },
    {
      question: "Is the educational content accurate?",
      answer: "Yes! All threats, tools, and breach examples are based on real cybersecurity research and incidents. We cite specific breaches (with dates), recommend actual tools professionals use (Bitwarden, ProtonVPN, Authy, etc.), and provide step-by-step setup guides. However, Byte Runner is a simplified educational game and should not replace professional security training or certification programs."
    },
    {
      question: "Why can't I move during the healing tutorial?",
      answer: "When you use a protection kit to survive a threat, the game pauses and shows you a 7-second educational overlay about that security tool. This is intentional - it forces you to read about the defense before continuing. Think of it as a mandatory mini-lesson that could save you from real-world attacks. The game resumes automatically after the timer expires."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to know about Byte Runner
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 border-2 border-cyan-800 rounded-lg p-6 hover:border-cyan-600 transition-colors"
            >
              <h2 className="text-xl font-bold text-cyan-400 mb-3 flex items-start gap-3">
                <span className="text-cyan-600 flex-shrink-0">Q{index + 1}.</span>
                <span>{faq.question}</span>
              </h2>
              <p className="text-gray-300 leading-relaxed ml-0 md:ml-9">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-cyan-400 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-300 mb-4">
            We're here to help! Reach out to us anytime.
          </p>
          <a 
            href="mailto:connect@knacksters.co"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            📧 Contact Us
          </a>
        </div>

        {/* Back to game */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-cyan-400 hover:text-cyan-300 underline text-lg transition-colors"
          >
            ← Back to Game
          </a>
        </div>
      </div>
    </div>
  )
}
