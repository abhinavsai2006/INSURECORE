"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePolicyPDF = generatePolicyPDF;
exports.generatePaymentReceiptPDF = generatePaymentReceiptPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generatePolicyPDF(policy) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        // Top Header Banner
        doc.rect(0, 0, 612, 80).fill('#1e3a8a');
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('INSURECORE', 50, 25);
        doc.fontSize(10).font('Helvetica').text('Official Certificate of Policy Coverage', 50, 52);
        doc.fillColor('#ffffff').fontSize(9).text('Document Ref:', 400, 25, { align: 'right' });
        doc.fontSize(11).font('Helvetica-Bold').text(`${policy.policyNumber}`, 400, 38, { align: 'right' });
        doc.moveDown(4);
        // Title Section
        doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text(`POLICY SCHEDULE — ${policy.policyType} INSURANCE`, 50, 105);
        doc.fillColor('#2563eb').fontSize(11).font('Helvetica-Bold').text(`Status: ${String(policy.status).toUpperCase()}`, 50, 126);
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 142).lineTo(562, 142).stroke();
        // Details Grid Box
        doc.rect(50, 155, 512, 220).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
        doc.text('INSURED DETAILS', 65, 170);
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(`Policyholder Name:`, 65, 190);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${policy.customer?.name || 'N/A'}`, 180, 190);
        doc.font('Helvetica').fillColor('#334155').text(`Customer Email:`, 65, 210);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${policy.customer?.email || 'N/A'}`, 180, 210);
        doc.font('Helvetica').fillColor('#334155').text(`Phone Number:`, 65, 230);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${policy.customer?.phone || 'N/A'}`, 180, 230);
        doc.font('Helvetica').fillColor('#334155').text(`Primary Nominee:`, 65, 250);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${policy.nominee || 'N/A'}`, 180, 250);
        doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(65, 270).lineTo(547, 270).stroke();
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
        doc.text('COVERAGE & PREMIUM SCHEDULE', 65, 280);
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(`Plan Coverage Name:`, 65, 300);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${policy.planName}`, 180, 300);
        doc.font('Helvetica').fillColor('#334155').text(`Sum Insured / Limit:`, 65, 320);
        doc.font('Helvetica-Bold').fillColor('#2563eb').text(`$${Number(policy.sumInsured).toLocaleString()}`, 180, 320);
        doc.font('Helvetica').fillColor('#334155').text(`Annual Premium:`, 65, 340);
        doc.font('Helvetica-Bold').fillColor('#2563eb').text(`$${Number(policy.premiumAmount).toLocaleString()} (${policy.premiumFrequency})`, 180, 340);
        doc.font('Helvetica').fillColor('#334155').text(`Policy Coverage Term:`, 65, 360);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${new Date(policy.startDate).toLocaleDateString()} to ${new Date(policy.endDate).toLocaleDateString()}`, 180, 360);
        // Terms Box
        doc.rect(50, 390, 512, 100).fillAndStroke('#eff6ff', '#bfdbfe');
        doc.fillColor('#1e40af').fontSize(9).font('Helvetica-Bold').text('POLICYHOLDER NOTICE & STIPULATIONS:', 65, 402);
        doc.fillColor('#1e3a8a').fontSize(8).font('Helvetica').text('1. This policy schedule constitutes an official certificate of insurance issued by InsureCore Platform.\n' +
            '2. Claims must be submitted within 30 days of any covered event along with supporting documents.\n' +
            '3. Keep this certificate for identity verification and hospital / garage cashless claim processing.\n' +
            '4. Premium payments must be maintained on schedule to prevent coverage lapse.', 65, 418, { width: 480, lineGap: 3 });
        // Stamp / Verification Footer
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Digitally Authenticated Certificate — InsureCore Security Operations', 50, 700, { align: 'center' });
        doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 715).lineTo(562, 715).stroke();
        doc.fillColor('#94a3b8').fontSize(7).text('InsureCore Global Financial Services Inc. • All Rights Reserved', 50, 725, { align: 'center' });
        doc.end();
    });
}
function generatePaymentReceiptPDF(payment) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));
        // Top Header Banner
        doc.rect(0, 0, 612, 80).fill('#1e3a8a');
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('INSURECORE', 50, 25);
        doc.fontSize(10).font('Helvetica').text('Official Premium Payment Receipt', 50, 52);
        doc.fillColor('#ffffff').fontSize(9).text('Receipt No:', 400, 25, { align: 'right' });
        doc.fontSize(11).font('Helvetica-Bold').text(`REC-${String(payment.id).slice(0, 8).toUpperCase()}`, 400, 38, { align: 'right' });
        // Details Grid Box
        doc.rect(50, 110, 512, 180).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
        doc.text('TRANSACTION RECEIPT DETAILS', 65, 125);
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(`Policy Number:`, 65, 145);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${payment.policy?.policyNumber || 'N/A'}`, 180, 145);
        doc.font('Helvetica').fillColor('#334155').text(`Policyholder Name:`, 65, 165);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${payment.policy?.customer?.name || 'N/A'}`, 180, 165);
        doc.font('Helvetica').fillColor('#334155').text(`Amount Received:`, 65, 185);
        doc.font('Helvetica-Bold').fillColor('#2563eb').fontSize(11).text(`$${Number(payment.amount).toLocaleString()}`, 180, 183);
        doc.font('Helvetica').fontSize(9).fillColor('#334155').text(`Payment Method:`, 65, 205);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${payment.method || 'ONLINE CARD'}`, 180, 205);
        doc.font('Helvetica').fillColor('#334155').text(`Transaction Ref:`, 65, 225);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${payment.transactionRef || 'TXN-' + Date.now()}`, 180, 225);
        doc.font('Helvetica').fillColor('#334155').text(`Payment Date:`, 65, 245);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 180, 245);
        doc.font('Helvetica').fillColor('#334155').text(`Payment Status:`, 65, 265);
        doc.font('Helvetica-Bold').fillColor('#15803d').text(`${payment.paymentStatus}`, 180, 265);
        // Confirmation Stamp
        doc.rect(50, 310, 512, 50).fillAndStroke('#f0fdf4', '#bbf7d0');
        doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold').text('STATUS: PAYMENT VERIFIED & CONFIRMED', 65, 328, { align: 'center' });
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Thank you for choosing InsureCore. Keep this receipt for tax and accounting records.', 50, 700, { align: 'center' });
        doc.end();
    });
}
