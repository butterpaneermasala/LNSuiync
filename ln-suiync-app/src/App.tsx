import { useState, useEffect, useRef } from 'react';
import { 
  Github, Twitter, Mail, Copy, ExternalLink, CheckCircle, 
  Loader2, ChevronDown, ChevronUp, Zap, ArrowRight, 
  Bitcoin, RotateCw, Sparkles, Shield, RefreshCw, BookOpen, Info
} from 'lucide-react';
import './App.css';

// SVG Components
const LightningIcon = () => (
  <svg viewBox="0 0 24 24" className="lightning-icon">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SuiLogo = () => (
  <a href="https://cryptologos.cc/logos/sui-sui-logo.svg?v=040" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 64 64" className="sui-logo" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#6FBCF0" />
      <path d="M32 16c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0 28c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z" fill="#FFF" />
      <path d="M32 24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#FFF" />
    </svg>
  </a>
);


type InvoiceStatus = 'pending' | 'paid' | 'expired';
type InvoiceDetails = {
  status: InvoiceStatus;
  invoice: string;
  id: string;
  expiry: number;
  amount?: number;
  recipient?: string;
  lnsAmount?: number;
};

type TransactionStep = {
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  icon: JSX.Element;
};

const API_BASE_URL = 'http://localhost:3000';

function App() {
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'bridge' | 'check'>('bridge');
  const [copied, setCopied] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [checkInvoiceId, setCheckInvoiceId] = useState<string>('');
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [networkFee, setNetworkFee] = useState<string>('0.5');
  const [slippage, setSlippage] = useState<string>('1.0');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [activeLearnTab, setActiveLearnTab] = useState<'lightning' | 'sui' | 'bridge'>('lightning');
  const [showLearnModal, setShowLearnModal] = useState<boolean>(false);

  // Conversion rate: 10^8 sats = 1 LNS
  const SATS_TO_LNS = 100000000;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (invoiceDetails) {
      const steps: TransactionStep[] = [
        {
          title: 'Invoice Generated',
          description: 'Waiting for payment',
          status: invoiceDetails.status === 'paid' ? 'completed' : 'pending',
          icon: <Bitcoin size={18} />
        },
        {
          title: 'Payment Received',
          description: 'Verifying on Lightning Network',
          status: invoiceDetails.status === 'paid' ? 'completed' : 'pending',
          icon: <LightningIcon />
        },
        {
          title: 'Minting LNS Tokens',
          description: 'Bridging to Sui blockchain',
          status: invoiceDetails.status === 'paid' ? 'completed' : 'pending',
          icon: <SuiLogo />
        },
        {
          title: 'Transaction Complete',
          description: 'Tokens sent to recipient',
          status: invoiceDetails.status === 'paid' ? 'completed' : 'pending',
          icon: <CheckCircle size={18} />
        }
      ];
      setTransactionSteps(steps);

      // Start polling for payment status if not already paid
      if (invoiceDetails.status !== 'paid') {
        const interval = setInterval(() => {
          checkInvoiceStatus(invoiceDetails.id);
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
      }
    }
  }, [invoiceDetails]);

  const checkInvoiceStatus = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoice-status/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to check invoice status');
      }
      const data = await response.json();
      
      if (data.paid) {
        setInvoiceDetails(prev => prev ? {
          ...prev,
          status: 'paid'
        } : null);
        setPaymentStatus('Payment confirmed! Tokens will be minted shortly.');
      }
    } catch (error) {
      console.error('Error checking invoice status:', error);
    }
  };

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
    setInvoiceDetails(null);
    setPaymentStatus('');

    try {
      const response = await fetch(`${API_BASE_URL}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          recipientAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const data = await response.json();
      setInvoiceDetails({
        ...data,
        amount: Number(amount),
        recipient: recipientAddress,
        lnsAmount: Number(amount) / SATS_TO_LNS,
        status: 'pending'
      });
      setPaymentStatus('Invoice generated. Waiting for payment...');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkInvoiceId) {
      alert('Please enter an invoice ID.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/invoice-status/${checkInvoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to check invoice status');
      }
      const data = await response.json();
      
      // Format a more detailed response
      const statusMessage = `
        Status: ${data.paid ? 'Paid ✓' : 'Pending ⏱️'}
        Amount: ${data.amount.toLocaleString()} sats
        ${data.paid ? `Confirmed: ${new Date(data.confirmedAt * 1000).toLocaleString()}` : ''}
      `;
      
      alert(statusMessage);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to check invoice status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateMiddle = (str: string, front = 6, back = 4) =>
    str.length > front + back ? `${str.slice(0, front)}...${str.slice(-back)}` : str;

  const formatExpiry = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const calculateReceiveAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    const feeNum = parseFloat(networkFee) || 0;
    const lnsAmount = (amountNum - (amountNum * feeNum / 100)) / SATS_TO_LNS;
    return lnsAmount.toFixed(8);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="lightning-bolt"></div>
        <div className="sui-orb"></div>
        <div className="floating-dots"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="nav-bar glass">
        <div className="logo-section">
          <span className="logo-text">LNSuinyc</span>
        </div>
        <div className="nav-links">
          <button onClick={() => setShowLearnModal(true)} className="nav-button">
            <BookOpen size={18} />
            <span>Learn</span>
          </button>
          <button onClick={() => setShowAbout(!showAbout)} className="nav-button">
            Docs
          </button>
          <a
            href="https://github.com/organization/LNSuinyc"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-button"
          >
            <Github size={18} />
          </a>
          <button className="connect-wallet">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`main-content ${isVisible ? 'visible' : ''}`}>
        <div className="bridge-container">
          <h1 className="title">
            <span className="title-gradient">Lightning to Sui Bridge</span>
          </h1>
          <p className="subtitle">Convert Bitcoin Lightning payments to LNS tokens on Sui blockchain</p>

          {/* Bridge Card */}
          <div className="bridge-card-container">
            <div className={`bridge-card ${isFlipped ? 'flipped' : ''}`}>
              {/* Front Side - Bridge Form */}
              <div className="card-front glass">
                <div className="card-header">
                  <div className="card-tabs">
                    <button
                      className={`tab-button ${activeTab === 'bridge' ? 'active' : ''}`}
                      onClick={() => setActiveTab('bridge')}
                    >
                      Bridge
                    </button>
                    <button
                      className={`tab-button ${activeTab === 'check' ? 'active' : ''}`}
                      onClick={() => setActiveTab('check')}
                    >
                      Check Status
                    </button>
                  </div>
                  <button className="flip-button" onClick={handleFlip}>
                    <RotateCw size={16} />
                    <span>Verification</span>
                  </button>
                </div>

                <div className="card-content">
                  {activeTab === 'bridge' ? (
                    <>
                      <div className="input-group">
                        <label>You pay</label>
                        <div className="input-container">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                          />
                          <div className="input-suffix">
                            <Bitcoin size={16} />
                            <span>sats</span>
                          </div>
                        </div>
                        <div className="input-hint">1 LNS = 100,000,000 sats</div>
                      </div>

                      <div className="swap-arrow">
                        <ArrowRight size={24} />
                      </div>

                      <div className="input-group">
                        <label>You receive</label>
                        <div className="input-container receive">
                          <input
                            type="text"
                            value={calculateReceiveAmount()}
                            readOnly
                            placeholder="0"
                          />
                          <div className="input-suffix">
                            <SuiLogo />
                            <span>LNS</span>
                          </div>
                        </div>
                        <div className="receive-details">
                          <span>Rate: 10<sup>8</sup> sats = 1 LNS</span>
                          <span>Fee: {networkFee}%</span>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Recipient Sui Address</label>
                        <div className="input-container">
                          <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="0x..."
                            className="address-input"
                          />
                        </div>
                      </div>

                      <div className="advanced-section">
                        <button 
                          className="advanced-toggle"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          <span>Advanced Settings</span>
                        </button>
                        {showAdvanced && (
                          <div className="advanced-options glass">
                            <div className="option-row">
                              <label>
                                <Shield size={16} />
                                <span>Network Fee</span>
                              </label>
                              <select value={networkFee} onChange={(e) => setNetworkFee(e.target.value)}>
                                <option value="0.5">0.5% (Recommended)</option>
                                <option value="1.0">1.0%</option>
                                <option value="1.5">1.5%</option>
                              </select>
                            </div>
                            <div className="option-row">
                              <label>
                                <Sparkles size={16} />
                                <span>Slippage</span>
                              </label>
                              <select value={slippage} onChange={(e) => setSlippage(e.target.value)}>
                                <option value="0.5">0.5%</option>
                                <option value="1.0">1.0% (Default)</option>
                                <option value="2.0">2.0%</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {paymentStatus && (
                        <div className="status-message">
                          {paymentStatus}
                        </div>
                      )}

                      <button 
                        onClick={handleGenerateInvoice} 
                        disabled={loading || !amount || !recipientAddress}
                        className="primary-button glow-on-hover"
                      >
                        {loading ? (
                          <div className="loading-wrapper">
                            <Loader2 className="loading-spin" size={20} />
                            <span>Generating Invoice...</span>
                          </div>
                        ) : (
                          <>
                            <LightningIcon />
                            <span>Generate Lightning Invoice</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="check-status">
                      <div className="input-group">
                        <label>Invoice ID</label>
                        <div className="input-container">
                          <input
                            type="text"
                            value={checkInvoiceId}
                            onChange={(e) => setCheckInvoiceId(e.target.value)}
                            placeholder="Enter invoice ID"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleCheckStatus} 
                        disabled={loading || !checkInvoiceId}
                        className="secondary-button"
                      >
                        {loading ? (
                          <div className="loading-wrapper">
                            <Loader2 className="loading-spin" size={20} />
                            <span>Checking Status...</span>
                          </div>
                        ) : (
                          <>
                            <RefreshCw size={18} />
                            <span>Check Status</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Side - Verification Info */}
              <div className="card-back glass">
                <div className="card-header">
                  <h3>Transaction Verification</h3>
                  <button className="flip-button" onClick={handleFlip}>
                    <RotateCw size={16} />
                    <span>Back to Bridge</span>
                  </button>
                </div>
                
                <div className="card-content verification-content">
                  {invoiceDetails ? (
                    <>
                      <div className="verification-grid">
                        <div className="verification-item">
                          <span>Invoice ID</span>
                          <code>{invoiceDetails.id}</code>
                        </div>
                        <div className="verification-item">
                          <span>Amount</span>
                          <code>{invoiceDetails.amount?.toLocaleString()} sats</code>
                        </div>
                        <div className="verification-item">
                          <span>Recipient</span>
                          <code>{truncateMiddle(invoiceDetails.recipient || '')}</code>
                        </div>
                        <div className="verification-item">
                          <span>Status</span>
                          <code className={invoiceDetails.status}>
                            {invoiceDetails.status === 'paid' ? 'Confirmed' : 'Pending'}
                          </code>
                        </div>
                      </div>
                      
                      <div className="security-badge">
                        <Shield size={20} />
                        <span>Secured by Lightning Network and Sui Blockchain</span>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>Generate an invoice to see transaction details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          {invoiceDetails && (
            <div className="transaction-details glass">
              <h3>Transaction Progress</h3>
              
              <div className="progress-steps">
                {transactionSteps.map((step, index) => (
                  <div key={index} className={`step ${step.status}`}>
                    <div className="step-icon">
                      {step.status === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="step-icon-content">
                          {step.icon}
                        </span>
                      )}
                    </div>
                    <div className="step-content">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Invoice Amount</span>
                  <span>{invoiceDetails.amount?.toLocaleString()} sats</span>
                </div>
                <div className="detail-item">
                  <span>Receive Amount</span>
                  <span>{invoiceDetails.lnsAmount?.toFixed(8)} LNS</span>
                </div>
                <div className="detail-item">
                  <span>Recipient</span>
                  <span>{truncateMiddle(invoiceDetails.recipient || '')}</span>
                </div>
                <div className="detail-item">
                  <span>Expires in</span>
                  <span>{formatExpiry(invoiceDetails.expiry)}</span>
                </div>
              </div>

              <div className="invoice-actions">
                <button 
                  onClick={() => copyToClipboard(invoiceDetails.invoice)} 
                  className="action-btn"
                >
                  <Copy size={16} />
                  <span>{copied ? 'Copied!' : 'Copy Invoice'}</span>
                </button>
                <a
                  href={`lightning:${invoiceDetails.invoice}`}
                  className="action-btn primary"
                >
                  <ExternalLink size={16} />
                  <span>Open in Wallet</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer glass">
        <div className="footer-content">
          <div className="footer-logo">
            <span>LNSuinyc Bridge</span>
          </div>
          <div className="footer-links">
            <a href="https://github.com/organization/LNSuinyc" target="_blank" rel="noopener noreferrer">
              Github
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="mailto:contact@lnsuinyc.com">Contact</a>
            <button onClick={() => setShowAbout(true)}>Documentation</button>
          </div>
        </div>
        <div className="footer-disclaimer">
          <p>LNSuinyc Bridge is an open-source project. Use at your own risk.</p>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="about-modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="about-header">
              <h2>LNSuinyc Bridge Documentation</h2>
              <button onClick={() => setShowAbout(false)} className="close-button">
                ✕
              </button>
            </div>
            <div className="docs-section">
              <h3>How It Works</h3>
              <p>
                The LNSuinyc Bridge allows you to convert Bitcoin Lightning Network payments to LNS tokens on the Sui blockchain at a 1:10<sup>8</sup> ratio (100,000,000 sats = 1 LNS).
              </p>
              
              <div className="process-flow">
                <div className="flow-step">
                  <div className="flow-icon">
                    <Bitcoin size={20} />
                  </div>
                  <span>Pay Lightning Invoice</span>
                </div>
                <ArrowRight size={16} className="flow-arrow"/>
                <div className="flow-step">
                  <div className="flow-icon">
                    <LightningIcon />
                  </div>
                  <span>Payment Verification</span>
                </div>
                <ArrowRight size={16} className="flow-arrow"/>
                <div className="flow-step">
                  <div className="flow-icon">
                    <SuiLogo />
                  </div>
                  <span>LNS Tokens Minted</span>
                </div>
              </div>
              
              <h3>Conversion Rate</h3>
              <p>
                The fixed conversion rate is <strong>100,000,000 satoshis = 1 LNS token</strong>. This ensures 1:1 value representation between Bitcoin and the wrapped LNS token on Sui.
              </p>
              
              <h3>Security</h3>
              <p>
                Every transaction is secured by both the Lightning Network's payment verification system and Sui blockchain's consensus mechanisms, creating a trustless bridge between the two networks.
              </p>
              
              <h3>Fees</h3>
              <p>
                The bridge charges a small network fee to cover Lightning routing costs and Sui transaction fees. The default fee is 0.5%.
              </p>
            </div>
            <div className="social-links">
              <span>Connect with us:</span>
              <a href="https://github.com/organization/LNSuinyc" target="_blank" rel="noopener noreferrer">
                <Github size={18} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </a>
              <a href="mailto:contact@lnsuinyc.com">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Learn Modal */}
      {showLearnModal && (
        <div className="learn-modal-overlay" onClick={() => setShowLearnModal(false)}>
          <div className="learn-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="learn-header">
              <h2>Learn About the Technology</h2>
              <button onClick={() => setShowLearnModal(false)} className="close-button">
                ✕
              </button>
            </div>
            
            <div className="learn-tabs">
              <button 
                className={`learn-tab ${activeLearnTab === 'lightning' ? 'active' : ''}`}
                onClick={() => setActiveLearnTab('lightning')}
              >
                <Zap size={16} />
                <span>Lightning Network</span>
              </button>
              <button 
                className={`learn-tab ${activeLearnTab === 'sui' ? 'active' : ''}`}
                onClick={() => setActiveLearnTab('sui')}
              >
                <SuiLogo />
                <span>Sui Blockchain</span>
              </button>
              <button 
                className={`learn-tab ${activeLearnTab === 'bridge' ? 'active' : ''}`}
                onClick={() => setActiveLearnTab('bridge')}
              >
                <ArrowRight size={16} />
                <span>The Bridge</span>
              </button>
            </div>
            
            <div className="learn-content">
              {activeLearnTab === 'lightning' && (
                <div className="learn-section">
                  <h3>What is the Lightning Network?</h3>
                  <p>
                    The Lightning Network is a "Layer 2" payment protocol layered on top of Bitcoin (and other blockchains). 
                    It enables fast transactions between participating nodes and has been proposed as a solution to the 
                    Bitcoin scalability problem.
                  </p>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Zap size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>Instant Payments</h4>
                      <p>
                        Lightning-fast blockchain payments without worrying about block confirmation times.
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Bitcoin size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>Scalability</h4>
                      <p>
                        Capable of millions to billions of transactions per second across the network.
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Shield size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>Low Fees</h4>
                      <p>
                        Transaction fees are extremely low because they don't require on-chain settlement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeLearnTab === 'sui' && (
                <div className="learn-section">
                  <h3>What is Sui Blockchain?</h3>
                  <p>
                    Sui is a decentralized proof-of-stake blockchain with horizontally scalable processing and storage. 
                    It's designed to enable creators and developers to build experiences that cater to the next billion 
                    users in web3.
                  </p>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Sparkles size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>High Performance</h4>
                      <p>
                        Sui scales horizontally to meet application demand, eliminating bottlenecks.
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <RotateCw size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>Instant Settlement</h4>
                      <p>
                        Transactions are confirmed and finalized in real-time.
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Shield size={24} />
                    </div>
                    <div className="feature-content">
                      <h4>Secure</h4>
                      <p>
                        Built with Move, a safe language for smart contracts.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeLearnTab === 'bridge' && (
                <div className="learn-section">
                  <h3>How the Bridge Works</h3>
                  <p>
                    The LNSuinyc Bridge creates a seamless connection between Bitcoin's Lightning Network and the Sui blockchain, 
                    allowing you to convert Lightning payments into LNS tokens that can be used in the Sui ecosystem.
                  </p>
                  
                  <div className="process-flow">
                    <div className="flow-step">
                      <div className="flow-icon">
                        <Bitcoin size={20} />
                      </div>
                      <span>1. User pays Lightning invoice</span>
                    </div>
                    <ArrowRight size={16} className="flow-arrow"/>
                    <div className="flow-step">
                      <div className="flow-icon">
                        <LightningIcon />
                      </div>
                      <span>2. Payment verified on Lightning</span>
                    </div>
                    <ArrowRight size={16} className="flow-arrow"/>
                    <div className="flow-step">
                      <div className="flow-icon">
                        <SuiLogo />
                      </div>
                      <span>3. Equivalent LNS tokens minted on Sui</span>
                    </div>
                    <ArrowRight size={16} className="flow-arrow"/>
                    <div className="flow-step">
                      <div className="flow-icon">
                        <CheckCircle size={20} />
                      </div>
                      <span>4. Tokens sent to recipient address</span>
                    </div>
                  </div>
                  
                  <h4>Why Use the Bridge?</h4>
                  <ul className="benefits-list">
                    <li>
                      <CheckCircle size={16} />
                      <span>Access Sui DeFi with Bitcoin liquidity</span>
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      <span>Fast and low-cost transactions</span>
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      <span>Secure and trustless operation</span>
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      <span>Fixed 1:10<sup>8</sup> conversion rate</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;