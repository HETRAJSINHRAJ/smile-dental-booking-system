'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  getIndianHealthcarePrivacyPolicy, 
  getPatientConsentForm,
  INDIAN_HEALTHCARE_COMPLIANCE 
} from '@/lib/compliance/healthcarePrivacy';

interface PrivacyPolicyProps {
  showConsentForm?: boolean;
  onConsentGiven?: (consent: boolean) => void;
  className?: string;
}

export default function PrivacyPolicy({ 
  showConsentForm = false, 
  onConsentGiven,
  className = ''
}: PrivacyPolicyProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  const handleConsentChange = (given: boolean) => {
    setConsentGiven(given);
    onConsentGiven?.(given);
  };

  const downloadPrivacyPolicy = () => {
    const policyText = getIndianHealthcarePrivacyPolicy();
    const blob = new Blob([policyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Privacy-Policy-Healthcare-India.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadConsentForm = () => {
    const consentText = getPatientConsentForm();
    const blob = new Blob([consentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Patient-Consent-Form.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Privacy Policy Summary */}
      <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Your Privacy is Our Priority
            </h3>
            <p className="text-blue-800 mb-4">
              We comply with Indian healthcare data protection regulations including DISHA Act, 
              IT Act 2000, and Personal Data Protection Bill. Your medical information is 
              encrypted and stored securely within India.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Data encrypted and secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Stored within India</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">7-year retention policy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Regular security audits</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullPolicy(!showFullPolicy)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                {showFullPolicy ? 'Hide' : 'View'} Full Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPrivacyPolicy}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Policy
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Full Privacy Policy */}
      {showFullPolicy && (
        <Card className="p-6 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {getIndianHealthcarePrivacyPolicy()}
          </pre>
        </Card>
      )}

      {/* Consent Form */}
      {showConsentForm && (
        <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Patient Consent Required
              </h3>
              
              <div className="bg-white p-4 rounded-lg border mb-4 max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">
                  {getPatientConsentForm()}
                </pre>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => handleConsentChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I have read and agree to the terms and provide my consent for data processing
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadConsentForm}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Consent Form
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}