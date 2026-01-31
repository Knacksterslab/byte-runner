import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-black/90 border-t border-cyan-900 text-gray-400 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-center md:text-left">
            <p className="text-cyan-400 font-bold">Byte Runner</p>
            <p>© {currentYear} Byte Runner. All rights reserved.</p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link 
              href="/privacy" 
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/faq" 
              className="hover:text-cyan-400 transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* Contact */}
          <div className="text-sm text-center md:text-right">
            <p>Questions or feedback?</p>
            <a 
              href="mailto:connect@knacksters.co" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              connect@knacksters.co
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-center text-gray-500">
          <p>
            Educational game. Not a substitute for professional cybersecurity training.
          </p>
        </div>
      </div>
    </footer>
  )
}
