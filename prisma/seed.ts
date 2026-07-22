import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding InsureCore database...');

  // Reset existing data
  await db.notification.deleteMany({});
  await db.auditLog.deleteMany({});
  await db.document.deleteMany({});
  await db.payment.deleteMany({});
  await db.claim.deleteMany({});
  await db.policy.deleteMany({});
  await db.customer.deleteMany({});
  await db.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Admin
  const admin = await db.user.create({
    data: {
      name: 'Alexander Pierce (Admin)',
      email: 'admin@insurecore.com',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
    },
  });

  // 2. Create Agents
  const agent1 = await db.user.create({
    data: {
      name: 'John Miller (Agent)',
      email: 'agent@insurecore.com',
      password: passwordHash,
      role: 'AGENT',
      phone: '+1 (555) 014-8899',
    },
  });

  const agent2 = await db.user.create({
    data: {
      name: 'Sarah Jenkins (Agent)',
      email: 'agent.sarah@insurecore.com',
      password: passwordHash,
      role: 'AGENT',
      phone: '+1 (555) 018-4422',
    },
  });

  // 3. Create Demo Customer user
  const demoCustomerUser = await db.user.create({
    data: {
      name: 'David Vance',
      email: 'customer@insurecore.com',
      password: passwordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 012-3456',
    },
  });

  const demoCustomer = await db.customer.create({
    data: {
      userId: demoCustomerUser.id,
      name: 'David Vance',
      email: 'customer@insurecore.com',
      phone: '+1 (555) 012-3456',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      dob: new Date('1988-06-15'),
      gender: 'Male',
      kycVerified: true,
    },
  });

  // 4. Create additional customers
  const sampleCustomersData = [
    { name: 'Emma Watson', email: 'emma.w@example.com', phone: '+1 (555) 234-5678', city: 'Chicago', state: 'IL' },
    { name: 'Michael Brown', email: 'm.brown@example.com', phone: '+1 (555) 345-6789', city: 'New York', state: 'NY' },
    { name: 'Sophia Martinez', email: 'sophia.m@example.com', phone: '+1 (555) 456-7890', city: 'Austin', state: 'TX' },
    { name: 'James Wilson', email: 'j.wilson@example.com', phone: '+1 (555) 567-8901', city: 'Seattle', state: 'WA' },
    { name: 'Olivia Taylor', email: 'olivia.t@example.com', phone: '+1 (555) 678-9012', city: 'Denver', state: 'CO' },
    { name: 'Liam Anderson', email: 'liam.a@example.com', phone: '+1 (555) 789-0123', city: 'Miami', state: 'FL' },
  ];

  const customers = [demoCustomer];

  for (const c of sampleCustomersData) {
    const cust = await db.customer.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: '100 Main St',
        city: c.city,
        state: c.state,
        pincode: '10001',
        dob: new Date('1992-03-22'),
        gender: 'Female',
        kycVerified: true,
      },
    });
    customers.push(cust);
  }

  // 5. Create Policies
  const policyPlans = [
    { type: 'HEALTH', plan: 'Executive Comprehensive Health Shield', sum: 250000, premium: 1450 },
    { type: 'LIFE', plan: 'Term Platinum Guarantee Policy', sum: 1000000, premium: 2400 },
    { type: 'MOTOR', plan: 'Full Vehicle Collision & Theft Cover', sum: 45000, premium: 850 },
    { type: 'HOME', plan: 'Property & Natural Disaster Shield', sum: 500000, premium: 1200 },
    { type: 'TRAVEL', plan: 'Worldwide International Travel Protection', sum: 100000, premium: 350 },
  ];

  const policyStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'RENEWAL_DUE', 'EXPIRED'];

  let policyCounter = 1;
  const createdPolicies = [];

  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i];
    const plan = policyPlans[i % policyPlans.length];
    const status = policyStatuses[i % policyStatuses.length];
    const agent = i % 2 === 0 ? agent1 : agent2;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (i + 1));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const pol = await db.policy.create({
      data: {
        policyNumber: `POL-2026-${String(policyCounter++).padStart(6, '0')}`,
        customerId: cust.id,
        agentId: agent.id,
        policyType: plan.type,
        planName: plan.plan,
        sumInsured: plan.sum,
        premiumAmount: plan.premium,
        premiumFrequency: 'YEARLY',
        startDate,
        endDate,
        status,
        nominee: 'Sarah Vance',
        payments: {
          create: [
            {
              amount: plan.premium,
              dueDate: startDate,
              paymentDate: startDate,
              paymentStatus: 'PAID',
              method: 'CARD',
              transactionRef: `TXN-INIT-${i + 1}`,
            },
            {
              amount: plan.premium,
              dueDate: endDate,
              paymentStatus: status === 'RENEWAL_DUE' ? 'OVERDUE' : 'PENDING',
            },
          ],
        },
      },
    });
    createdPolicies.push(pol);
  }

  // 6. Create Claims
  const claimReasons = [
    { reason: 'Accidental Vehicle Collision Rear Bumper Damage', amount: 3200, status: 'UNDER_REVIEW' },
    { reason: 'Emergency Hospitalization Medical Bill Reimbursement', amount: 8500, status: 'APPROVED', approved: 8000 },
    { reason: 'Water Pipe Burst Interior Home Restoration', amount: 12400, status: 'SUBMITTED' },
    { reason: 'Flight Cancellation & Lost Luggage Expense', amount: 950, status: 'SETTLED', approved: 950 },
    { reason: 'Routine Outpatient Health Claim', amount: 450, status: 'REJECTED' },
  ];

  for (let i = 0; i < claimReasons.length; i++) {
    const cData = claimReasons[i];
    const pol = createdPolicies[i % createdPolicies.length];

    await db.claim.create({
      data: {
        claimNumber: `CLM-2026-${String(i + 1).padStart(6, '0')}`,
        policyId: pol.id,
        claimAmount: cData.amount,
        approvedAmount: cData.approved || null,
        reason: cData.reason,
        description: 'Detailed evidence submitted by policy holder via InsureCore portal.',
        status: cData.status,
        reviewedById: agent1.id,
        reviewNotes: cData.status === 'APPROVED' ? 'Verified all medical bills and invoice receipts.' : undefined,
      },
    });
  }

  // 7. System Audit Logs
  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'System',
      entityId: 'ROOT',
      metadata: JSON.stringify({ message: 'InsureCore platform initial seed completed' }),
    },
  });

  // 8. Demo Notifications for Demo Customer
  await db.notification.createMany({
    data: [
      {
        userId: demoCustomerUser.id,
        title: 'Policy Active',
        message: 'Your Executive Comprehensive Health Shield policy is active and verified.',
        isRead: false,
      },
      {
        userId: demoCustomerUser.id,
        title: 'Premium Reminder',
        message: 'Upcoming annual premium payment of $1,450 is scheduled for next month.',
        isRead: false,
      },
    ],
  });

  console.log('✅ InsureCore database seed successfully executed!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@insurecore.com    / Password123!');
  console.log('  Agent:    agent.john@insurecore.com / Password123!');
  console.log('  Customer: customer@insurecore.com  / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
