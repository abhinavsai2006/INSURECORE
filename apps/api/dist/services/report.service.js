"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const db_1 = require("../db");
const pdf_lib_1 = require("pdf-lib");
const exceljs_1 = require("exceljs");
const date_fns_1 = require("date-fns");
const stream_1 = require("stream");
const util_1 = require("util");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
exports.reportService = {
    // Get overview statistics for dashboard
    getOverview: async () => {
        const [totalPolicies, activePolicies, expiredPolicies, cancelledPolicies, totalClaims, pendingClaims, approvedClaims, rejectedClaims, totalCustomers, totalPremiumCollected, totalClaimsPaid, newCustomersThisMonth] = await Promise.all([
            db_1.db.policy.count(),
            db_1.db.policy.count({ where: { status: 'ACTIVE' } }),
            db_1.db.policy.count({ where: { status: 'EXPIRED' } }),
            db_1.db.policy.count({ where: { status: 'CANCELLED' } }),
            db_1.db.claim.count(),
            db_1.db.claim.count({ where: { status: 'SUBMITTED' } }),
            db_1.db.claim.count({ where: { status: 'APPROVED' } }),
            db_1.db.claim.count({ where: { status: 'REJECTED' } }),
            db_1.db.customer.count(),
            db_1.db.payment.aggregate({
                _sum: { amount: true },
                where: { paymentStatus: 'PAID' }
            }).then(res => Number(_sum.amount) || 0),
            db_1.db.payment.aggregate({
                _sum: { amount: true },
                where: { paymentStatus: 'PAID' }
            }).then(res => Number(_sum.amount) || 0),
            db_1.db.customer.count({
                where: {
                    createdAt: {
                        gte: (0, date_fns_1.startOfMonth)(new Date())
                    }
                }
            })
        ]);
        return {
            totalPolicies,
            activePolicies,
            expiredPolicies,
            cancelledPolicies,
            totalClaims,
            pendingClaims,
            approvedClaims,
            rejectedClaims,
            totalCustomers,
            totalPremiumCollected: Math.round(totalPremiumCollected * 100) / 100,
            totalClaimsPaid: Math.round(totalClaimsPaid * 100) / 100,
            newCustomersThisMonth
        };
    },
    // Get policies report
    getPoliciesReport: async (filters) => {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.policyType) {
            where.policyType = filters.policyType;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const policies = await db_1.db.policy.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return policies.map(policy => ({
            id: policy.id,
            policyNumber: policy.policyNumber,
            customerName: policy.customer?.name || 'N/A',
            customerEmail: policy.customer?.email || 'N/A',
            agentName: policy.agent?.name || 'Unassigned',
            agentEmail: policy.agent?.email || 'N/A',
            policyType: policy.policyType,
            planName: policy.planName,
            sumInsured: policy.sumInsured,
            premiumAmount: policy.premiumAmount,
            premiumFrequency: policy.premiumFrequency,
            startDate: policy.startDate,
            endDate: policy.endDate,
            status: policy.status,
            createdAt: policy.createdAt
        }));
    },
    // Get claims report
    getClaimsReport: async (filters) => {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.startDate || filters.endDate) {
            where.submissionDate = {};
            if (filters.startDate) {
                where.submissionDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.submissionDate.lte = filters.endDate;
            }
        }
        const claims = await db_1.db.claim.findMany({
            where,
            include: {
                policy: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { submissionDate: 'desc' }
        });
        return claims.map(claim => ({
            id: claim.id,
            claimNumber: claim.claimNumber,
            policyNumber: claim.policy?.policyNumber || 'N/A',
            customerName: claim.policy?.customer?.name || 'N/A',
            customerEmail: claim.policy?.customer?.email || 'N/A',
            claimAmount: claim.claimAmount,
            approvedAmount: claim.approvedAmount, claim, : .approvedAmount,
            reason: claim.reason,
            description: claim.description.description,
            status: claim.status,
            submitted: claim, date,
            reviewedResolveddate: date
        }));
    }
};
premiums;
async (filters) => {
    const where = {};
    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }
    const payments = await db_1.db.payment.findMany({
        where,
        include: {
            policy: {
                include: {
                    customer: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return payments.map(payment => ({
        id: payment.id,
        policyNumber: payment.policy?.policyNumber || 'N/A',
        customerName: payment.policy?.customer?.name || 'N/A',
        customerEmail: payment.policy?.customer?.email || 'N/A',
        amount: payment.amount,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate,
        paymentStatus: payment.paymentStatus,
        method: payment.method,
        transactionRef: payment.transactionRef,
        createdAt: payment.createdAt
    }));
},
    // Get customer growth report
    getCustomerGrowthReport;
async (months = 12) => {
    const endDate = new Date();
    const startDate = (0, date_fns_1.subMonths)((0, date_fns_1.startOfMonth)(endDate), months - 1);
    // Generate monthly data points
    const monthlyData = [];
    let currentDate = (0, date_fns_1.startOfMonth)(startDate);
    while (currentDate <= endDate) {
        const nextMonth = addMonths(currentDate, 1);
        const count = await db_1.db.customer.count({
            where: {
                createdAt: {
                    gte: currentDate,
                    lt: nextMonth
                }
            }
        });
        monthlyData.push({
            month: (0, date_fns_1.format)(currentDate, 'MMM yyyy'),
            count
        });
        currentDate = nextMonth;
    }
    return monthlyData;
},
    // Generate PDF report
    generatePdfReport;
async (type, data) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
    const helveticaBoldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([600, 800]); // Letter size
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    let yPosition = height - margin;
    // Title
    page.drawText(`Insurance Report - ${type.toUpperCase()}`, {
        x: margin,
        y: yPosition,
        size: fontSize + 4,
        font: helveticaBoldFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    yOffset -= (fontSize + 10);
    // Date
    page.drawText(`Generated on: ${(0, date_fns_1.format)(new Date(), 'MMMM d, yyyy')}`, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    yPosition -= (fontSize + 20);
    // Column headers (simplified for example)
    if (type === 'policies') {
        const headers = ['Policy #', 'Customer', 'Type', 'Premium', 'Status', 'End Date'];
        const xPositions = [margin, margin + 80, margin + 200, margin + 300, margin + 400, margin + 500];
        // Draw headers
        headers.forEach((header, index) => {
            page.drawText(header, {
                x: xPositions[index],
                y: yPosition,
                size: fontSize,
                font: helveticaBoldFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0)
            });
        });
        yPosition -= (fontSize + 10);
        // Draw data rows
        data.forEach((item, rowIndex) => {
            // Check if we need a new page
            if (yPosition < margin + 100) {
                const newPage = pdfDoc.addPage([600, 800]);
                yPosition = newPage.getSize().height - margin;
            }
            const values = [
                item.policyNumber,
                `${item.customerName}`,
                item.policyType,
                `$${item.premiumAmount}`,
                item.status,
                (0, date_fns_1.format)(item.endDate, 'MM/dd/yyyy')
            ];
            values.forEach((value, colIndex) => {
                page.drawText(String(value), {
                    x: xPositions[colIndex],
                    y: yPosition,
                    size: fontSize,
                    font: timesRomanFont,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0)
                });
            });
            yPosition -= (fontSize + 8);
        });
    }
    // Similar logic for other report types would go here
    // For brevity, implementing a simple text-based report for other types
    if (type === 'overview') {
        // Add overview statistics
        const stats = data[0] || {}; // Assuming first item contains stats
        const statsLines = [
            `Total Policies: ${stats.totalPolicies || 0}`,
            `Active Policies: ${stats.activePolicies || 0}`,
            `Total Customers: ${stats.totalCustomers || 0}`,
            `Total Premium Collected: $${stats.totalPremiumCollected || 0}`,
            `Total Claims: ${stats.totalClaims || 0}`,
            `Pending Claims: ${stats.pendingClaims || 0}`
        ];
        statsLines.forEach((line, index) => {
            if (yPosition < margin + 100) {
                const newPage = pdfDoc.addPage([600, 800]);
                yPosition = newPage.getSize().height - margin;
            }
            page.drawText(line, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: timesRomanFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0)
            });
            yPosition -= (fontSize + 8);
        });
    }
    // Add more report types as needed...
    // Save PDF to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
},
    // Generate Excel report
    generateExcelReport;
async (type, data) => {
    const workbook = new exceljs_1.ExcelJS.Workbook();
    workbook.creator = 'InsureCore';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`);
    // Add title
    worksheet.mergeCells('A1:F1');
    const titleRow = worksheet.getRow(1);
    titleRow.value = `Insurance Report - ${type.toUpperCase()}`;
    titleRow.font = { size: 16, bold: true };
    titleRow.alignment = { horizontal: 'center' };
    // Add date
    worksheet.mergeCells('A2:F2');
    const dateRow = worksheet.getRow(2);
    dateRow.value = `Generated on: ${(0, date_fns_1.format)(new Date(), 'MMMM d, yyyy')}`;
    dateRow.font = { size: 12 };
    dateRow.alignment = { horizontal: 'center' };
    // Add headers based on type
    let headers = [];
    if (type === 'policies') {
        headers = ['Policy #', 'Customer Name', 'Customer Email', 'Agent Name', 'Policy Type', 'Plan Name', 'Sum Insured', 'Premium Amount', 'Frequency', 'Start Date', 'End Date', 'Status'];
    }
    else if (type === 'claims') {
        headers = ['Claim #', 'Policy #', 'Customer Name', 'Claim Amount', 'Approved Amount', 'Reason', 'Status', 'Submitted Date'];
    }
    else if (type === 'payments') {
        headers = ['Payment #', 'Policy #', 'Customer Name', 'Amount', 'Due Date', 'Payment Date', 'Status', 'Method', 'Transaction Ref'];
    }
    else if (type === 'overview') {
        // For overview, we'd typically have key-value pairs
        worksheet.getRow(4).value = ['Metric', 'Value'];
        worksheet.getRow(4).font = { bold: true };
        const stats = data[0] || {};
        const rows = [
            ['Total Policies', stats.totalPolicies || 0],
            ['Active Policies', stats.activePolicies || 0],
            ['Expired Policies', stats.expiredPolicies || 0],
            ['Cancelled Policies', stats.cancelledPolicies || 0],
            ['Total Customers', stats.totalCustomers || 0],
            ['New Customers This Month', stats.newCustomersThisMonth || 0],
            ['Total Claims', stats.totalClaims || 0],
            ['Pending Claims', stats.pendingClaims || 0],
            ['Approved Claims', stats.approvedClaims || 0],
            ['Rejected Claims', stats.rejectedClaims || 0],
            ['Total Premium Collected', `$${stats.totalPremiumCollected || 0}`],
            ['Total Claims Paid', `$${stats.totalClaimsPaid || 0}`]
        ];
        rows.forEach(([key, value], index) => {
            const rowNum = 5 + index;
            const row = worksheet.getRow(rowNum);
            row.values = [key, value];
        });
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = Math.max(column.header ? column.header.toString().length : 10, 15);
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    // Add headers for data reports
    if (headers.length > 0) {
        const headerRow = worksheet.getRow(4);
        headerRow.values = headers;
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
    }
    // Add data rows
    let rowIndex = 5;
    data.forEach(item => {
        const row = worksheet.getRow(rowIndex);
        let values = [];
        if (type === 'policies') {
            values = [
                item.policyNumber,
                item.customerName,
                item.customerEmail,
                item.agentName || 'Unassigned',
                item.policyType,
                item.planName,
                item.sumInsured,
                item.premiumAmount,
                item.premiumFrequency,
                (0, date_fns_1.format)(item.startDate, 'MM/dd/yyyy'),
                (0, date_fns_1.format)(item.endDate, 'MM/dd/yyyy'),
                item.status
            ];
        }
        else if (type === 'claims') {
            values = [
                item.claimNumber,
                item.policyNumber,
                item.customerName,
                item.claimAmount,
                item.approvedAmount || 0,
                item.reason,
                item.status,
                (0, date_fns_1.format)(item.submissionDate, 'MM/dd/yyyy')
            ];
        }
        else if (type === 'payments') {
            values = [
                item.id,
                item.policyNumber,
                item.customerName,
                item.amount,
                (0, date_fns_1.format)(item.dueDate, 'MM/dd/yyyy'),
                item.paymentDate ? (0, date_fns_1.format)(item.paymentDate, 'MM/dd/yyyy') : '',
                item.paymentStatus,
                item.method || '',
                item.transactionRef || ''
            ];
        }
        row.values = values;
        rowIndex++;
    });
    // Auto-fit columns for data reports
    if (headers.length > 0) {
        worksheet.columns.forEach((column, index) => {
            const maxLength = Math.max(...[column.header ? String(column.header).length : 10], ...(worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber >= 4) { // Skip header rows
                    const cellValue = row.getCell(index + 1);
                    return cellValue ? String(cellValue.value).length : 0;
                }
                return 0;
            }).map(({ value }) => value || 0)));
            column.width = Math.max(maxLength + 2, 15);
        });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};
;
