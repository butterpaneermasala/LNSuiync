import { useState, useEffect } from 'react';
import { Github, Twitter, Mail, Copy, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [copied, setCopied] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // For animation effects
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Interface for invoice details
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const handleGenerateInvoice = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!recipientAddress) {
      alert('Please enter a valid recipient address.');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be your actual API endpoint
      // For demo purposes, we'll simulate the API response
      setTimeout(() => {
        setInvoiceDetails({
          status: 'Pending',
          invoice: 'lnbc10u1p3xhwjhpp5yztkwjcz5ftl5laxkav9ksjt6w8f0qmk0wxymsgy289yv5xw9qhsdqqcqzpgxqyz5vqsp5usyc4lk9chsfp53kvcnvq456ganh60d89spqgzm93q9tkvjz3fq9qyyssqmfn3kn66xx3uijl4hmr5j33l5g5h2szmwjtvs8f0g4uvj6jnl3uyjvpgnh832v9wfgk5qvksq8jlpxms6d60dztk93feflyuz07utkcpv7kx7v',
          expiry: '60 minutes'
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the invoice.');
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 flex flex-col items-center justify-center p-4">
      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-xl">LNSuiync</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowAbout(!showAbout)} className="text-white hover:text-yellow-200 transition-colors">
            About
          </button>
          <a href="https://Github.com/butterpaneermasala/LNSuiync" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-200 transition-colors">
            <Github size={20} />
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="glass-container bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white border-opacity-20 w-full max-w-xl">
          {/* About Modal */}
          {showAbout && (
            <div className="mb-8 text-left bg-white bg-opacity-10 p-6 rounded-xl animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">About LNSuiync</h2>
                <button onClick={() => setShowAbout(false)} className="text-white opacity-70 hover:opacity-100">
                  ✕
                </button>
              </div>
              <p className="text-white mb-4">
                LNSuiync is a bridge between Lightning Network and Sui blockchain, allowing for seamless cross-chain transactions.
                Our mission is to create a frictionless experience for transferring value across different blockchain ecosystems.
              </p>
              <div className="flex items-center gap-4 text-white">
                <span>Connect with us:</span>
                <a href="https://Github.com/butterpaneermasala/LNSuiync" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://twitter.com/LNSuiync" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="mailto:contact@lnsuiync.com" className="hover:text-yellow-200 transition-colors">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2 text-white text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">LN to Sui Bridge</span>
          </h1>
          <p className="text-white opacity-80 mb-6 text-center">
            Bridge your Bitcoin Lightning funds to the Sui blockchain
          </p>
          
          {/* Tabs */}
          <div className="flex mb-6 bg-white bg-opacity-10 rounded-lg p-1">
            <button
              className={`flex-1 py-2 rounded-md transition-all ${activeTab === 'generate' ? 'bg-white bg-opacity-20 text-white' : 'text-white text-opacity-70'}`}
              onClick={() => setActiveTab('generate')}
            >
              Generate Invoice
            </button>
            <button
              className={`flex-1 py-2 rounded-md transition-all ${activeTab === 'check' ? 'bg-white bg-opacity-20 text-white' : 'text-white text-opacity-70'}`}
              onClick={() => setActiveTab('check')}
            >
              Check Status
            </button>
          </div>

          {activeTab === 'generate' ? (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="amount" className="block text-white mb-1 text-left">Amount (in Satoshis):</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
              <div>
                <label htmlFor="recipientAddress" className="block text-white mb-1 text-left">Recipient Sui Address:</label>
                <input
                  type="text"
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
              <button 
                onClick={handleGenerateInvoice} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating...</span>
                  </div>
                ) : 'Generate Lightning Invoice'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="checkInvoice" className="block text-white mb-1 text-left">Invoice ID or Hash:</label>
                <input
                  type="text"
                  id="checkInvoice"
                  placeholder="Enter invoice ID"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95">
                Check Status
              </button>
            </div>
          )}

          {/* Invoice Details */}
          {invoiceDetails && (
            <div className="mt-8 animate-fadeIn">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-left">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-lg">Invoice Generated</h3>
                  <span className="bg-green-500 bg-opacity-20 text-green-300 text-sm px-2 py-1 rounded-full">
                    {invoiceDetails.status}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-white opacity-70 text-sm mb-1">Lightning Invoice:</p>
                  <div className="flex items-center bg-black bg-opacity-30 p-3 rounded-lg">
                    <div className="overflow-hidden overflow-ellipsis text-white text-sm flex-1">
                      {invoiceDetails.invoice.substring(0, 30)}...{invoiceDetails.invoice.substring(invoiceDetails.invoice.length - 10)}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(invoiceDetails.invoice)}
                      className="ml-2 text-white opacity-70 hover:opacity-100 transition-all"
                    >
                      {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-white text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Amount:</span>
                    <span>{amount} satoshis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Recipient:</span>
                    <span className="overflow-hidden overflow-ellipsis max-w-xs">
                      {recipientAddress.substring(0, 8)}...{recipientAddress.substring(recipientAddress.length - 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Expiry:</span>
                    <span>60 minutes</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-transparent border border-white border-opacity-20 text-white py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-1">
                    <ExternalLink size={16} />
                    <span>Open in Wallet</span>
                  </button>
                  <button 
                    onClick={() => copyToClipboard(invoiceDetails.invoice)}
                    className="flex-1 bg-transparent border border-white border-opacity-20 text-white py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-1"
                  >
                    <Copy size={16} />
                    <span>Copy Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-10 transform transition-all hover:scale-105 hover:bg-opacity-20">
              <div className="w-10 h-10 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Fast Transfers</h3>
              <p className="text-white opacity-70 text-sm">Lightning-fast transfers between Bitcoin and Sui networks</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-10 transform transition-all hover:scale-105 hover:bg-opacity-20">
              <div className="w-10 h-10 bg-blue-400 bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Secure Bridge</h3>
              <p className="text-white opacity-70 text-sm">End-to-end encrypted transactions for maximum security</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-10 transform transition-all hover:scale-105 hover:bg-opacity-20">
              <div className="w-10 h-10 bg-green-400 bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Low Fees</h3>
              <p className="text-white opacity-70 text-sm">Minimal fees for cross-chain transfers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-white opacity-70 text-sm flex flex-col items-center">
        <div className="flex gap-6 mb-4">
          <a href="https://Github.com/butterpaneermasala/LNSuiync" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
            <Github size={18} />
          </a>
          <a href="https://twitter.com/LNSuiync" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
            <Twitter size={18} />
          </a>
          <a href="mailto:contact@lnsuiync.com" className="hover:text-yellow-200 transition-colors">
            <Mail size={18} />
          </a>
        </div>
        <p>© 2025 LNSuiync. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;