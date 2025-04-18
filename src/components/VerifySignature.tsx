import React, { useState } from 'react';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { verifyMessage } from 'ethers';
import { getVerifications } from '../storage';

export default function VerifySignature() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [address, setAddress] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    address: string;
  } | null>(null);

  const verifySignature = async () => {
    if (!message || !signature || !address) return;

    try {
      const recoveredAddress = await verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        setVerificationResult({
          isValid: false,
          address: recoveredAddress,
        });
        return;
      }
      
      const verifications = getVerifications();
      const verification = verifications.find(
        v => v.message === message && 
            v.signature === signature && 
            v.address.toLowerCase() === address.toLowerCase()
      );
      
      setVerificationResult({
        isValid: !!verification,
        address: recoveredAddress
      });
    } catch (error) {
      console.error('Error verifying signature:', error);
      setVerificationResult({
        isValid: false,
        address: ''
      });
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Verify Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Verify Signature</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter the wallet address (0x...)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the original message..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
              Signature
            </label>
            <textarea
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter the signature..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <button
            onClick={verifySignature}
            disabled={!message || !signature || !address}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify Signature
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Verification Result</h2>
          <div className={`flex items-center p-4 rounded-lg ${
            verificationResult.isValid ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {verificationResult.isValid ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Signature is valid!</p>
                  <p className="text-sm text-green-600">
                    Signed by: {verificationResult.address.slice(0, 6)}...{verificationResult.address.slice(-4)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Invalid signature</p>
                  <p className="text-sm text-red-600">
                    The signature could not be verified or doesn't match our records.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent Verifications */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Recent Verifications</h2>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signature</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getVerifications().map((v, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{v.address.slice(0, 6)}...{v.address.slice(-4)}</span>
                    <button
                      onClick={() => copyToClipboard(v.address, `address-${i}`)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy full address"
                    >
                      {copiedField === `address-${i}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{v.message.length > 30 ? v.message.slice(0, 30) + '...' : v.message}</span>
                    <button
                      onClick={() => copyToClipboard(v.message, `message-${i}`)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy full message"
                    >
                      {copiedField === `message-${i}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{v.signature.slice(0, 10)}...{v.signature.slice(-8)}</span>
                    <button
                      onClick={() => copyToClipboard(v.signature, `signature-${i}`)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy full signature"
                    >
                      {copiedField === `signature-${i}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(v.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}