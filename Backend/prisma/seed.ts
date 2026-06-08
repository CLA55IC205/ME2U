/**
 * ME2U seed — creates dev users (Chanda/TechZone/Admin)
 * and a handful of sample orders in different lifecycle stages.
 *
 * Run:  cd Backend && npx prisma db seed
 *       (or via: npm run db:seed)
 */
import { PrismaClient, UserRole, OrderStatus, PaymentStatus, WalletProvider, LedgerType, DisputeStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding ME2U database…');

  // ── Users ──────────────────────────────────────────────────────────────
  const buyer = await prisma.user.upsert({
    where: { phone: '260971000001' },
    update: {},
    create: {
      phone: '260971000001',
      name: 'Chanda Mutale',
      role: UserRole.BUYER,
    },
  });

  const seller = await prisma.user.upsert({
    where: { phone: '260955000002' },
    update: {},
    create: {
      phone: '260955000002',
      name: 'TechZone Lusaka',
      role: UserRole.SELLER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { phone: '260900000099' },
    update: {},
    create: {
      phone: '260900000099',
      name: 'ME2U Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log(`  ✓ Users: ${buyer.name}, ${seller.name}, ${admin.name}`);

  // ── Helper: delete any leftover seed orders so re-seeding is safe ──────
  await prisma.escrowLedgerEntry.deleteMany({});
  await prisma.deliveryEvent.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});

  // ── Order 1 — IN_TRANSIT with tracking ────────────────────────────────
  const o1 = await prisma.order.create({
    data: {
      publicId: 'ME2U-0001',
      buyerId: buyer.id,
      sellerId: seller.id,
      itemDescription: 'Wireless Earbuds (2×)',
      amountZmw: new Decimal(450.00),
      status: OrderStatus.IN_TRANSIT,
      paymentProvider: WalletProvider.AIRTEL,
      origin: 'Lusaka CBD',
      destination: 'Chilenje, Lusaka',
      courier: 'Zampost',
      trackingNumber: 'ZAM-2947831',
      dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      arrivalAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      autoReleaseAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      payment: {
        create: {
          status: PaymentStatus.ESCROWED,
          provider: WalletProvider.AIRTEL,
          escrowedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      events: {
        createMany: {
          data: [
            { title: 'Order created', detail: 'Buyer placed order via ME2U', occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { title: 'Payment escrowed', detail: 'K 450.00 held by ME2U', occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
            { title: 'Parcel dispatched', detail: 'Via Zampost', occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { title: 'Arrived at destination', detail: 'Seller marked arrival in Chilenje', occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
          ],
        },
      },
    },
  });
  await prisma.escrowLedgerEntry.create({
    data: { orderId: o1.id, type: LedgerType.HOLD, amountZmw: new Decimal(450.00), note: 'Payment confirmed — funds held in escrow' },
  });

  // ── Order 2 — AWAITING_DISPATCH ────────────────────────────────────────
  const o2 = await prisma.order.create({
    data: {
      publicId: 'ME2U-0002',
      buyerId: buyer.id,
      sellerId: seller.id,
      itemDescription: 'Laptop Stand (aluminium)',
      amountZmw: new Decimal(320.00),
      status: OrderStatus.AWAITING_DISPATCH,
      paymentProvider: WalletProvider.MTN,
      origin: 'Lusaka CBD',
      destination: 'Kabulonga, Lusaka',
      payment: {
        create: {
          status: PaymentStatus.ESCROWED,
          provider: WalletProvider.MTN,
          escrowedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });
  await prisma.escrowLedgerEntry.create({
    data: { orderId: o2.id, type: LedgerType.HOLD, amountZmw: new Decimal(320.00), note: 'Payment confirmed — funds held in escrow' },
  });

  // ── Order 3 — DELIVERED ────────────────────────────────────────────────
  const deliveredAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const o3 = await prisma.order.create({
    data: {
      publicId: 'ME2U-0003',
      buyerId: buyer.id,
      sellerId: seller.id,
      itemDescription: 'USB-C Hub (7-port)',
      amountZmw: new Decimal(185.00),
      status: OrderStatus.DELIVERED,
      paymentProvider: WalletProvider.AIRTEL,
      origin: 'Lusaka CBD',
      destination: 'Woodlands, Lusaka',
      courier: "Seller's own driver",
      dispatchedAt: new Date(deliveredAt.getTime() - 2 * 24 * 60 * 60 * 1000),
      buyerConfirmedAt: deliveredAt,
      payment: {
        create: {
          status: PaymentStatus.RELEASED,
          provider: WalletProvider.AIRTEL,
          escrowedAt: new Date(deliveredAt.getTime() - 3 * 24 * 60 * 60 * 1000),
          releasedAt: deliveredAt,
        },
      },
    },
  });
  await prisma.escrowLedgerEntry.createMany({
    data: [
      { orderId: o3.id, type: LedgerType.HOLD, amountZmw: new Decimal(185.00), note: 'Payment confirmed — funds held in escrow' },
      { orderId: o3.id, type: LedgerType.RELEASE, amountZmw: new Decimal(185.00), note: 'Buyer confirmed receipt' },
    ],
  });

  // ── Order 4 — DISPUTE ─────────────────────────────────────────────────
  const o4 = await prisma.order.create({
    data: {
      publicId: 'ME2U-0004',
      buyerId: buyer.id,
      sellerId: seller.id,
      itemDescription: 'Mechanical Keyboard',
      amountZmw: new Decimal(780.00),
      status: OrderStatus.DISPUTE,
      paymentProvider: WalletProvider.MTN,
      origin: 'Lusaka CBD',
      destination: 'Emmasdale, Lusaka',
      courier: 'Zampost',
      trackingNumber: 'ZAM-1122334',
      dispatchedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      payment: {
        create: {
          status: PaymentStatus.ESCROWED,
          provider: WalletProvider.MTN,
          escrowedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      dispute: {
        create: {
          raisedById: buyer.id,
          reason: 'Package arrived damaged',
          detail: 'Keyboard has broken keycaps and the USB cable is missing.',
          status: DisputeStatus.OPEN,
        },
      },
    },
  });
  await prisma.escrowLedgerEntry.create({
    data: { orderId: o4.id, type: LedgerType.HOLD, amountZmw: new Decimal(780.00), note: 'Payment confirmed — funds held in escrow' },
  });

  // ── Order 5 — PAYMENT_PENDING ──────────────────────────────────────────
  await prisma.order.create({
    data: {
      publicId: 'ME2U-0005',
      buyerId: buyer.id,
      sellerId: seller.id,
      itemDescription: 'Smartphone Case (iPhone 15)',
      amountZmw: new Decimal(95.00),
      status: OrderStatus.PAYMENT_PENDING,
      paymentProvider: WalletProvider.AIRTEL,
      origin: 'Lusaka CBD',
      destination: 'Chelstone, Lusaka',
      payment: {
        create: {
          status: PaymentStatus.PENDING,
          provider: WalletProvider.AIRTEL,
        },
      },
    },
  });

  console.log('  ✓ 5 sample orders created across all lifecycle stages');
  console.log('\n🎉  Seed complete!\n');
  console.log('  Dev users:');
  console.log(`    Buyer  → ${buyer.name}  (phone: ${buyer.phone})`);
  console.log(`    Seller → ${seller.name} (phone: ${seller.phone})`);
  console.log(`    Admin  → ${admin.name} (phone: ${admin.phone})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
