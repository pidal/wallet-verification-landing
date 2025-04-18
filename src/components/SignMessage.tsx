import React, { useState } from 'react';
import { Wallet as WalletX, Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { saveVerification } from '../storage';

export default function SignMessage() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
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
      setCurrentStep(2);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const getMessage = () => {
    return requestId;
  };

  const signMessage = async () => {
    if (!signer || !requestId) return;

    try {
      const message = getMessage();
      const signature = await signer.signMessage(message);
      setSignature(signature);
      setCurrentStep(4);

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

  const renderStep = (number: number, title: string, isCompleted: boolean) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isCompleted ? 'bg-green-100 text-green-600' : 
        currentStep === number ? 'bg-blue-600 text-white' : 
        'bg-gray-100 text-gray-400'
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <span className="font-semibold">{number}</span>
        )}
      </div>
      <span className={`ml-3 font-medium ${
        isCompleted ? 'text-green-600' : 
        currentStep === number ? 'text-gray-900' : 
        'text-gray-400'
      }`}>{title}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-6">
          {/* Progress Steps */}
          <div className="flex flex-col space-y-4">
            {renderStep(1, "Connect Wallet", currentStep > 1)}
            {renderStep(2, "Enter Request ID", currentStep > 2)}
            {renderStep(3, "Verify Wallet", currentStep > 3)}
            {renderStep(4, "Save Receipt", currentStep === 4)}
          </div>

          {/* Step Content */}
          <div className="mt-6 pt-6 border-t">
            {currentStep === 1 && (
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Connect your wallet to begin the verification process</p>
                <button
                  onClick={connectWallet}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <WalletX className="w-5 h-5 mr-2" />
                  <span>Connect Wallet</span>
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-4">
                  <Wallet className="w-5 h-5 mr-2" />
                  <span>Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request ID
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    This ID will be used as the message to sign
                  </p>
                  <input
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    placeholder="Enter the request ID"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!requestId}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Verify Your Wallet</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Wallet Address</label>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <code className="text-sm">{address}</code>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Request ID</label>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <code className="text-sm">{getMessage()}</code>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={signMessage}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Message
                </button>
              </div>
            )}

            {currentStep === 4 && signature && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-600 mb-4">
                    <CheckCircle2 className="w-6 h-6 mr-2" />
                    <span className="font-medium">Verification Complete!</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wallet Address
                      </label>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <code className="text-sm">{address}</code>
                        <button
                          onClick={() => copyToClipboard(address)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <code className="text-sm">{getMessage()}</code>
                        <button
                          onClick={() => copyToClipboard(getMessage())}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Signature
                      </label>
                      <div className="flex items-start justify-between p-2 bg-white rounded">
                        <code className="text-sm break-all pr-4 max-h-24 overflow-y-auto">{signature}</code>
                        <button
                          onClick={() => copyToClipboard(signature)}
                          className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}