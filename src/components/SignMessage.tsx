import React, { useState } from 'react';
import { Wallet as WalletX, Wallet } from 'lucide-react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { saveVerification } from '../storage';

export default function SignMessage() {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setIsConnected(true);
      setSigner(signer);
      setAddress(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const signMessage = async () => {
    if (!signer || !message) return;

    try {
      const signature = await signer.signMessage(message);
      setSignature(signature);
      
      const verification = {
        address: address,
        message: message,
        signature: signature,
        timestamp: Date.now(),
      };
      
      saveVerification(verification);
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign message');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Wallet Connection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Connect Your Wallet</h2>
          <button
            onClick={connectWallet}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConnected ? (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                <span className="font-medium">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
              </>
            ) : (
              <>
                <WalletX className="w-5 h-5 mr-2" />
                <span className="font-medium">Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sign Message Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sign Message</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message to Sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <button
            onClick={signMessage}
            disabled={!isConnected || !message}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign Message
          </button>
        </div>
      </div>

      {/* Signature Result */}
      {signature && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Signature</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <div className="p-3 bg-gray-50 rounded-lg break-all">
                {message}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature
              </label>
              <div className="relative">
                <div className="p-3 bg-gray-50 rounded-lg break-all">
                  {signature}
                </div>
                <button
                  onClick={() => copyToClipboard(signature)}
                  className="absolute top-2 right-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}