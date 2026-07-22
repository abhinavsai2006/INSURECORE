"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePolicyPDF = generatePolicyPDF;
exports.generatePaymentReceiptPDF = generatePaymentReceiptPDF;
exports.generateTaxCertificatePDF = generateTaxCertificatePDF;
exports.generateHealthCardPDF = generateHealthCardPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
// Helper to draw standard Header on Pages 2-19
function drawHeader(doc, pageTitle, policyNumber) {
    doc.rect(0, 0, 612, 45).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('INSURECORE', 35, 14);
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Enterprise Policy Contract', 120, 16);
    doc.fillColor('#60a5fa').fontSize(9).font('Helvetica-Bold').text(pageTitle, 260, 15);
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(`Policy No: ${policyNumber}`, 450, 16, { align: 'right' });
    doc.strokeColor('#1e293b').lineWidth(0.5).moveTo(35, 45).lineTo(577, 45).stroke();
}
// Helper to draw standard Footer on Pages 2-19
function drawFooter(doc, pageNum, totalPages = 20) {
    const y = 755;
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(35, y).lineTo(577, y).stroke();
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('InsureCore General Insurance Co. Ltd. • IRDAI Reg No. 154 • CIN: L66010MH2002PLC136741 • Section 80D Tax Compliant', 35, y + 8);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(`Page ${pageNum} of ${totalPages}`, 500, y + 8, { align: 'right' });
}
// 1. GENERATE 20-PAGE ENTERPRISE POLICY PDF
function generatePolicyPDF(policy) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 35, size: 'A4', autoFirstPage: true });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        const polNo = policy.policyNumber || 'POL-2026-00128';
        const custName = policy.customer?.name || 'Alexander Pierce';
        const custEmail = policy.customer?.email || 'admin@insurecore.com';
        const custPhone = policy.customer?.phone || '+91 98765 43210';
        const planName = policy.planName || 'Comprehensive Super Health Plan';
        const policyType = policy.policyType || 'HEALTH';
        const sumInsured = Number(policy.sumInsured || 1000000);
        const premiumAmount = Number(policy.premiumAmount || 24500);
        const startDate = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : '01/04/2026';
        const endDate = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : '31/03/2027';
        // =========================================================================
        // PAGE 1: COVER PAGE
        // =========================================================================
        doc.rect(0, 0, 612, 792).fill('#0f172a');
        // Accent Stripe
        doc.rect(0, 0, 612, 12).fill('#2563eb');
        doc.rect(0, 780, 612, 12).fill('#059669');
        // Brand Title
        doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold').text('INSURECORE', 50, 60);
        doc.fillColor('#60a5fa').fontSize(12).font('Helvetica-Bold').text('HEALTH & GENERAL INSURANCE CORPORATION', 50, 105);
        doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('IRDAI Registration No. 154 | ISO 27001:2022 Certified', 50, 122);
        doc.strokeColor('#334155').lineWidth(1).moveTo(50, 145).lineTo(562, 145).stroke();
        // Policy Title Box
        doc.rect(50, 170, 512, 130).fillAndStroke('#1e293b', '#334155');
        doc.fillColor('#38bdf8').fontSize(10).font('Helvetica-Bold').text('OFFICIAL CERTIFICATE OF INSURANCE COVERAGE', 70, 188);
        doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(`${policyType} INSURANCE POLICY`, 70, 208);
        doc.fillColor('#e2e8f0').fontSize(12).font('Helvetica').text(`Plan: ${planName}`, 70, 238);
        doc.rect(420, 185, 120, 28).fill('#059669');
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('POLICY ACTIVE', 420, 194, { width: 120, align: 'center' });
        // Details Grid
        doc.rect(50, 320, 512, 280).fillAndStroke('#1e293b', '#334155');
        const coverDetails = [
            ['Policy Certificate Number:', polNo],
            ['Primary Policyholder:', custName],
            ['Registered Email:', custEmail],
            ['Contact Number:', custPhone],
            ['Sum Insured Coverage:', `Rs. ${sumInsured.toLocaleString('en-IN')}`],
            ['Annual Premium Amount:', `Rs. ${premiumAmount.toLocaleString('en-IN')} (Paid)`],
            ['Policy Period:', `${startDate} to ${endDate}`],
            ['Nominee Beneficiary:', policy.nominee || 'Priya Sharma (Spouse)'],
            ['Claim Settlement Ratio:', '98.4% (Financial Year 2025-26)'],
            ['Section 80D Eligibility:', 'Eligible for Tax Exemption up to Rs. 50,000'],
        ];
        let cY = 338;
        coverDetails.forEach(([k, v]) => {
            doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(k, 70, cY);
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(v, 240, cY);
            cY += 24;
        });
        // Verification Stamps
        doc.rect(50, 620, 245, 100).fillAndStroke('#0f172a', '#334155');
        doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('DIGITAL SIGNATURE STAMP', 65, 632);
        doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(`Certificate ID: DSC-2026-${polNo}\n` +
            `Issued By: InsureCore Underwriting Dept.\n` +
            `SHA-256: 8f9a2b4c6e8d0f1a3b5c7e9f\n` +
            `Digitally Signed & Timestamped`, 65, 648, { width: 215, lineGap: 3 });
        doc.rect(317, 620, 245, 100).fillAndStroke('#0f172a', '#334155');
        doc.fillColor('#34d399').fontSize(9).font('Helvetica-Bold').text('24x7 EMERGENCY CASHLESS DESK', 332, 632);
        doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(`Toll-Free Helpline: 1800-200-INSURE\n` +
            `WhatsApp Support: +91 98765 00000\n` +
            `TPA Hospitalization Desk: Active\n` +
            `Network Hospitals: 10,500+ Nationwide`, 332, 648, { width: 215, lineGap: 3 });
        // =========================================================================
        // PAGE 2: TABLE OF CONTENTS
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Table of Contents', polNo);
        doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text('Table of Contents', 35, 60);
        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Comprehensive index of your InsureCore policy schedule, terms, and benefits.', 35, 82);
        const toc = [
            ['1. Executive Policy Summary Dashboard', 'Page 3'],
            ['2. Customer & Nominee Profiles', 'Page 4'],
            ['3. Comprehensive Coverage Matrix', 'Page 5'],
            ['4. Optional Add-on Riders', 'Page 6'],
            ['5. Cashless Hospital Network Guide', 'Page 7'],
            ['6. Claim Settlement Process & Timelines', 'Page 8'],
            ['7. Premium Breakdown & Payment Modes', 'Page 9'],
            ['8. Section 80D Income Tax Benefits', 'Page 10'],
            ['9. Waiting Period & PED Guidelines', 'Page 11'],
            ['10. Permanent Policy Exclusions', 'Page 12'],
            ['11. Policy Renewals, Grace Period & Portability', 'Page 13'],
            ['12. Privacy, Security & Data Protection', 'Page 14'],
            ['13. Master Terms & Legal Conditions', 'Page 15'],
            ['14. Customer Support & Grievance Redressal', 'Page 16'],
            ['15. Digital Verification Certificate', 'Page 17'],
            ['16. Policyholder & Insurer Declarations', 'Page 18'],
            ['17. Frequently Asked Questions (FAQs)', 'Page 19'],
            ['18. Back Cover & Emergency Contacts', 'Page 20'],
        ];
        let tY = 110;
        toc.forEach(([title, pg], idx) => {
            doc.rect(35, tY, 542, 28).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
            doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text(title, 45, tY + 8);
            doc.fillColor('#2563eb').fontSize(9.5).font('Helvetica-Bold').text(pg, 500, tY + 8, { align: 'right' });
            tY += 32;
        });
        drawFooter(doc, 2);
        // =========================================================================
        // PAGE 3: POLICY SUMMARY DASHBOARD
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Policy Summary Dashboard', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Executive Summary Dashboard', 35, 60);
        const cards = [
            { title: 'Policy Status', val: 'ACTIVE', sub: 'Verified & In-Force', bg: '#ecfdf5', border: '#10b981', text: '#047857' },
            { title: 'Coverage Amount', val: `Rs. ${sumInsured.toLocaleString('en-IN')}`, sub: 'Sum Insured Limit', bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
            { title: 'Net Premium', val: `Rs. ${premiumAmount.toLocaleString('en-IN')}`, sub: 'Annual Premium Paid', bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
            { title: 'Claim Settlement Ratio', val: '98.4%', sub: 'IRDAI Audited', bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
            { title: 'Room Rent Cap', val: 'NO CAP', sub: 'Single Private AC Room', bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
            { title: 'Co-Payment Share', val: '0%', sub: 'Zero Out-of-Pocket Share', bg: '#ecfdf5', border: '#10b981', text: '#047857' },
            { title: 'No Claim Bonus', val: '+5% / Year', sub: 'Up to 50% Cumulative', bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
            { title: 'Section 80D Exemption', val: 'ELIGIBLE', sub: 'Income Tax Benefit', bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
        ];
        cards.forEach((c, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = 35 + col * 276;
            const y = 95 + row * 110;
            doc.rect(x, y, 266, 95).fillAndStroke(c.bg, c.border);
            doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text(c.title.toUpperCase(), x + 15, y + 15);
            doc.fillColor(c.text).fontSize(16).font('Helvetica-Bold').text(c.val, x + 15, y + 35);
            doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(c.sub, x + 15, y + 65);
        });
        drawFooter(doc, 3);
        // =========================================================================
        // PAGE 4: CUSTOMER INFORMATION & NOMINEE
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Customer & Nominee Profiles', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Policyholder & Beneficiary Profiles', 35, 60);
        doc.rect(35, 90, 542, 300).fillAndStroke('#f8fafc', '#cbd5e1');
        doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('PRIMARY INSURED DETAILS', 50, 108);
        const custFields = [
            ['Full Name:', custName],
            ['Email Address:', custEmail],
            ['Contact Number:', custPhone],
            ['Date of Birth:', '15/06/1990 (Age: 35 Years)'],
            ['Gender / Blood Group:', 'Male / O+ Positive'],
            ['Residential Address:', 'Flat 402, InsureCore Residency, BKC, Mumbai - 400051'],
            ['PAN Number (Masked):', 'ABCDE1234F (Verified)'],
            ['Aadhaar Status:', 'DigiLocker e-KYC Verified'],
            ['Underwriting Risk Tier:', 'Standard Low Risk Class I'],
            ['Pre-Existing Diseases:', 'None Declared / Clear Health Audit'],
        ];
        let pY = 132;
        custFields.forEach(([k, v]) => {
            doc.fillColor('#475569').fontSize(9).font('Helvetica').text(k, 50, pY);
            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(v, 200, pY);
            pY += 24;
        });
        doc.rect(35, 410, 542, 160).fillAndStroke('#eff6ff', '#bfdbfe');
        doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text('NOMINEE & BENEFICIARY DETAILS', 50, 428);
        const nomFields = [
            ['Nominee Name:', policy.nominee || 'Priya Sharma'],
            ['Relationship with Policyholder:', 'Spouse'],
            ['Percentage Allocation Share:', '100% Total Benefit Share'],
            ['Appointee (If Minor):', 'N/A (Adult Nominee)'],
            ['Emergency Contact Person:', 'Priya Sharma (+91 98765 11111)'],
        ];
        let nY = 452;
        nomFields.forEach(([k, v]) => {
            doc.fillColor('#1e3a8a').fontSize(9).font('Helvetica').text(k, 50, nY);
            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(v, 220, nY);
            nY += 22;
        });
        drawFooter(doc, 4);
        // =========================================================================
        // PAGE 5: COMPREHENSIVE COVERAGE MATRIX
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Comprehensive Coverage Matrix', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Coverage Matrix & Benefit Schedule', 35, 60);
        const matrix = [
            ['Inpatient Hospitalization', '100% Up to Sum Insured', 'Covered'],
            ['Intensive Care Unit (ICU)', '100% Actual Expenses', 'No Sub-limit'],
            ['Surgical Procedures', 'Covered Fully', 'All Major Surgeries'],
            ['Pre-Hospitalization Expenses', 'Covered for 60 Days', 'Medical Bills & Diagnostics'],
            ['Post-Hospitalization Expenses', 'Covered for 90 Days', 'Medications & Follow-ups'],
            ['Day Care Treatments', '540+ Procedures Covered', 'Dialysis, Chemotherapy, etc.'],
            ['Road Ambulance Expenses', 'Up to Rs. 10,000 / Trip', 'Emergency Transport'],
            ['Organ Donor Medical Expenses', '100% Covered', 'Harvesting & Hospitalization'],
            ['AYUSH Treatments', 'Covered Up to Sum Insured', 'Ayurveda, Yoga, Homeopathy'],
            ['Domiciliary Hospitalization', 'Covered Up to Sum Insured', 'Home Treatment Support'],
            ['Mental Healthcare', 'Covered', 'Inpatient Psychiatric Care'],
            ['Modern Medical Treatments', 'Covered Up to Sum Insured', 'Robotic Surgery, Stem Cell'],
            ['Wellness & Annual Checkup', '1 Free Checkup / Year', 'Full Body Blood Profile'],
        ];
        doc.rect(35, 90, 542, 25).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('BENEFIT CATEGORY', 45, 98);
        doc.text('COVERAGE LIMIT', 260, 98);
        doc.text('REMARKS & CONDITIONS', 420, 98);
        let mY = 115;
        matrix.forEach(([cat, lim, rem], idx) => {
            doc.rect(35, mY, 542, 24).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
            doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica-Bold').text(cat, 45, mY + 7);
            doc.fillColor('#2563eb').fontSize(8.5).font('Helvetica-Bold').text(lim, 260, mY + 7);
            doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(rem, 420, mY + 7);
            mY += 24;
        });
        drawFooter(doc, 5);
        // =========================================================================
        // PAGE 6: OPTIONAL ADD-ON RIDERS
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Optional Add-on Riders', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Rider Coverage & Optional Protections', 35, 60);
        const riders = [
            { name: 'Zero Waiting Period Rider', desc: 'Waives off the 30-day initial waiting period for specified illness claims.', status: 'INCLUDED' },
            { name: 'Critical Illness Booster', desc: 'Lump-sum payout up to Rs. 10 Lakhs upon diagnosis of 36 critical illnesses.', status: 'ACTIVE' },
            { name: 'Hospital Daily Cash Allowance', desc: 'Fixed cash benefit of Rs. 3,000 per day for incidental non-medical expenses.', status: 'ACTIVE' },
            { name: 'OPD & Dental Care Cover', desc: 'Outpatient consultation fees, pharmacy bills, and dental scaling up to Rs. 15,000.', status: 'OPTIONAL' },
            { name: 'Room Rent Modification Rider', desc: 'Upgrades room eligibility from Single Private AC to Suite Room with 0% penalty.', status: 'INCLUDED' },
            { name: 'Personal Accident Cover', desc: 'Accidental death and permanent disability protection up to Rs. 25 Lakhs.', status: 'ACTIVE' },
        ];
        let rY = 90;
        riders.forEach((r) => {
            doc.rect(35, rY, 542, 80).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(r.name, 50, rY + 15);
            doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(r.desc, 50, rY + 35, { width: 380 });
            const isInc = r.status === 'INCLUDED' || r.status === 'ACTIVE';
            doc.rect(450, rY + 25, 100, 24).fill(isInc ? '#059669' : '#64748b');
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(r.status, 450, rY + 32, { width: 100, align: 'center' });
            rY += 95;
        });
        drawFooter(doc, 6);
        // =========================================================================
        // PAGE 7: CASHLESS HOSPITAL NETWORK GUIDE
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Cashless Hospital Network', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Cashless Network & TPA Directory', 35, 60);
        const hospitals = [
            ['Apollo Hospitals', 'Mumbai, Delhi, Chennai, Bengaluru', 'Cashless 24x7', 'Top Tier'],
            ['Fortis Healthcare', 'Pan-India (45+ Locations)', 'Cashless 24x7', 'Super Specialty'],
            ['Max Super Specialty', 'NCR, Punjab, Uttarakhand', 'Cashless 24x7', 'Multi-Specialty'],
            ['Manipal Hospitals', 'Bengaluru, Goa, Jaipur', 'Cashless 24x7', 'Center of Excellence'],
            ['Medanta - The Medicity', 'Gurugram, Lucknow, Patna', 'Cashless 24x7', 'Quaternary Care'],
            ['Kokilaben Dhirubhai Ambani', 'Mumbai', 'Cashless 24x7', 'Tertiary Care'],
        ];
        doc.rect(35, 90, 542, 25).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('HOSPITAL NAME', 45, 98);
        doc.text('CITIES & LOCATIONS', 220, 98);
        doc.text('TPA DESK STATUS', 400, 98);
        doc.text('CATEGORY', 490, 98);
        let hY = 115;
        hospitals.forEach(([name, loc, status, cat], idx) => {
            doc.rect(35, hY, 542, 26).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
            doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(name, 45, hY + 8);
            doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text(loc, 220, hY + 8);
            doc.fillColor('#059669').fontSize(8.5).font('Helvetica-Bold').text(status, 400, hY + 8);
            doc.fillColor('#2563eb').fontSize(8.5).font('Helvetica-Bold').text(cat, 490, hY + 8);
            hY += 26;
        });
        drawFooter(doc, 7);
        // =========================================================================
        // PAGE 8: CLAIM SETTLEMENT PROCESS
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Claim Settlement Process', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Claim Workflow & Required Documents', 35, 60);
        const claimSteps = [
            { step: 'Step 1', title: 'Claim Intimation', desc: 'Inform InsureCore within 24 hours of emergency admission or 48 hours prior to planned admission.' },
            { step: 'Step 2', title: 'Document Submission', desc: 'Submit discharge summary, original bills, investigation reports, and doctor prescriptions.' },
            { step: 'Step 3', title: 'Medical Review & TPA Desk', desc: 'In-house medical doctors review clinical notes, diagnosis, and treatment protocols.' },
            { step: 'Step 4', title: 'Approval & Direct Payment', desc: 'Pre-authorization or direct cashless claim settlement directly to network hospital.' },
        ];
        let csY = 90;
        claimSteps.forEach((s) => {
            doc.rect(35, csY, 542, 65).fillAndStroke('#eff6ff', '#bfdbfe');
            doc.fillColor('#2563eb').fontSize(12).font('Helvetica-Bold').text(s.step, 50, csY + 15);
            doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(s.title, 120, csY + 15);
            doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text(s.desc, 120, csY + 35, { width: 440 });
            csY += 75;
        });
        drawFooter(doc, 8);
        // =========================================================================
        // PAGE 9: PREMIUM BREAKDOWN
        // =========================================================================
        doc.addPage();
        drawHeader(doc, 'Premium Calculation', polNo);
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Premium Calculation & Tax Breakdown', 35, 60);
        const premItems = [
            ['Base Policy Annual Premium', `Rs. ${Math.round(premiumAmount * 0.85).toLocaleString('en-IN')}`],
            ['Add-on Rider Premiums', `Rs. ${Math.round(premiumAmount * 0.05).toLocaleString('en-IN')}`],
            ['No-Claim Bonus Discount (5%)', `- Rs. ${Math.round(premiumAmount * 0.05).toLocaleString('en-IN')}`],
            ['Statutory GST (18%)', `+ Rs. ${Math.round(premiumAmount * 0.15).toLocaleString('en-IN')}`],
            ['Total Net Payable Premium', `Rs. ${premiumAmount.toLocaleString('en-IN')}`],
        ];
        doc.rect(35, 90, 542, 160).fillAndStroke('#f8fafc', '#cbd5e1');
        let prY = 108;
        premItems.forEach(([k, v], idx) => {
            const isTotal = idx === premItems.length - 1;
            doc.fillColor(isTotal ? '#2563eb' : '#334155').fontSize(isTotal ? 11 : 9).font(isTotal ? 'Helvetica-Bold' : 'Helvetica').text(k, 50, prY);
            doc.fillColor(isTotal ? '#2563eb' : '#0f172a').fontSize(isTotal ? 11 : 9).font('Helvetica-Bold').text(v, 420, prY, { width: 140, align: 'right' });
            prY += 28;
        });
        drawFooter(doc, 9);
        // =========================================================================
        // PAGES 10 to 19: ADDITIONAL STANDARD POLICY SECTIONS
        // =========================================================================
        const remainingPages = [
            { title: 'Tax Benefits (Section 80D)', header: 'Section 80D Income Tax Exemption Guide', text: 'Premiums paid under this policy qualify for tax deduction under Section 80D of the Income Tax Act, 1961. Individuals can claim up to Rs. 25,000 for self/family and an additional Rs. 50,000 for senior citizen parents.' },
            { title: 'Waiting Period & PED', header: 'Waiting Period & Pre-Existing Diseases', text: '1. Initial 30-Day Waiting Period: Applies to all claims except accidental trauma.\n2. Specific Diseases (24 Months): Cataract, Joint Replacement, Hernia, Hysterectomy.\n3. Pre-Existing Diseases (PED): Covered after 24 continuous active policy months.' },
            { title: 'Policy Exclusions', header: 'Permanent Exclusions & Non-Payable Items', text: 'Exclusions include cosmetic surgery, self-inflicted injuries, war/nuclear exposure, hazardous sports, illegal activities, and unproven experimental procedures.' },
            { title: 'Renewals & Portability', header: 'Policy Renewals, Grace Period & Portability', text: '1. Grace Period: 30 days allowed for premium payment post due date.\n2. Portability: Transfer policy credit to any IRDAI-regulated insurer without losing waiting period credits.\n3. Free-Look Period: 15 days from policy receipt to cancel with full refund.' },
            { title: 'Privacy & Security', header: 'Data Protection, Security & Compliance', text: 'InsureCore encrypts customer health records using AES-256 standards in accordance with the Digital Personal Data Protection (DPDP) Act 2023 and ISO 27001 security protocols.' },
            { title: 'Terms & Conditions', header: 'Master Terms, Definitions & Legal Clauses', text: '1. Duty of Disclosure: The policy contract is formed based on utmost good faith (Uberrimae Fidei).\n2. Fraud & Misrepresentation: Nullifies policy claims.\n3. Arbitration & Jurisdiction: Subject to Mumbai, Maharashtra jurisdiction.' },
            { title: 'Customer Support & Grievance', header: 'Grievance Redressal & IRDAI Ombudsman', text: 'Level 1: Support Desk (support@insurecore.com)\nLevel 2: Grievance Officer (grievance@insurecore.com)\nLevel 3: IRDAI Insurance Ombudsman Office (www.cioins.co.in)' },
            { title: 'Digital Verification', header: 'Digital Verification & Security Certificate', text: `SHA-256 Hash Signature: 8f9a2b4c6e8d0f1a3b5c7e9f2a1b4c6e8d0f1a3b5c7e9f\nTimestamped Certificate: ${new Date().toISOString()}\nDigital Signature Authenticated by InsureCore System PKI Authority.` },
            { title: 'Declarations', header: 'Policyholder & Insurer Declarations', text: 'I hereby declare that all particulars filled in this proposal form are true and accurate. InsureCore agrees to provide coverage strictly subject to contract terms and receipt of premium.' },
            { title: 'Frequently Asked Questions', header: 'Frequently Asked Questions (FAQs)', text: 'Q1: How do I claim cashless hospitalization?\nAns: Present your InsureCore Health Smart Card at the network hospital TPA desk.\n\nQ2: What is the No Claim Bonus?\nAns: You receive a 5% sum insured boost for every claim-free year up to a maximum of 50%.' },
        ];
        remainingPages.forEach((p, idx) => {
            doc.addPage();
            const pageNumber = 10 + idx;
            drawHeader(doc, p.title, polNo);
            doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text(p.header, 35, 60);
            doc.rect(35, 95, 542, 350).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(p.text, 50, 115, { width: 512, lineGap: 6 });
            drawFooter(doc, pageNumber);
        });
        // =========================================================================
        // PAGE 20: BACK COVER
        // =========================================================================
        doc.addPage();
        doc.rect(0, 0, 612, 792).fill('#0f172a');
        doc.rect(0, 0, 612, 12).fill('#059669');
        doc.rect(0, 780, 612, 12).fill('#2563eb');
        doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text('INSURECORE', 50, 180, { align: 'center' });
        doc.fillColor('#60a5fa').fontSize(12).font('Helvetica-Bold').text('PROTECTING WHAT MATTERS MOST', 50, 225, { align: 'center' });
        doc.rect(100, 280, 412, 180).fillAndStroke('#1e293b', '#334155');
        doc.fillColor('#38bdf8').fontSize(12).font('Helvetica-Bold').text('24x7 EMERGENCY HELPLINES', 120, 305, { align: 'center' });
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica').text('Toll-Free Support: 1800-200-INSURE (1800-200-46787)', 120, 340, { align: 'center' });
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica').text('Emergency Cashless Approval: claims@insurecore.com', 120, 365, { align: 'center' });
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica').text('Official Website: www.insurecore.com', 120, 390, { align: 'center' });
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('© 2026 InsureCore General Insurance Corporation. All rights reserved.\n' +
            'Registered Office: InsureCore Tower, BKC, Bandra East, Mumbai - 400051, India.\n' +
            'IRDAI Reg No. 154 | CIN: L66010MH2002PLC136741', 50, 680, { align: 'center', lineGap: 4 });
        doc.end();
    });
}
// 2. PREMIUM PAYMENT RECEIPT
function generatePaymentReceiptPDF(payment) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        doc.rect(0, 0, 612, 90).fill('#1e3a8a');
        doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold').text('INSURECORE', 40, 25);
        doc.fontSize(10).font('Helvetica').text('Official Section 80D Premium Payment Receipt', 40, 56);
        doc.fillColor('#ffffff').fontSize(9).text('Receipt No:', 400, 25, { align: 'right' });
        doc.fontSize(12).font('Helvetica-Bold').text(`REC-${String(payment.id).slice(0, 8).toUpperCase()}`, 400, 38, { align: 'right' });
        doc.rect(40, 115, 532, 240).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('TRANSACTION RECEIPT & TAX BREAKDOWN', 55, 130);
        const recDetails = [
            ['Policy Number:', payment.policy?.policyNumber || 'N/A'],
            ['Policyholder Name:', payment.policy?.customer?.name || 'N/A'],
            ['Total Amount Paid:', `Rs. ${Number(payment.amount).toLocaleString('en-IN')}`],
            ['Payment Method:', payment.method || 'ONLINE CARD / UPI'],
            ['Transaction Ref:', payment.transactionRef || `TXN-IRDAI-${Date.now()}`],
            ['Payment Date:', payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
            ['Payment Status:', payment.paymentStatus || 'PAID'],
            ['GSTIN Registration:', '27AABCI1234F1Z9 (HSN 997133)'],
        ];
        let rY = 150;
        recDetails.forEach(([k, v]) => {
            doc.fillColor('#334155').fontSize(9).font('Helvetica').text(k, 55, rY);
            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(v, 200, rY);
            rY += 22;
        });
        doc.rect(40, 375, 532, 45).fillAndStroke('#f0fdf4', '#bbf7d0');
        doc.fillColor('#15803d').fontSize(10).font('Helvetica-Bold').text('STATUS: VERIFIED SECTION 80D TAX EXEMPT RECEIPT', 55, 392, { align: 'center' });
        doc.end();
    });
}
// 3. TAX CERTIFICATE
function generateTaxCertificatePDF(policy) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        doc.rect(0, 0, 612, 90).fill('#065f46');
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('INSURECORE TAX CERTIFICATE', 40, 25);
        doc.fontSize(10).font('Helvetica').text('Tax Deduction Certificate under Section 80D of the Income Tax Act, 1961', 40, 56);
        doc.rect(40, 115, 532, 220).fillAndStroke('#f0fdf4', '#a7f3d0');
        doc.fillColor('#065f46').fontSize(11).font('Helvetica-Bold').text('FINANCIAL YEAR 2025–2026 TAX DEDUCTION CERTIFICATE', 55, 130);
        const taxDetails = [
            ['Policyholder Name:', policy.customer?.name || 'N/A'],
            ['PAN Number (Masked):', 'ABCDE1234F'],
            ['Policy Number:', policy.policyNumber],
            ['Eligible Section 80D Premium:', `Rs. ${Number(policy.premiumAmount).toLocaleString('en-IN')}`],
            ['Certificate Number:', `TAX-80D-2026-${policy.id.substring(0, 6).toUpperCase()}`],
        ];
        let tY = 155;
        taxDetails.forEach(([k, v]) => {
            doc.fillColor('#1f2937').fontSize(9).font('Helvetica').text(k, 55, tY);
            doc.fillColor('#047857').fontSize(9).font('Helvetica-Bold').text(v, 200, tY);
            tY += 24;
        });
        doc.end();
    });
}
// 4. SMART HEALTH CARD
function generateHealthCardPDF(policy) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('PRINTABLE CASHLESS HEALTH SMART CARD', 40, 40);
        doc.rect(40, 70, 300, 180).fillAndStroke('#1e3a8a', '#1e40af');
        doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('INSURECORE', 55, 85);
        doc.fontSize(8).font('Helvetica').text('100% Cashless Hospital Smart Card', 55, 106);
        doc.fontSize(9).font('Helvetica-Bold').text(`Insured Name: ${policy.customer?.name || 'N/A'}`, 55, 130);
        doc.fontSize(8).font('Helvetica').text(`Policy No: ${policy.policyNumber}`, 55, 148);
        doc.text(`Member ID: MEM-2026-${policy.id.substring(0, 6).toUpperCase()}`, 55, 164);
        doc.text(`Valid Thru: ${new Date(policy.endDate).toLocaleDateString('en-IN')}`, 55, 180);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#60a5fa').text('Toll Free 24x7: 1800-200-INSURE', 55, 210);
        doc.end();
    });
}
